-- Social accounts registry
CREATE TABLE social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  account_key text NOT NULL,
  display_name text,
  username text,
  avatar_url text,
  platform_account_id text,
  is_organization boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(platform, account_key)
);

-- Social posts (all platforms)
CREATE TABLE social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  platform_post_id text,
  account text NOT NULL,
  account_name text,
  account_username text,
  account_avatar text,
  type text,
  items jsonb,
  caption text,
  first_comment text,
  visibility text DEFAULT 'PUBLIC',
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'discarded')),
  published_at timestamptz,
  scheduled_at timestamptz,
  permalink text,
  media_type text,
  media_url text,
  thumbnail_url text,
  error text,
  raw_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(platform, platform_post_id)
);

-- Social account snapshots (daily metrics)
CREATE TABLE social_account_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  account text NOT NULL,
  date date NOT NULL,
  followers integer,
  following integer,
  reach integer,
  impressions integer,
  profile_views integer,
  accounts_engaged integer,
  total_interactions integer,
  website_clicks integer,
  new_followers integer,
  lost_followers integer,
  likes integer,
  comments integer,
  shares integer,
  saves integer,
  raw_data jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(platform, account, date)
);

-- Social post snapshots (periodic metrics per post)
CREATE TABLE social_post_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  platform_post_id text NOT NULL,
  account text NOT NULL,
  snapshot_at timestamptz NOT NULL DEFAULT now(),
  likes integer,
  comments integer,
  shares integer,
  saves integer,
  reach integer,
  impressions integer,
  views integer,
  clicks integer,
  engagement_rate numeric,
  reactions jsonb,
  raw_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Social comments
CREATE TABLE social_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  platform_comment_id text NOT NULL,
  platform_post_id text NOT NULL,
  parent_comment_id text,
  account text NOT NULL,
  author_name text,
  author_username text,
  author_avatar text,
  author_platform_id text,
  text text NOT NULL,
  like_count integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  is_reply boolean DEFAULT false,
  replied boolean DEFAULT false,
  hidden boolean DEFAULT false,
  seen boolean DEFAULT false,
  published_at timestamptz,
  raw_data jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(platform, platform_comment_id)
);

-- Social comment sync state
CREATE TABLE social_comment_sync_state (
  platform text NOT NULL,
  platform_post_id text NOT NULL,
  last_synced_at timestamptz NOT NULL,
  comment_count integer DEFAULT 0,
  PRIMARY KEY (platform, platform_post_id)
);

-- Indexes
CREATE INDEX idx_social_posts_platform_account ON social_posts(platform, account);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_social_posts_published_at ON social_posts(published_at DESC);
CREATE INDEX idx_social_account_snapshots_lookup ON social_account_snapshots(platform, account, date DESC);
CREATE INDEX idx_social_post_snapshots_lookup ON social_post_snapshots(platform, platform_post_id, snapshot_at DESC);
CREATE INDEX idx_social_comments_post ON social_comments(platform, platform_post_id);
CREATE INDEX idx_social_comments_unseen ON social_comments(seen) WHERE seen = false;

-- RLS: admin-only for all social tables
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_account_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comment_sync_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all_social_accounts" ON social_accounts FOR ALL
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_all_social_posts" ON social_posts FOR ALL
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_all_social_account_snapshots" ON social_account_snapshots FOR ALL
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_all_social_post_snapshots" ON social_post_snapshots FOR ALL
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_all_social_comments" ON social_comments FOR ALL
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_all_social_comment_sync_state" ON social_comment_sync_state FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Seed accounts
INSERT INTO social_accounts (platform, account_key, display_name, username, is_organization) VALUES
  ('linkedin', 'mihaipol', 'Mihai Pol', 'mihaipol', false),
  ('linkedin', 'evergreen', 'Evergreen Systems', 'evergreen-systems', true);
