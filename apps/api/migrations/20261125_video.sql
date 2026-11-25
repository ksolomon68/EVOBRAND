CREATE TABLE IF NOT EXISTS crm_videos (
 id CHAR(36) PRIMARY KEY, title VARCHAR(200) NOT NULL, copy TEXT,
 cta_label VARCHAR(100), cta_url VARCHAR(2048),
 status VARCHAR(20) NOT NULL DEFAULT 'queued', error VARCHAR(500),
 gif_start FLOAT NOT NULL DEFAULT 0, gif_duration FLOAT NOT NULL DEFAULT 3,
 duration FLOAT, gif_bytes INT, attempts INT NOT NULL DEFAULT 0,
 created_by INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 INDEX video_queue(status, created_at)
);
CREATE TABLE IF NOT EXISTS crm_video_events (
 id BIGINT AUTO_INCREMENT PRIMARY KEY, video_id CHAR(36) NOT NULL,
 campaign_id INT NOT NULL DEFAULT 0, session_id VARCHAR(64) NOT NULL,
 event_type VARCHAR(20) NOT NULL, automated BOOLEAN NOT NULL DEFAULT FALSE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY video_event_once(video_id, campaign_id, session_id, event_type),
 INDEX video_campaign(campaign_id, created_at)
);
