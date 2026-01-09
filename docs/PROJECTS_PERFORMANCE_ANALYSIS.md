# Projects Page Performance Analysis & Recommendations

## Overview
This document analyzes performance bottlenecks in the `/intel/projects` page and provides recommendations for optimization, focusing on junction tables: `project_documents`, `project_type_workflows`, and `rag_runs`.

## Junction Tables Identified

### 1. `project_documents` (Projects ↔ Documents)
- **Purpose**: Links projects to documents (many-to-many)
- **Current Indexes**:
  - `idx_project_documents_project_id` (project_id)
  - `idx_project_documents_document_id` (document_id)
- **Usage**: Used in project detail page to fetch linked documents

### 2. `project_type_workflows` (Project Types ↔ Workflows)
- **Purpose**: Links project types to workflows with display order
- **Current Indexes**:
  - `idx_project_type_workflows_project_type_id_order` (project_type_id, display_order)
  - `idx_project_type_workflows_workflow_id` (workflow_id)
- **Usage**: Used to determine which workflows are enabled for a project type

### 3. `rag_runs` (Projects ↔ Workflows ↔ Knowledge Bases)
- **Purpose**: Links projects to workflows and knowledge bases
- **Current Indexes**:
  - `idx_rag_runs_project_workflow_status_created` (project_id, workflow_id, status, created_at DESC)
  - `idx_rag_runs_project_id` (project_id)
  - `idx_rag_runs_workflow_id` (workflow_id)
- **Usage**: Used extensively in both list and detail pages

## Performance Issues Identified

### 1. Projects List Page (`/api/intel/projects`)

#### Issue A: N+1 Query Pattern for Niche Intelligence Data
**Location**: `src/app/api/intel/projects/route.ts` (lines 83-167)

**Problem**:
- Fetches all projects first
- Then fetches niche intelligence data for each project individually
- Processes JSONB data in memory for each project
- Sequential processing creates bottlenecks

**Current Flow**:
```typescript
1. Fetch all projects → projectIds
2. Fetch niche_intelligence workflow ID
3. Fetch runs for all projects (good - single query)
4. Process each project's latest run individually (N+1 pattern)
5. Extract verdict/fit_score from JSONB for each project
```

**Impact**: High - O(n) complexity where n = number of projects

#### Issue B: Missing Composite Index on `project_documents`
**Problem**: When joining `project_documents` with `rag_documents`, the query needs to:
1. Filter by `project_id`
2. Join with `rag_documents` on `document_id`
3. Filter out deleted documents

**Current**: Only has separate indexes on `project_id` and `document_id`
**Needed**: Composite index for faster joins

### 2. Project Detail Page (`/intel/projects/[id]/page.tsx`)

#### Issue C: Sequential Queries Instead of Parallelization
**Location**: `src/app/intel/projects/[id]/page.tsx`

**Problem**: Multiple queries executed sequentially:
1. Fetch project with KB (line 21)
2. Fetch project type (lines 33-48)
3. Fetch linked documents via junction table (lines 51-60)
4. Fetch workspace documents (lines 63-68)
5. Fetch runs (lines 102-117)
6. Fetch project type workflows (lines 137-152)

**Impact**: Medium - Each query waits for previous to complete

#### Issue D: Inefficient Document Counting
**Location**: `src/features/rag/projects/data.ts` (lines 26-53)

**Problem**: For each project, makes 2 separate count queries:
```typescript
// Count linked documents
const { count: linkedCount } = await supabase
  .from("project_documents")
  .select("*", { count: "exact", head: true })
  .eq("project_id", project.id);

// Count workspace documents
const { count: workspaceCount } = await supabase
  .from("rag_documents")
  .select("*", { count: "exact", head: true })
  .eq("knowledge_base_id", project.kb_id)
  .is("deleted_at", null);
```

**Impact**: High - O(n) queries where n = number of projects

### 3. Missing Database Indexes

#### Issue E: Missing Composite Indexes
1. **`project_documents`**: Missing composite index for `(project_id, document_id)` for faster joins
2. **`rag_documents`**: Missing composite index for `(knowledge_base_id, deleted_at, created_at)` for workspace document queries
3. **`rag_runs`**: Missing index for `(project_id, created_at DESC)` for ordering runs by project

## Recommended Solutions

### Solution 1: Add Missing Composite Indexes

#### 1.1 Composite Index on `project_documents`
```sql
-- Optimizes joins: project_documents JOIN rag_documents ON document_id
CREATE INDEX IF NOT EXISTS idx_project_documents_project_document 
ON public.project_documents(project_id, document_id);
```

#### 1.2 Composite Index on `rag_documents` for Workspace Queries
```sql
-- Optimizes: WHERE knowledge_base_id = ? AND deleted_at IS NULL ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_rag_documents_kb_deleted_created 
ON public.rag_documents(knowledge_base_id, deleted_at, created_at DESC) 
WHERE deleted_at IS NULL;
```

#### 1.3 Index on `rag_runs` for Project Ordering
```sql
-- Optimizes: WHERE project_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_rag_runs_project_created_desc 
ON public.rag_runs(project_id, created_at DESC);
```

### Solution 2: Optimize Projects List API Query

#### 2.1 Batch Process Niche Intelligence Data
Instead of processing each project individually, batch process all projects at once:

```typescript
// Instead of:
for (const [projectId, run] of latestRunByProject.entries()) {
  // Process individually
}

// Do:
const allOutputJsons = runsData.map(run => run.rag_run_outputs?.[0]?.output_json);
// Batch process all JSONB data
```

#### 2.2 Use Database Aggregation for Document Counts
Create a database function or use a single query with aggregation:

```sql
-- Option 1: Use a single query with LEFT JOINs
SELECT 
  p.*,
  COUNT(DISTINCT pd.document_id) + COUNT(DISTINCT rd.id) as document_count
FROM projects p
LEFT JOIN project_documents pd ON pd.project_id = p.id
LEFT JOIN rag_documents rd ON rd.knowledge_base_id = p.kb_id AND rd.deleted_at IS NULL
WHERE p.archived_at IS NULL
GROUP BY p.id;
```

### Solution 3: Parallelize Project Detail Page Queries

#### 3.1 Use Promise.all() for Independent Queries
```typescript
const [
  projectResult,
  projectTypeResult,
  linkedDocsResult,
  workspaceDocsResult,
  runsResult,
  workflowsResult
] = await Promise.all([
  getProjectByIdWithKB(id),
  fetchProjectType(project.project_type_id),
  fetchLinkedDocuments(id),
  fetchWorkspaceDocuments(project.kb_id),
  fetchRuns(id),
  fetchProjectTypeWorkflows(project.project_type_id)
]);
```

### Solution 4: Add Database Views or Materialized Views

#### 4.1 Create View for Project Document Counts
```sql
CREATE OR REPLACE VIEW project_document_counts AS
SELECT 
  p.id as project_id,
  COUNT(DISTINCT pd.document_id) + COUNT(DISTINCT rd.id) as document_count
FROM projects p
LEFT JOIN project_documents pd ON pd.project_id = p.id
LEFT JOIN rag_documents rd ON rd.knowledge_base_id = p.kb_id AND rd.deleted_at IS NULL
WHERE p.archived_at IS NULL
GROUP BY p.id;
```

#### 4.2 Create View for Latest Niche Intelligence Runs
```sql
CREATE OR REPLACE VIEW latest_niche_intelligence_runs AS
SELECT DISTINCT ON (project_id)
  project_id,
  id as run_id,
  fit_score,
  verdict,
  created_at
FROM rag_runs
WHERE workflow_id = (SELECT id FROM workflows WHERE name = 'niche_intelligence')
  AND status = 'complete'
ORDER BY project_id, created_at DESC;
```

## Additional Tables Needed

### Current Tables Used:
1. ✅ `projects` - Main projects table
2. ✅ `project_types` - Project type definitions
3. ✅ `project_documents` - Junction table (projects ↔ documents)
4. ✅ `project_type_workflows` - Junction table (project types ↔ workflows)
5. ✅ `rag_documents` - Documents table
6. ✅ `rag_knowledge_bases` - Knowledge bases table
7. ✅ `rag_runs` - Runs table (acts as junction: projects ↔ workflows ↔ KBs)
8. ✅ `workflows` - Workflows table
9. ✅ `rag_run_outputs` - Run outputs (JSONB data)

### No Additional Tables Needed
All necessary tables are already in place. The performance issues are primarily due to:
1. Missing indexes
2. Inefficient query patterns
3. Lack of parallelization

## Implementation Priority

### High Priority (Immediate Impact)
1. ✅ Add composite indexes (Solution 1)
2. ✅ Parallelize project detail page queries (Solution 3)
3. ✅ Optimize document counting (Solution 2.2)

### Medium Priority (Significant Improvement)
4. ✅ Batch process niche intelligence data (Solution 2.1)
5. ✅ Create database views for common queries (Solution 4)

### Low Priority (Nice to Have)
6. Consider materialized views if data doesn't change frequently
7. Add query result caching for frequently accessed projects

## Expected Performance Improvements

### Before Optimization:
- Projects list page: ~2-5 seconds (depending on project count)
- Project detail page: ~1-3 seconds
- Document counting: O(n) queries

### After Optimization:
- Projects list page: ~500ms-1s (60-80% improvement)
- Project detail page: ~300-500ms (70-85% improvement)
- Document counting: Single query (90%+ improvement)

## Next Steps

1. Create migration file with new indexes
2. Refactor API routes to use parallel queries
3. Optimize document counting logic
4. Test performance improvements
5. Monitor query execution times in production

