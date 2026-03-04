-- Simplify RLS policies for rag_documents to ensure Realtime works for authenticated users
-- The existing policy requires knowledge base ownership checks which can block Realtime events
-- This adds a simpler policy that allows all authenticated users (admins) to SELECT all documents

-- Add a policy that allows authenticated users to SELECT all rag_documents
-- This is needed for Supabase Realtime to work properly
-- Since this is an admin-only app, all authenticated users are admins
DROP POLICY IF EXISTS "Authenticated admins can view all rag_documents" ON public.rag_documents;

CREATE POLICY "Authenticated admins can view all rag_documents"
ON public.rag_documents
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Note: The existing "rag_docs_select_via_kb" policy from 20251227010000_add_rag_v2_features.sql
-- is more restrictive and checks knowledge base ownership. Having both policies creates an OR condition,
-- so authenticated users can see documents via either policy (ownership OR being authenticated admin).
-- This ensures Realtime subscriptions work while maintaining the option for more granular control.

