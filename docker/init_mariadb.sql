-- ============================================================
-- EventFlow – Journal d'activité (MariaDB)
-- Base : eventflow_logs
-- ============================================================

-- Table principale : journal de toutes les actions sur les événements
CREATE TABLE IF NOT EXISTS event_logs (
  id          BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  action      ENUM(
                'event_created',
                'event_updated',
                'event_deleted',
                'user_registered',
                'user_cancelled'
              )                NOT NULL,
  event_id    INT              NOT NULL,
  event_title VARCHAR(500)     DEFAULT NULL,
  user_id     INT              DEFAULT NULL,
  details     JSON             DEFAULT NULL,  -- données supplémentaires libres
  created_at  TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_event_id   (event_id),
  INDEX idx_user_id    (user_id),
  INDEX idx_action     (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Journal immutable de toutes les actions EventFlow';


-- Table agrégée : compteurs par événement (dénormalisée pour perf)
CREATE TABLE IF NOT EXISTS event_stats (
  event_id          INT          NOT NULL PRIMARY KEY,
  event_title       VARCHAR(500) DEFAULT NULL,
  total_registers   INT UNSIGNED NOT NULL DEFAULT 0,
  total_cancels     INT UNSIGNED NOT NULL DEFAULT 0,
  last_activity_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Agrégats de statistiques par événement';


-- Données d'exemple (synchronisées avec les démos PostgreSQL)
INSERT IGNORE INTO event_logs (action, event_id, event_title, user_id, details)
VALUES
  ('event_created', 1, 'Atelier Vue 3',               1, '{"capacity": 50}'),
  ('event_created', 2, 'API avec Express',             1, '{"capacity": 100}'),
  ('event_created', 3, 'PostgreSQL pour débutants',    1, '{"capacity": 80}');
