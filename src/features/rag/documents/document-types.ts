export type RAGDocument = {
  id: string;
  knowledge_base_id: string;
  title: string | null;
  source_type: string;
  source_url: string | null;
  content: string;
  content_type: string | null;
  status: "ready" | "processing" | "failed";
  chunk_count: number;
  embedding_count: number;
  notion_page_id: string | null;
  drive_file_id: string | null;
  storage_path: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

