# RAG Security Guardrail Checklist

This checklist should be referenced in future Cursor prompts when working on RAG-related features or any Supabase RLS policies.

## Core Security Principles

### ✅ Never Use Service Role on Public Endpoints for Reads
- **Rule**: Service role bypasses RLS completely. Never use it on public (unauthenticated) endpoints to read data.
- **Exception**: Service role is acceptable for INSERT-only public endpoints (e.g., analytics tracking).
- **Check**: Verify all `/api` routes that don't require auth only use service role for writes, not reads.

### ✅ Only Use Anon Client on Public Pages
- **Rule**: Public pages (landing page, public routes) must use `createClient()` from `@/lib/supabase/server`, which uses the anon key.
- **Check**: Verify `src/app/(public)/*` pages use `createClient()`, not `createServiceRoleClient()`.

### ✅ Any "Authenticated Can Read All" Policy Must Be Admin-Checked or Removed
- **Rule**: Policies like `USING (auth.uid() IS NOT NULL)` grant access to ALL authenticated users, bypassing ownership checks.
- **Fix**: Replace with KB ownership/visibility checks or remove if not needed.
- **Check**: Search migrations for `auth.uid() IS NOT NULL` and verify each is necessary and properly scoped.

### ✅ Keep RAG Table Access Controlled via KB Visibility/Ownership
- **Rule**: All RAG tables (rag_documents, rag_chunks, rag_runs, etc.) must check parent KB visibility/ownership.
- **Pattern**: 
  ```sql
  USING (
    EXISTS (
      SELECT 1 FROM public.rag_knowledge_bases kb
      WHERE kb.id = <parent_kb_id>
        AND (
          kb.visibility = 'public'
          OR (
            kb.visibility = 'private'
            AND (kb.owner_user_id = auth.uid() OR kb.created_by = auth.uid())
          )
        )
    )
  )
  ```
- **Check**: Verify all RAG table SELECT policies follow this pattern.

### ✅ Test RLS Policies with Both Authenticated and Anonymous Users
- **Rule**: Policies behave differently for `anon` vs `authenticated` roles.
- **Check**: 
  - Anonymous users can only access public KBs
  - Authenticated users can access public KBs + private KBs they own
  - Authenticated users cannot access private KBs they don't own

### ✅ Verify Policies Don't Create OR Conditions That Bypass Restrictions
- **Rule**: PostgreSQL RLS combines policies with OR logic. Multiple SELECT policies = if ANY matches, access is granted.
- **Risk**: A broad policy + restrictive policy = broad policy wins (defeats the restrictive one).
- **Check**: Review all policies on a table. If multiple SELECT policies exist, ensure none are overly broad.

## RAG-Specific Checks

### ✅ All RAG Tables Have RLS Enabled
- **Tables**: rag_knowledge_bases, rag_documents, rag_chunks, rag_document_sections, rag_runs, rag_run_outputs, rag_run_documents
- **Check**: Verify `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` in migrations.

### ✅ Knowledge Base Visibility is Enforced
- **Public KBs**: Accessible to anonymous and authenticated users
- **Private KBs**: Only accessible to owners (owner_user_id or created_by = auth.uid())
- **Check**: Verify all RAG table policies check KB visibility before granting access.

### ✅ Run Tracking Tables Respect Parent KB Access
- **rag_runs**: Check parent KB visibility/ownership
- **rag_run_outputs**: Check parent run's KB visibility/ownership
- **rag_run_documents**: Check parent run's KB visibility/ownership
- **Check**: Verify policies join through parent tables to check KB access.

## Code Review Checklist

When reviewing RAG-related code:

- [ ] No service role client used on public routes for reads
- [ ] Public pages use anon client only
- [ ] All RAG queries respect RLS (use anon client, not service role, unless in authenticated admin route)
- [ ] New RLS policies follow KB visibility/ownership pattern
- [ ] No broad `auth.uid() IS NOT NULL` policies without ownership checks
- [ ] Policies are tested with both anon and authenticated users
- [ ] Multiple policies on same table don't create unintended OR conditions

## Migration Checklist

When creating RLS policy migrations:

- [ ] Drop old policies before creating new ones (use `DROP POLICY IF EXISTS`)
- [ ] Follow existing pattern from `rag_docs_select_via_kb` for consistency
- [ ] Include comments explaining policy logic
- [ ] Test migration on development database first
- [ ] Verify policies work for both anon and authenticated roles
- [ ] Check that policies don't break existing functionality

## Common Mistakes to Avoid

❌ **Don't**: Use `auth.uid() IS NOT NULL` for "all authenticated users" access
✅ **Do**: Check KB ownership: `(kb.owner_user_id = auth.uid() OR kb.created_by = auth.uid())`

❌ **Don't**: Use service role on public endpoints to read data
✅ **Do**: Use anon client and let RLS enforce access

❌ **Don't**: Create separate policies for anon/authenticated that duplicate logic
✅ **Do**: Use `TO anon, authenticated` with conditional logic in USING clause

❌ **Don't**: Assume "all authenticated users are admins" in policies
✅ **Do**: Enforce ownership/visibility checks even for authenticated users

## Quick Reference: Policy Pattern

```sql
-- Good: KB visibility/ownership check
CREATE POLICY "rag_table_select_via_kb"
ON public.rag_table
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.rag_knowledge_bases kb
    WHERE kb.id = rag_table.knowledge_base_id
      AND (
        kb.visibility = 'public'
        OR (
          kb.visibility = 'private'
          AND (kb.owner_user_id = auth.uid() OR kb.created_by = auth.uid())
        )
      )
  )
);

-- Bad: Broad authenticated access
CREATE POLICY "rag_table_select_all"
ON public.rag_table
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);  -- ❌ Too permissive!
```

## When to Use Service Role

✅ **Acceptable uses:**
- Authenticated admin routes (after auth check)
- Public INSERT-only endpoints (analytics tracking)
- Background jobs/server-side operations with proper auth checks

❌ **Never use for:**
- Public read endpoints
- Landing page data fetching
- Any operation that should respect RLS

---

**Last Updated**: 2025-12-30
**Related**: See `RAG_SECURITY_FUTURE_IMPROVEMENTS.md` for multi-tenant hardening plans

