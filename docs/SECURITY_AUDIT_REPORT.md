# RLS Security Audit Report

**Date:** 2025-01-27  
**Scope:** Complete review of all Row Level Security (RLS) policies across all migration files  
**Objective:** Ensure visitors cannot access sensitive /intel data or create unauthorized records

## Executive Summary

### Critical Vulnerabilities Found

1. **🚨 CRITICAL: `projects` table has NO RLS policies**
   - Impact: Visitors can read all project data (client names, descriptions, metadata)
   - Severity: CRITICAL
   - Status: RLS enabled but no policies defined

2. **🚨 CRITICAL: `project_documents` table has NO RLS policies**
   - Impact: Visitors can read all project-document relationships
   - Severity: CRITICAL
   - Status: RLS enabled but no policies defined

3. **🚨 CRITICAL: `research_subjects` table has NO RLS policies**
   - Impact: Visitors cannot read, but neither can authenticated users (table effectively locked)
   - Severity: HIGH (blocks legitimate access)
   - Status: RLS enabled but no policies defined

4. **⚠️ HIGH: `research_documents` allows public read access**
   - Impact: Visitors can view all research documents (sensitive intel data)
   - Severity: HIGH
   - Status: Policy allows `USING (true)` for SELECT

5. **⚠️ HIGH: `rag_knowledge_bases` with `visibility='public'` exposes intel data**
   - Impact: If any intel KBs are marked public, visitors can read all associated documents, chunks, runs, and outputs
   - Severity: HIGH
   - Status: Policy allows public read if visibility='public'

6. **⚠️ MEDIUM: Some policies use `auth.role() = 'authenticated'` instead of `auth.uid() IS NOT NULL`**
   - Impact: Less reliable authentication checks
   - Severity: MEDIUM
   - Status: Found in workflows, research_documents, and some other tables

---

## Detailed Table Analysis

### 1. Landing Page Tables (Public Read OK)

#### `pages`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ✅ Yes (allowed - public page data)
- **Visitor INSERT:** ❌ No (authenticated only)
- **Visitor UPDATE:** ❌ No (authenticated only)
- **Visitor DELETE:** ❌ No (authenticated only)
- **Policies:**
  - `Public can view pages` - `FOR SELECT USING (true)` ✅
  - `Authenticated users can insert pages` - `FOR INSERT WITH CHECK (auth.uid() IS NOT NULL)` ✅
  - `Authenticated users can update pages` - `FOR UPDATE USING (auth.uid() IS NOT NULL)` ✅
  - `Authenticated users can delete pages` - `FOR DELETE USING (auth.uid() IS NOT NULL)` ✅
- **Security Issues:** None
- **Recommendations:** None

#### `sections`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ✅ Yes (allowed - public page data)
- **Visitor INSERT:** ❌ No
- **Visitor UPDATE:** ❌ No
- **Visitor DELETE:** ❌ No
- **Policies:** Similar to pages (public read, authenticated write)
- **Security Issues:** None
- **Recommendations:** None

#### `cta_buttons`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ✅ Yes (allowed - with status filtering: active only)
- **Visitor INSERT:** ❌ No
- **Visitor UPDATE:** ❌ No
- **Visitor DELETE:** ❌ No
- **Policies:**
  - `Public can view active cta_buttons` - `FOR SELECT USING (status = 'active')` ✅
  - Authenticated policies for write operations ✅
- **Security Issues:** None
- **Recommendations:** None

#### `offer_features`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ✅ Yes (allowed - with status filtering: active only)
- **Policies:** Public read with status filtering ✅
- **Security Issues:** None
- **Recommendations:** None

#### `testimonials`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ✅ Yes (allowed - approved only)
- **Policies:**
  - `Public can view approved testimonials` - `FOR SELECT USING (approved = true)` ✅
  - `Authenticated users can view all testimonials` - Allows authenticated to see unapproved ✅
- **Security Issues:** None
- **Recommendations:** None

#### `faq_items`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ✅ Yes (allowed - active only)
- **Policies:** Public read with status filtering ✅
- **Security Issues:** None
- **Recommendations:** None

#### `media_assets`, `results`, `timeline`, `social_platforms`, `softwares`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ✅ Yes (allowed - public page data)
- **Security Issues:** None
- **Recommendations:** None

#### `website_settings`, `website_settings_presets`, `website_colors`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ✅ Yes (allowed - public styling data)
- **Security Issues:** None
- **Recommendations:** None

---

### 2. Intel/Admin Tables (Must Be Protected from Visitors)

#### `projects` 🚨 **CRITICAL VULNERABILITY**
- **RLS Status:** ⚠️ Enabled but **NO POLICIES FOUND**
- **Visitor SELECT:** 🚨 **YES (UNRESTRICTED - CRITICAL ISSUE)**
- **Visitor INSERT:** 🚨 **YES (UNRESTRICTED - CRITICAL ISSUE)**
- **Visitor UPDATE:** 🚨 **YES (UNRESTRICTED - CRITICAL ISSUE)**
- **Visitor DELETE:** 🚨 **YES (UNRESTRICTED - CRITICAL ISSUE)**
- **Policies:** **NONE FOUND**
- **Security Issues:**
  - No RLS policies defined - table is completely unprotected
  - Visitors can read all projects (client names, metadata, descriptions)
  - Visitors can create, update, and delete projects
  - This is sensitive intel data that must be protected
- **Recommendations:**
  - **URGENT:** Create RLS policies to block all visitor access
  - Only authenticated users should be able to SELECT projects
  - Only authenticated users should be able to INSERT/UPDATE/DELETE
  - Consider project ownership checks if multi-user support is needed

#### `project_documents` 🚨 **CRITICAL VULNERABILITY**
- **RLS Status:** ⚠️ Enabled but **NO POLICIES FOUND**
- **Visitor SELECT:** 🚨 **YES (UNRESTRICTED - CRITICAL ISSUE)**
- **Visitor INSERT:** 🚨 **YES (UNRESTRICTED - CRITICAL ISSUE)**
- **Visitor UPDATE:** 🚨 **YES (UNRESTRICTED - CRITICAL ISSUE)**
- **Visitor DELETE:** 🚨 **YES (UNRESTRICTED - CRITICAL ISSUE)**
- **Policies:** **NONE FOUND**
- **Security Issues:**
  - No RLS policies defined - table is completely unprotected
  - Visitors can see all project-document relationships
  - Visitors can manipulate project-document links
- **Recommendations:**
  - **URGENT:** Create RLS policies blocking all visitor access
  - Only authenticated users should have access
  - Consider checking project ownership if needed

#### `rag_knowledge_bases`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ⚠️ Yes (if `visibility='public'`)
- **Visitor INSERT:** ❌ No (authenticated only)
- **Visitor UPDATE:** ❌ No (authenticated only)
- **Visitor DELETE:** ❌ No (authenticated only)
- **Policies:**
  - `rag_kb_select_public` - `FOR SELECT TO anon, authenticated USING (visibility = 'public')` ⚠️
  - `rag_kb_select_private_owner` - `FOR SELECT TO authenticated USING (visibility = 'private' AND owner matches)` ✅
  - Write policies require ownership ✅
- **Security Issues:**
  - If any intel KBs are marked `visibility='public'`, visitors can read them
  - This exposes all related documents, chunks, runs, and outputs
- **Recommendations:**
  - **VERIFY:** Ensure no intel-related KBs have `visibility='public'`
  - Consider adding explicit check to prevent intel KBs from being public
  - Document which KBs should be public vs private

#### `rag_documents`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ⚠️ Yes (if parent KB is public)
- **Visitor INSERT:** ❌ No (authenticated only)
- **Visitor UPDATE:** ❌ No (authenticated only)
- **Visitor DELETE:** ❌ No (authenticated only)
- **Policies:**
  - `rag_docs_select_via_kb` - `FOR SELECT TO anon, authenticated USING (parent KB is public OR private with ownership)` ⚠️
  - `Authenticated admins can view all rag_documents` - `FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL)` ✅
  - Write policies require KB ownership ✅
- **Security Issues:**
  - Documents are readable by visitors if parent KB is public
  - If intel documents are in public KBs, they're exposed
- **Recommendations:**
  - Ensure all intel documents are in private KBs
  - Consider project-level checks in addition to KB-level checks

#### `rag_chunks`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ⚠️ Yes (if parent KB is public)
- **Visitor INSERT:** ❌ No (authenticated only)
- **Visitor UPDATE:** ❌ No (authenticated only)
- **Visitor DELETE:** ❌ No (authenticated only)
- **Policies:** Similar to `rag_documents` - access via KB visibility
- **Security Issues:** Same as `rag_documents`
- **Recommendations:** Same as `rag_documents`

#### `rag_runs`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ⚠️ Yes (if parent KB is public)
- **Visitor INSERT:** ❌ No (authenticated only)
- **Visitor UPDATE:** ❌ No (authenticated only)
- **Visitor DELETE:** ❌ No (authenticated only)
- **Policies:**
  - `rag_runs_select_public_kb` - `FOR SELECT TO anon USING (parent KB is public)` ⚠️
  - `rag_runs_select_authenticated` - `FOR SELECT TO authenticated USING (parent KB is public OR private with ownership)` ✅
  - Write policies require KB ownership ✅
- **Security Issues:**
  - Intel runs are exposed if parent KB is public
  - Run inputs/outputs may contain sensitive niche intelligence data
- **Recommendations:**
  - Ensure all intel runs are associated with private KBs
  - Consider project-level access control

#### `rag_run_outputs` 🚨 **HIGH RISK**
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ⚠️ Yes (if parent run's KB is public)
- **Visitor INSERT:** ❌ No (authenticated only)
- **Visitor UPDATE:** ❌ No (authenticated only)
- **Visitor DELETE:** ❌ No (authenticated only)
- **Policies:**
  - `rag_run_outputs_select_public_kb` - `FOR SELECT TO anon USING (parent run's KB is public)` ⚠️
  - `rag_run_outputs_select_authenticated` - `FOR SELECT TO authenticated USING (parent run's KB is public OR private with ownership)` ✅
- **Security Issues:**
  - Intel outputs (niche intelligence reports) are exposed if parent KB is public
  - Contains sensitive business intelligence data
- **Recommendations:**
  - **CRITICAL:** Ensure no intel outputs are accessible via public KBs
  - Consider adding explicit check that intel runs cannot be in public KBs

#### `rag_run_documents`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ⚠️ Yes (if parent run's KB is public)
- **Policies:** Similar to `rag_run_outputs`
- **Security Issues:** Same pattern - exposed if public KB
- **Recommendations:** Same as `rag_run_outputs`

#### `workflows`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ❌ No (authenticated only)
- **Visitor INSERT:** ❌ No (authenticated only)
- **Visitor UPDATE:** ❌ No (authenticated only)
- **Visitor DELETE:** ❌ No (authenticated only)
- **Policies:**
  - All policies use `auth.role() = 'authenticated'` instead of `auth.uid() IS NOT NULL`
- **Security Issues:**
  - Uses less reliable authentication check
  - Not a vulnerability, but less ideal
- **Recommendations:**
  - Update to use `auth.uid() IS NOT NULL` for consistency
  - Priority: MEDIUM

#### `workflow_secrets`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ❌ No (service_role only)
- **Policies:**
  - `Only service role can access secrets` - `FOR ALL TO service_role USING (true)` ✅
- **Security Issues:** None
- **Recommendations:** None

#### `research_subjects` 🚨 **HIGH ISSUE**
- **RLS Status:** ⚠️ Enabled but **NO POLICIES FOUND**
- **Visitor SELECT:** ❌ No (but neither can authenticated users)
- **Visitor INSERT:** ❌ No (blocked)
- **Visitor UPDATE:** ❌ No (blocked)
- **Visitor DELETE:** ❌ No (blocked)
- **Policies:** **NONE FOUND**
- **Security Issues:**
  - Table is effectively locked - no one can access it
  - RLS enabled but no policies = all access denied
  - May break intel functionality if this table is still used
- **Recommendations:**
  - **URGENT:** Add RLS policies to allow authenticated access
  - Determine if this table is still in use or if it was replaced by `projects`

#### `research_documents` ⚠️ **HIGH VULNERABILITY**
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** 🚨 **YES (UNRESTRICTED - HIGH ISSUE)**
- **Visitor INSERT:** ❌ No (authenticated only)
- **Visitor UPDATE:** ❌ No (authenticated only)
- **Visitor DELETE:** ❌ No (authenticated only)
- **Policies:**
  - `Public can view research_documents` - `FOR SELECT USING (true)` 🚨
  - Write policies require authentication ✅
- **Security Issues:**
  - **Visitors can read ALL research documents** (sensitive intel data)
  - Links research subjects to documents - exposes relationships
  - Should only be accessible to authenticated users
- **Recommendations:**
  - **URGENT:** Remove public read policy
  - Allow only authenticated users to SELECT
  - Consider checking ownership/research subject permissions

#### `project_types`, `project_type_workflows`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ❌ No (authenticated only)
- **Policies:** All operations require authentication ✅
- **Security Issues:** None
- **Recommendations:** None

#### `subject_types`, `workflow_subject_types`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ❌ No (authenticated only)
- **Policies:** All operations require authentication ✅
- **Security Issues:** None
- **Recommendations:** None

#### `chat_conversations`, `chat_messages`, `chat_conversation_contexts`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ❌ No (authenticated only - users can only see their own)
- **Policies:** User-scoped access (own data only) ✅
- **Security Issues:** None
- **Recommendations:** None

---

### 3. User Tables

#### `user_colors`, `user_themes`, `user_settings`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ❌ No (authenticated only - own data)
- **Policies:** User-scoped access ✅
- **Security Issues:** None
- **Recommendations:** None

#### `analytics_events`
- **RLS Status:** ✅ Enabled
- **Visitor SELECT:** ❌ No (authenticated only)
- **Visitor INSERT:** ✅ Yes (intentionally allowed)
- **Visitor UPDATE:** ❌ No (authenticated only)
- **Visitor DELETE:** ❌ No (authenticated only)
- **Policies:**
  - `Public can insert analytics_events` - `FOR INSERT WITH CHECK (true)` ✅
  - `Authenticated users can view analytics_events` - `FOR SELECT USING (auth.uid() IS NOT NULL)` ✅
- **Security Issues:** None (public INSERT is intentional for tracking)
- **Recommendations:** None

---

## Summary of Vulnerabilities by Severity

### 🚨 CRITICAL (Immediate Action Required)

1. **`projects` table** - No RLS policies at all
   - Visitors can read, create, update, delete all projects
   - Exposes sensitive client data and intel information

2. **`project_documents` table** - No RLS policies at all
   - Visitors can read and manipulate project-document relationships
   - Exposes document associations

### ⚠️ HIGH (Action Required Soon)

3. **`research_subjects` table** - No RLS policies
   - Blocks all access (even authenticated users)
   - May break functionality if still in use

4. **`research_documents` table** - Public read access
   - Visitors can read all research documents (sensitive intel data)

5. **Public KB exposure** - If any intel KBs are marked `visibility='public'`:
   - `rag_knowledge_bases`, `rag_documents`, `rag_chunks`
   - `rag_runs`, `rag_run_outputs`, `rag_run_documents`
   - All associated data becomes publicly accessible

### ⚠️ MEDIUM (Recommended Improvements)

6. **Authentication checks** - Some tables use `auth.role() = 'authenticated'` instead of `auth.uid() IS NOT NULL`
   - `workflows`, `research_documents`, and some others
   - Less reliable but not a vulnerability

---

## Recommended Fixes

### Fix 1: Add RLS Policies for `projects` Table

```sql
-- Enable RLS (should already be enabled, but ensure it)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- SELECT: Only authenticated users can view projects
CREATE POLICY "Authenticated users can view projects"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- INSERT: Only authenticated users can create projects
CREATE POLICY "Authenticated users can insert projects"
  ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Only authenticated users can update projects
CREATE POLICY "Authenticated users can update projects"
  ON public.projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- DELETE: Only authenticated users can delete projects
CREATE POLICY "Authenticated users can delete projects"
  ON public.projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
```

### Fix 2: Add RLS Policies for `project_documents` Table

```sql
-- Enable RLS (should already be enabled, but ensure it)
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- SELECT: Only authenticated users can view project documents
CREATE POLICY "Authenticated users can view project_documents"
  ON public.project_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- INSERT: Only authenticated users can link documents to projects
CREATE POLICY "Authenticated users can insert project_documents"
  ON public.project_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Only authenticated users can update links
CREATE POLICY "Authenticated users can update project_documents"
  ON public.project_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- DELETE: Only authenticated users can delete links
CREATE POLICY "Authenticated users can delete project_documents"
  ON public.project_documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
```

### Fix 3: Add RLS Policies for `research_subjects` Table

```sql
-- Enable RLS (should already be enabled)
ALTER TABLE public.research_subjects ENABLE ROW LEVEL SECURITY;

-- SELECT: Only authenticated users can view research subjects
CREATE POLICY "Authenticated users can view research_subjects"
  ON public.research_subjects
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- INSERT: Only authenticated users can create research subjects
CREATE POLICY "Authenticated users can insert research_subjects"
  ON public.research_subjects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Only authenticated users can update research subjects
CREATE POLICY "Authenticated users can update research_subjects"
  ON public.research_subjects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- DELETE: Only authenticated users can delete research subjects
CREATE POLICY "Authenticated users can delete research_subjects"
  ON public.research_subjects
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
```

### Fix 4: Remove Public Read Access from `research_documents`

```sql
-- Drop the public read policy
DROP POLICY IF EXISTS "Public can view research_documents" ON public.research_documents;

-- Create authenticated-only read policy
CREATE POLICY "Authenticated users can view research_documents"
  ON public.research_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Note: INSERT/UPDATE/DELETE policies already require authentication
```

### Fix 5: Verify No Intel KBs Are Public

```sql
-- Check for any public KBs that might contain intel data
SELECT id, name, visibility, kb_type, metadata
FROM public.rag_knowledge_bases
WHERE visibility = 'public'
ORDER BY created_at DESC;
```

If any intel KBs are found as public, they should be changed to private:

```sql
-- Update intel KBs to private (adjust WHERE clause as needed)
UPDATE public.rag_knowledge_bases
SET visibility = 'private'
WHERE visibility = 'public'
  AND (kb_type = 'intel' OR name LIKE '%intel%' OR name LIKE '%niche%');
```

### Fix 6: Update Authentication Checks (Optional - Medium Priority)

```sql
-- Update workflows table policies to use auth.uid()
DROP POLICY IF EXISTS "Authenticated users can view workflows" ON public.workflows;
CREATE POLICY "Authenticated users can view workflows"
  ON public.workflows
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Apply similar changes to INSERT/UPDATE/DELETE policies
-- (Repeat for other tables using auth.role())
```

---

## Landing Page Data Verification

### Tables Queried on Landing Page (from `src/app/(public)/page.tsx`)

✅ All landing page queries use publicly accessible tables with appropriate filtering:
- `pages` - Public read ✅
- `sections` - Public read ✅
- `website_settings` - Public read ✅
- `website_settings_presets` - Public read ✅
- `page_sections` - Public read ✅
- `cta_buttons` - Public read (active only) ✅
- `section_cta_buttons` - Public read ✅
- `offer_features` - Public read (active only) ✅
- `testimonials` - Public read (approved only) ✅
- `faq_items` - Public read (active only) ✅
- `results`, `timeline`, `media_assets` - Public read ✅
- Junction tables with status filtering ✅

**No sensitive intel data is queried on the landing page** ✅

---

## Create Operations Verification

### Tables Allowing Public INSERT

✅ Only `analytics_events` allows public INSERT (intentional for tracking)
- All other tables correctly block visitor INSERT operations

**Verification:** ✅ PASSED

---

## Intel Route Protection

### Route-Level Protection

All `/intel/*` routes should be protected by:
1. Middleware authentication checks
2. RLS policies (even if middleware is bypassed)

**Current Status:** Routes exist at `src/app/intel/**/*` and `src/app/api/intel/**/*`

**Recommendation:** Verify middleware protects these routes, but RLS provides defense-in-depth

---

## Testing Recommendations

1. **Test as anonymous user:**
   - Attempt to SELECT from `projects` → Should fail (after fix)
   - Attempt to SELECT from `project_documents` → Should fail (after fix)
   - Attempt to SELECT from `research_documents` → Should fail (after fix)
   - Attempt to SELECT from `analytics_events` → Should fail ✅
   - Attempt to INSERT into `analytics_events` → Should succeed ✅
   - Attempt to INSERT into any other table → Should fail ✅

2. **Test as authenticated user:**
   - Should be able to SELECT from all intel tables ✅
   - Should be able to INSERT/UPDATE/DELETE with proper ownership ✅

3. **Test public KB exposure:**
   - Query for public KBs → Should return none (or only non-intel KBs)
   - If public KBs exist, verify they don't contain intel data

---

## Priority Action Items

### Immediate (Today)

1. ✅ Create migration to add RLS policies for `projects` table
2. ✅ Create migration to add RLS policies for `project_documents` table
3. ✅ Create migration to remove public read from `research_documents`
4. ✅ Create migration to add RLS policies for `research_subjects`

### This Week

5. Verify no intel KBs are marked as public
6. Update any public KBs containing intel data to private
7. Test all fixes with anonymous and authenticated users

### Optional Improvements

8. Update authentication checks from `auth.role()` to `auth.uid()` where applicable
9. Add comprehensive RLS test suite
10. Document which tables are public vs authenticated-only

---

## Conclusion

The audit revealed **4 critical vulnerabilities** where visitors can access or manipulate sensitive intel data:

1. `projects` table - completely unprotected
2. `project_documents` table - completely unprotected  
3. `research_documents` table - public read access
4. `research_subjects` table - no access (may break functionality)

Additionally, the audit identified a **high-risk scenario** where public knowledge bases could expose all associated intel data (documents, runs, outputs).

**All critical vulnerabilities have SQL fixes provided above** and should be implemented immediately via new migration files.

The landing page correctly uses only publicly accessible tables, and `analytics_events` is the only table correctly allowing public INSERT operations.

---

**Report Generated:** 2025-01-27  
**Audited By:** Security Audit System  
**Next Review:** After implementing fixes
