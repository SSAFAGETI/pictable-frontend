-- SSafagetti / ChalKakBapsang ERD import DDL
-- Target: MySQL 8.x compatible SQL for ERDCloud-style SQL import
-- Scope: current frontend features + backend API contract

CREATE TABLE users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NULL,
  nickname VARCHAR(80) NOT NULL,
  profile_image_url VARCHAR(500) NULL,
  provider VARCHAR(30) NOT NULL DEFAULT 'email',
  role VARCHAR(30) NOT NULL DEFAULT 'USER',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email)
);

CREATE TABLE oauth_accounts (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  provider VARCHAR(30) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_oauth_provider_user (provider, provider_user_id),
  KEY idx_oauth_user_id (user_id),
  CONSTRAINT fk_oauth_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE media_files (
  id BIGINT NOT NULL AUTO_INCREMENT,
  uploader_user_id BIGINT NULL,
  url VARCHAR(700) NOT NULL,
  original_name VARCHAR(255) NULL,
  mime_type VARCHAR(120) NOT NULL,
  purpose VARCHAR(50) NOT NULL,
  width INT NULL,
  height INT NULL,
  size_bytes BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_media_uploader (uploader_user_id),
  CONSTRAINT fk_media_uploader FOREIGN KEY (uploader_user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE recipes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  author_user_id BIGINT NOT NULL,
  thumbnail_media_id BIGINT NULL,
  title VARCHAR(120) NOT NULL,
  description VARCHAR(500) NOT NULL,
  servings INT NOT NULL DEFAULT 1,
  cook_time_minutes INT NOT NULL,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'easy',
  visibility VARCHAR(20) NOT NULL DEFAULT 'public',
  source_type VARCHAR(20) NOT NULL DEFAULT 'user',
  like_count INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  save_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_recipes_author_recent (author_user_id, created_at),
  KEY idx_recipes_popular (like_count, created_at),
  KEY idx_recipes_thumbnail (thumbnail_media_id),
  CONSTRAINT fk_recipes_author FOREIGN KEY (author_user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_recipes_thumbnail FOREIGN KEY (thumbnail_media_id) REFERENCES media_files (id) ON DELETE SET NULL
);

CREATE TABLE tags (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tags_name (name)
);

CREATE TABLE recipe_tags (
  recipe_id BIGINT NOT NULL,
  tag_id BIGINT NOT NULL,
  PRIMARY KEY (recipe_id, tag_id),
  KEY idx_recipe_tags_tag (tag_id),
  CONSTRAINT fk_recipe_tags_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_tags_tag FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

CREATE TABLE recipe_images (
  id BIGINT NOT NULL AUTO_INCREMENT,
  recipe_id BIGINT NOT NULL,
  media_file_id BIGINT NOT NULL,
  sort_order INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_recipe_images_recipe (recipe_id, sort_order),
  KEY idx_recipe_images_media (media_file_id),
  CONSTRAINT fk_recipe_images_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_images_media FOREIGN KEY (media_file_id) REFERENCES media_files (id) ON DELETE CASCADE
);

CREATE TABLE recipe_ingredients (
  id BIGINT NOT NULL AUTO_INCREMENT,
  recipe_id BIGINT NOT NULL,
  ingredient_name VARCHAR(80) NOT NULL,
  amount_text VARCHAR(80) NOT NULL,
  amount_value DECIMAL(10, 2) NULL,
  unit_text VARCHAR(30) NULL,
  sort_order INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_recipe_ingredients_recipe (recipe_id, sort_order),
  CONSTRAINT fk_recipe_ingredients_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
);

CREATE TABLE recipe_steps (
  id BIGINT NOT NULL AUTO_INCREMENT,
  recipe_id BIGINT NOT NULL,
  media_file_id BIGINT NULL,
  step_no INT NOT NULL,
  instruction TEXT NOT NULL,
  timer_seconds INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_recipe_steps_recipe_no (recipe_id, step_no),
  KEY idx_recipe_steps_media (media_file_id),
  CONSTRAINT fk_recipe_steps_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_steps_media FOREIGN KEY (media_file_id) REFERENCES media_files (id) ON DELETE SET NULL
);

CREATE TABLE recipe_likes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  recipe_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_recipe_likes_recipe_user (recipe_id, user_id),
  KEY idx_recipe_likes_user (user_id),
  CONSTRAINT fk_recipe_likes_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_likes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE saved_recipes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  recipe_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_saved_recipes_recipe_user (recipe_id, user_id),
  KEY idx_saved_recipes_user_recent (user_id, created_at),
  CONSTRAINT fk_saved_recipes_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_recipes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE comments (
  id BIGINT NOT NULL AUTO_INCREMENT,
  recipe_id BIGINT NOT NULL,
  author_user_id BIGINT NOT NULL,
  parent_comment_id BIGINT NULL,
  content VARCHAR(500) NOT NULL,
  is_author_reply BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_comments_recipe_parent (recipe_id, parent_comment_id, created_at),
  KEY idx_comments_author (author_user_id),
  KEY idx_comments_parent (parent_comment_id),
  CONSTRAINT fk_comments_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_author FOREIGN KEY (author_user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_parent FOREIGN KEY (parent_comment_id) REFERENCES comments (id) ON DELETE CASCADE
);

CREATE TABLE notifications (
  id BIGINT NOT NULL AUTO_INCREMENT,
  receiver_user_id BIGINT NOT NULL,
  actor_user_id BIGINT NULL,
  recipe_id BIGINT NULL,
  comment_id BIGINT NULL,
  type VARCHAR(40) NOT NULL,
  title VARCHAR(120) NOT NULL,
  message VARCHAR(500) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_notifications_receiver_unread (receiver_user_id, is_read, created_at),
  KEY idx_notifications_actor (actor_user_id),
  KEY idx_notifications_recipe (recipe_id),
  KEY idx_notifications_comment (comment_id),
  CONSTRAINT fk_notifications_receiver FOREIGN KEY (receiver_user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_actor FOREIGN KEY (actor_user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_notifications_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_comment FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE
);

CREATE TABLE user_follows (
  id BIGINT NOT NULL AUTO_INCREMENT,
  follower_user_id BIGINT NOT NULL,
  following_user_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_follows_pair (follower_user_id, following_user_id),
  KEY idx_user_follows_following (following_user_id),
  CONSTRAINT fk_user_follows_follower FOREIGN KEY (follower_user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_user_follows_following FOREIGN KEY (following_user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE ingredient_catalog (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  category VARCHAR(60) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_ingredient_catalog_name (name)
);

CREATE TABLE ingredient_aliases (
  id BIGINT NOT NULL AUTO_INCREMENT,
  ingredient_id BIGINT NOT NULL,
  alias VARCHAR(80) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_ingredient_aliases_alias (alias),
  KEY idx_ingredient_aliases_ingredient (ingredient_id),
  CONSTRAINT fk_ingredient_aliases_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredient_catalog (id) ON DELETE CASCADE
);

CREATE TABLE ingredient_detection_jobs (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  media_file_id BIGINT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_detection_jobs_user_recent (user_id, created_at),
  KEY idx_detection_jobs_media (media_file_id),
  CONSTRAINT fk_detection_jobs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_detection_jobs_media FOREIGN KEY (media_file_id) REFERENCES media_files (id) ON DELETE CASCADE
);

CREATE TABLE ingredient_detection_items (
  id BIGINT NOT NULL AUTO_INCREMENT,
  detection_job_id BIGINT NOT NULL,
  ingredient_id BIGINT NULL,
  detected_name VARCHAR(80) NOT NULL,
  confidence DECIMAL(5, 4) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_detection_items_job (detection_job_id),
  KEY idx_detection_items_ingredient (ingredient_id),
  CONSTRAINT fk_detection_items_job FOREIGN KEY (detection_job_id) REFERENCES ingredient_detection_jobs (id) ON DELETE CASCADE,
  CONSTRAINT fk_detection_items_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredient_catalog (id) ON DELETE SET NULL
);

CREATE TABLE recommendation_requests (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NULL,
  ingredients_json JSON NOT NULL,
  serving INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_recommendation_requests_user (user_id, created_at),
  CONSTRAINT fk_recommendation_requests_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE recommendation_results (
  id BIGINT NOT NULL AUTO_INCREMENT,
  request_id BIGINT NOT NULL,
  recipe_id BIGINT NOT NULL,
  match_rate DECIMAL(5, 4) NOT NULL,
  missing_ingredients_json JSON NULL,
  rank_no INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_recommendation_results_rank (request_id, rank_no),
  KEY idx_recommendation_results_recipe (recipe_id),
  CONSTRAINT fk_recommendation_results_request FOREIGN KEY (request_id) REFERENCES recommendation_requests (id) ON DELETE CASCADE,
  CONSTRAINT fk_recommendation_results_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
);

CREATE TABLE cook_sessions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  recipe_id BIGINT NOT NULL,
  user_id BIGINT NULL,
  device VARCHAR(60) NOT NULL,
  current_step_no INT NOT NULL DEFAULT 1,
  total_steps INT NOT NULL,
  is_finished BOOLEAN NOT NULL DEFAULT FALSE,
  liked_after_finish BOOLEAN NOT NULL DEFAULT FALSE,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_cook_sessions_recipe (recipe_id),
  KEY idx_cook_sessions_user_recent (user_id, started_at),
  CONSTRAINT fk_cook_sessions_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
  CONSTRAINT fk_cook_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE cook_session_steps (
  id BIGINT NOT NULL AUTO_INCREMENT,
  cook_session_id BIGINT NOT NULL,
  recipe_step_id BIGINT NOT NULL,
  step_no INT NOT NULL,
  completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_cook_session_steps_session_step (cook_session_id, step_no),
  KEY idx_cook_session_steps_recipe_step (recipe_step_id),
  CONSTRAINT fk_cook_session_steps_session FOREIGN KEY (cook_session_id) REFERENCES cook_sessions (id) ON DELETE CASCADE,
  CONSTRAINT fk_cook_session_steps_recipe_step FOREIGN KEY (recipe_step_id) REFERENCES recipe_steps (id) ON DELETE CASCADE
);
