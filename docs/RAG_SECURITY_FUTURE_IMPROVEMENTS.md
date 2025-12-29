# RAG Security: Future Improvements

This document outlines planned security and feature improvements for the RAG system that are not yet implemented.

## 1. Multi-KB Run Referencing

### Current State
- Each `rag_run` references a single `knowledge_base_id`
- The `metadata` field stores `used_knowledge_base_ids` array for tracking purposes
- No formal relationship exists between runs and multiple knowledge bases

### Future Enhancement
Create a junction table `rag_run_kbs` to formally support runs that reference multiple knowledge bases:

```sql
CREATE TABLE public.rag_run_kbs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.rag_runs(id) ON DELETE CASCADE,
  knowledge_base_id UUID NOT NULL REFERENCES public.rag_knowledge_bases(id) ON DELETE CASCADE,
  role TEXT, -- optional: 'primary' | 'secondary' | 'reference'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(run_id, knowledge_base_id)
);
```

### Benefits
- Formal many-to-many relationship between runs and knowledge bases
- Better querying and filtering capabilities
- Clearer data model for multi-KB operations
- Easier to enforce RLS policies on run-KB relationships

### RLS Considerations
- Policies should check access to ALL referenced knowledge bases
- A run should only be readable if the user has access to at least one of its referenced KBs
- Write operations should require ownership of the primary KB

### Implementation Notes
- Migration should backfill existing runs based on `knowledge_base_id` and `metadata.used_knowledge_base_ids`
- Update application code to use junction table instead of metadata array
- Consider deprecating `rag_runs.knowledge_base_id` in favor of junction table (requires careful migration)

---

## 2. Multi-Tenant Hardening

### Current State
- Single-tenant assumption: all authenticated users can access all private KBs they own
- No organization/team isolation
- No role-based access control within organizations

### Future Requirements

#### 2.1 Add Organization/Team Scoping

**Schema Changes:**
```sql
-- Add organization support to knowledge bases
ALTER TABLE public.rag_knowledge_bases
  ADD COLUMN org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;

-- Create organization membership table
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);
```

#### 2.2 Update RLS Policies

**Remove broad authenticated policies:**
- All policies using `auth.uid() IS NOT NULL` must be replaced
- No "any authenticated user" access patterns

**Enforce organization membership:**
```sql
-- Example: KB select policy with org membership check
CREATE POLICY "rag_kb_select_org_member"
ON public.rag_knowledge_bases
FOR SELECT
TO authenticated
USING (
  -- Public KBs accessible to all
  visibility = 'public'
  OR
  -- Private KBs: user must be owner OR org member
  (
    visibility = 'private'
    AND (
      owner_user_id = auth.uid()
      OR created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.org_id = rag_knowledge_bases.org_id
          AND om.user_id = auth.uid()
      )
    )
  )
);
```

#### 2.3 Role-Based Access Control

**Within organizations:**
- **Owner**: Full access to all KBs in org
- **Admin**: Can create/edit KBs, manage members
- **Member**: Can create/edit own KBs, view org KBs
- **Viewer**: Read-only access to org KBs

**Implementation:**
- Add role checks to RLS policies
- Update application code to check roles before write operations
- Consider adding `org_role` and `team_role` columns for granular control

#### 2.4 Migration Strategy

1. **Phase 1: Add org_id columns**
   - Create organizations/teams tables
   - Add org_id to rag_knowledge_bases (nullable initially)
   - Backfill: assign all existing KBs to a default org or user's personal org

2. **Phase 2: Update policies**
   - Add org membership checks to all RLS policies
   - Remove broad authenticated policies
   - Test with existing data

3. **Phase 3: Add role-based access**
   - Create organization_members table
   - Update policies to check roles
   - Update application code for role checks

4. **Phase 4: Enforce multi-tenancy**
   - Make org_id required (non-nullable)
   - Remove single-tenant assumptions from code
   - Add org context to all queries

### Security Considerations

- **Data isolation**: Ensure users cannot access other orgs' data
- **Policy testing**: Test all policies with users from different orgs
- **Service role**: Service role should still bypass RLS (admin operations)
- **Audit logging**: Track org-scoped access for compliance

---

## 3. Implementation Priority

1. **High Priority**: Multi-tenant hardening (if multi-tenant support is needed)
2. **Medium Priority**: Multi-KB run referencing (if multi-KB runs become common)
3. **Low Priority**: Advanced role-based access (if fine-grained permissions needed)

---

## 4. Breaking Changes

When implementing multi-tenant hardening:
- Existing single-tenant code will need updates
- RLS policies will become more restrictive
- Application code must pass org context to queries
- Migration requires careful data backfilling

---

## 5. Testing Requirements

For multi-tenant implementation:
- Test RLS policies with users from different orgs
- Verify data isolation between orgs
- Test role-based access restrictions
- Verify service role still works for admin operations
- Test anonymous access to public KBs (should remain unchanged)

