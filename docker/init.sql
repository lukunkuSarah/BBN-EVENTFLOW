-- Schema for EventFlow demo (Postgres)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registrations (
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

-- Demo user (password stored in clear for demo purposes only)
INSERT INTO users (email, name, password_hash)
VALUES ('demo@eventflow.local', 'Demo', 'demo1234')
ON CONFLICT (email) DO NOTHING;

-- Demo events
INSERT INTO events (title, description, date, capacity, created_by)
VALUES
  ('Atelier Vue 3', 'Découverte de Vue 3 et Pinia.', now() + interval '1 day', 50, (SELECT id FROM users WHERE email='demo@eventflow.local')),
  ('API avec Express', 'Construire une API REST et SSE avec Express.', now() + interval '2 days', 100, (SELECT id FROM users WHERE email='demo@eventflow.local')),
  ('PostgreSQL pour débutants', 'Modélisation, requêtes et index.', now() + interval '3 days', 80, (SELECT id FROM users WHERE email='demo@eventflow.local'))
ON CONFLICT DO NOTHING;

