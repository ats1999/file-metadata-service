CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- Plaintext for demo or hashed if implementing auth securely
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  original_filename VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50) CHECK (status IN ('uploaded', 'processing', 'processed', 'failed')) NOT NULL DEFAULT 'uploaded',
  extracted_data TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


