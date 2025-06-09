-- Crear tabla de usuarios en Supabase
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar usuarios de prueba
INSERT INTO users (name, email, password) VALUES
('Jeiner', 'xxx@gmail.com', '123789'),
('Heracots', 'heracots@gmail.com', '123456'),
('Admin', 'admin@test.com', 'admin123')
ON CONFLICT (email) DO NOTHING;