-- SSafagetti / ChalKakBapsang ERD import DDL
-- Target: PostgreSQL 15+ compatible SQL for ERDCloud-style SQL import
-- Scope: current frontend features + backend API contract

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  nickname VARCHAR(80) NOT NULL,
  profile_image_url VARCHAR(500),
  provider VARCHAR(30) NOT NULL DEFAULT 'email',
  role VARCHAR(30) NOT NULL DEFAULT 'USER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE TABLE oauth_accounts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  provider VARCHAR(30) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_oauth_provider_user UNIQUE (provider, provider_user_id),
  CONSTRAINT fk_oauth_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_oauth_user_id ON oauth_accounts (user_id);

CREATE TABLE media_files (
  id BIGSERIAL PRIMARY KEY,
  uploader_user_id BIGINT,
  url VARCHAR(700) NOT NULL,
  original_name VARCHAR(255),
  mime_type VARCHAR(120) NOT NULL,
  purpose VARCHAR(50) NOT NULL,
  width INTEGER,
  height INTEGER,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_media_uploader FOREIGN KEY (uploader_user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX idx_media_uploader ON media_files (uploader_user_id);

CREATE TABLE recipes (
  id BIGSERIAL PRIMARY KEY,
  author_user_id BIGINT NOT NULL,
  thumbnail_media_id BIGINT,
  title VARCHAR(120) NOT NULL,
  description VARCHAR(500) NOT NULL,
  servings INTEGER NOT NULL DEFAULT 1,
  cook_time_minutes INTEGER NOT NULL,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'easy',
  visibility VARCHAR(20) NOT NULL DEFAULT 'public',
  source_type VARCHAR(20) NOT NULL DEFAULT 'user',
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  save_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT fk_recipes_author FOREIGN KEY (author_user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_recipes_thumbnail FOREIGN KEY (thumbnail_media_id) REFERENCES media_files (id) ON DELETE SET NULL
);

CREATE INDEX idx_recipes_author_recent ON recipes (author_user_id, created_at);
CREATE INDEX idx_recipes_popular ON recipes (like_count, created_at);
CREATE INDEX idx_recipes_thumbnail ON recipes (thumbnail_media_id);

CREATE TABLE tags (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_tags_name UNIQUE (name)
);

CREATE TABLE recipe_tags (
  recipe_id BIGINT NOT NULL,
  tag_id BIGINT NOT NULL,
  PRIMARY KEY (recipe_id, tag_id),
  CONSTRAINT fk_recipe_tags_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_tags_tag FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

CREATE INDEX idx_recipe_tags_tag ON recipe_tags (tag_id);

CREATE TABLE recipe_images (
  id BIGSERIAL PRIMARY KEY,
  recipe_id BIGINT NOT NULL,
  media_file_id BIGINT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_recipe_images_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_images_media FOREIGN KEY (media_file_id) REFERENCES media_files (id) ON DELETE CASCADE
);

CREATE INDEX idx_recipe_images_recipe ON recipe_images (recipe_id, sort_order);
CREATE INDEX idx_recipe_images_media ON recipe_images (media_file_id);

CREATE TABLE recipe_ingredients (
  id BIGSERIAL PRIMARY KEY,
  recipe_id BIGINT NOT NULL,
  ingredient_name VARCHAR(80) NOT NULL,
  amount_text VARCHAR(80) NOT NULL,
  amount_value NUMERIC(10, 2),
  unit_text VARCHAR(30),
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_recipe_ingredients_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
);

CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients (recipe_id, sort_order);

CREATE TABLE recipe_steps (
  id BIGSERIAL PRIMARY KEY,
  recipe_id BIGINT NOT NULL,
  media_file_id BIGINT,
  step_no INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  timer_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_recipe_steps_recipe_no UNIQUE (recipe_id, step_no),
  CONSTRAINT fk_recipe_steps_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_steps_media FOREIGN KEY (media_file_id) REFERENCES media_files (id) ON DELETE SET NULL
);

CREATE INDEX idx_recipe_steps_media ON recipe_steps (media_file_id);

CREATE TABLE recipe_likes (
  id BIGSERIAL PRIMARY KEY,
  recipe_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_recipe_likes_recipe_user UNIQUE (recipe_id, user_id),
  CONSTRAINT fk_recipe_likes_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_likes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_recipe_likes_user ON recipe_likes (user_id);

CREATE TABLE saved_recipes (
  id BIGSERIAL PRIMARY KEY,
  recipe_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_saved_recipes_recipe_user UNIQUE (recipe_id, user_id),
  CONSTRAINT fk_saved_recipes_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_recipes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_saved_recipes_user_recent ON saved_recipes (user_id, created_at);

CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  recipe_id BIGINT NOT NULL,
  author_user_id BIGINT NOT NULL,
  parent_comment_id BIGINT,
  content VARCHAR(500) NOT NULL,
  is_author_reply BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT fk_comments_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_author FOREIGN KEY (author_user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_parent FOREIGN KEY (parent_comment_id) REFERENCES comments (id) ON DELETE CASCADE
);

CREATE INDEX idx_comments_recipe_parent ON comments (recipe_id, parent_comment_id, created_at);
CREATE INDEX idx_comments_author ON comments (author_user_id);
CREATE INDEX idx_comments_parent ON comments (parent_comment_id);

CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  receiver_user_id BIGINT NOT NULL,
  actor_user_id BIGINT,
  recipe_id BIGINT,
  comment_id BIGINT,
  type VARCHAR(40) NOT NULL,
  title VARCHAR(120) NOT NULL,
  message VARCHAR(500) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMPTZ,
  CONSTRAINT fk_notifications_receiver FOREIGN KEY (receiver_user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_actor FOREIGN KEY (actor_user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_notifications_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_comment FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_receiver_unread ON notifications (receiver_user_id, is_read, created_at);
CREATE INDEX idx_notifications_actor ON notifications (actor_user_id);
CREATE INDEX idx_notifications_recipe ON notifications (recipe_id);
CREATE INDEX idx_notifications_comment ON notifications (comment_id);

CREATE TABLE user_follows (
  id BIGSERIAL PRIMARY KEY,
  follower_user_id BIGINT NOT NULL,
  following_user_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_user_follows_pair UNIQUE (follower_user_id, following_user_id),
  CONSTRAINT fk_user_follows_follower FOREIGN KEY (follower_user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_user_follows_following FOREIGN KEY (following_user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_user_follows_following ON user_follows (following_user_id);

CREATE TABLE ingredient_catalog (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  category VARCHAR(60),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_ingredient_catalog_name UNIQUE (name)
);

CREATE TABLE ingredient_aliases (
  id BIGSERIAL PRIMARY KEY,
  ingredient_id BIGINT NOT NULL,
  alias VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_ingredient_aliases_alias UNIQUE (alias),
  CONSTRAINT fk_ingredient_aliases_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredient_catalog (id) ON DELETE CASCADE
);

CREATE INDEX idx_ingredient_aliases_ingredient ON ingredient_aliases (ingredient_id);

CREATE TABLE ingredient_detection_jobs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  media_file_id BIGINT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ,
  CONSTRAINT fk_detection_jobs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_detection_jobs_media FOREIGN KEY (media_file_id) REFERENCES media_files (id) ON DELETE CASCADE
);

CREATE INDEX idx_detection_jobs_user_recent ON ingredient_detection_jobs (user_id, created_at);
CREATE INDEX idx_detection_jobs_media ON ingredient_detection_jobs (media_file_id);

CREATE TABLE ingredient_detection_items (
  id BIGSERIAL PRIMARY KEY,
  detection_job_id BIGINT NOT NULL,
  ingredient_id BIGINT,
  detected_name VARCHAR(80) NOT NULL,
  confidence NUMERIC(5, 4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_detection_items_job FOREIGN KEY (detection_job_id) REFERENCES ingredient_detection_jobs (id) ON DELETE CASCADE,
  CONSTRAINT fk_detection_items_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredient_catalog (id) ON DELETE SET NULL
);

CREATE INDEX idx_detection_items_job ON ingredient_detection_items (detection_job_id);
CREATE INDEX idx_detection_items_ingredient ON ingredient_detection_items (ingredient_id);

CREATE TABLE recommendation_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT,
  ingredients_json JSONB NOT NULL,
  serving INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_recommendation_requests_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX idx_recommendation_requests_user ON recommendation_requests (user_id, created_at);

CREATE TABLE recommendation_results (
  id BIGSERIAL PRIMARY KEY,
  request_id BIGINT NOT NULL,
  recipe_id BIGINT NOT NULL,
  match_rate NUMERIC(5, 4) NOT NULL,
  missing_ingredients_json JSONB,
  rank_no INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_recommendation_results_rank UNIQUE (request_id, rank_no),
  CONSTRAINT fk_recommendation_results_request FOREIGN KEY (request_id) REFERENCES recommendation_requests (id) ON DELETE CASCADE,
  CONSTRAINT fk_recommendation_results_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
);

CREATE INDEX idx_recommendation_results_recipe ON recommendation_results (recipe_id);

CREATE TABLE cook_sessions (
  id BIGSERIAL PRIMARY KEY,
  recipe_id BIGINT NOT NULL,
  user_id BIGINT,
  device VARCHAR(60) NOT NULL,
  current_step_no INTEGER NOT NULL DEFAULT 1,
  total_steps INTEGER NOT NULL,
  is_finished BOOLEAN NOT NULL DEFAULT FALSE,
  liked_after_finish BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMPTZ,
  CONSTRAINT fk_cook_sessions_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
  CONSTRAINT fk_cook_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX idx_cook_sessions_recipe ON cook_sessions (recipe_id);
CREATE INDEX idx_cook_sessions_user_recent ON cook_sessions (user_id, started_at);

CREATE TABLE cook_session_steps (
  id BIGSERIAL PRIMARY KEY,
  cook_session_id BIGINT NOT NULL,
  recipe_step_id BIGINT NOT NULL,
  step_no INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_cook_session_steps_session_step UNIQUE (cook_session_id, step_no),
  CONSTRAINT fk_cook_session_steps_session FOREIGN KEY (cook_session_id) REFERENCES cook_sessions (id) ON DELETE CASCADE,
  CONSTRAINT fk_cook_session_steps_recipe_step FOREIGN KEY (recipe_step_id) REFERENCES recipe_steps (id) ON DELETE CASCADE
);

CREATE INDEX idx_cook_session_steps_recipe_step ON cook_session_steps (recipe_step_id);
