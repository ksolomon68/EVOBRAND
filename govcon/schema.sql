CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, password TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','editor','viewer')));
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, email TEXT NOT NULL REFERENCES users(email), expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS records (
 id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('opportunities','awards','contacts','partners','tasks')),
 title TEXT NOT NULL, source TEXT, external_id TEXT, parent TEXT REFERENCES records(id),
 data TEXT NOT NULL CHECK(json_valid(data)), created TEXT NOT NULL, updated TEXT NOT NULL,
 UNIQUE(kind, source, external_id)
);
CREATE TABLE IF NOT EXISTS activity (
 id INTEGER PRIMARY KEY, record_id TEXT NOT NULL REFERENCES records(id),
 actor TEXT NOT NULL REFERENCES users(email), action TEXT NOT NULL, snapshot TEXT NOT NULL CHECK(json_valid(snapshot)), at TEXT NOT NULL
);
