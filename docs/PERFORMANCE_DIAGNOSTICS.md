# Performance Diagnostics Guide

## Current Performance Issues

Based on the logs, network requests are taking 1-3 seconds:
- **Pages query**: 2,068ms network request
- **Sections queries**: 1,094ms and 1,236ms each
- **Site structure**: 1,381ms and 1,379ms each  
- **User data fetch**: 3,168ms (extremely slow!)

## Critical: Check Server Logs

The client-side logs only show **network time** (total round-trip). To see where the time is actually spent, check your **server terminal/console** for:

- `[PERF] API /admin/pages - Pages query` - Should show `dbQueryTime`
- `[PERF] API /admin/pages - ⚠️ SLOW DB QUERY` - Will appear if DB query > 100ms
- `[PERF] API /admin/sections - Page sections join query` - Should show `dbQueryTime`
- `[PERF] API /admin/site-structure - Site structure query` - Should show query time

## Step 1: Verify Migration Was Applied

The indexes are critical! Run this to check if they exist:

```sql
-- Check if indexes exist
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('pages', 'page_sections', 'sections', 'site_structure')
    AND schemaname = 'public'
ORDER BY tablename, indexname;
```

**Required indexes:**
- `idx_pages_order_created_at` - For pages ordering
- `idx_page_sections_page_id` - For sections joins
- `idx_page_sections_page_id_position` - For ordered sections
- `idx_site_structure_production_page_id` - For site structure
- `idx_site_structure_development_page_id` - For site structure

If indexes are missing, run:
```bash
npx supabase migration up
# Or
supabase db push
```

## Step 2: Check Server Terminal Logs

Look for these in your **server terminal** (not browser console):

```
[PERF] API /admin/pages - Pages query: XXXms (dbQueryTime=YYYms)
[PERF] API /admin/pages - ⚠️ SLOW DB QUERY: XXXms
```

This will tell us:
- **If dbQueryTime is high (>100ms)**: Database/RLS issue
- **If dbQueryTime is low (<50ms) but network is high**: Network latency issue

## Step 3: Check RLS Policies

Slow queries might be caused by Row Level Security (RLS) policies. Check if RLS is enabled:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('pages', 'page_sections', 'sections');
```

If `rowsecurity = true`, the RLS policies might be slow. Check the policies:

```sql
SELECT * FROM pg_policies 
WHERE tablename IN ('pages', 'page_sections', 'sections');
```

## Step 4: Network Latency Check

If database queries are fast but network is slow, it might be:
- **Supabase region mismatch**: Your server and Supabase might be in different regions
- **Cold starts**: First request after idle period
- **Connection pooling**: Not using connection pooling

## Optimizations Applied

### 1. Database Indexes
- Composite index on `pages(order, created_at)`
- Indexes on `page_sections(page_id)` and `page_sections(page_id, position)`
- Indexes on `site_structure(production_page_id)` and `site_structure(development_page_id)`

### 2. Query Optimizations
- Removed `content` (large JSONB) from sections query
- Removed `description` and `updated_at` from pages query
- Combined site-structure queries into single query with OR

### 3. Performance Monitoring
- Added detailed timing for database queries
- Added warnings for slow queries (>100ms)

## Next Steps

1. **Check server terminal** for database query times
2. **Verify indexes exist** using SQL query above
3. **Run migration** if indexes are missing
4. **Check RLS policies** if queries are still slow
5. **Check Supabase region** if network latency is high

## Expected Performance After Fixes

- **Pages query**: <200ms (from 2,068ms)
- **Sections queries**: <300ms each (from 1,000ms+)
- **Site structure**: <200ms (from 1,300ms+)
- **Total sidebar load**: <1s (from 8s+)

