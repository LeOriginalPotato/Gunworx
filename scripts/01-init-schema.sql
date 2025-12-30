-- Making nullable fields that can be empty in inspections
-- Create firearms table
CREATE TABLE IF NOT EXISTS firearms (
  id VARCHAR(255) PRIMARY KEY,
  stock_no VARCHAR(100) NOT NULL UNIQUE,
  date_received DATE NOT NULL,
  make VARCHAR(100) NOT NULL,
  type VARCHAR(100) NOT NULL,
  caliber VARCHAR(50) NOT NULL,
  serial_no VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  surname VARCHAR(255),
  registration_id VARCHAR(100),
  physical_address TEXT,
  licence_no VARCHAR(100),
  licence_date DATE,
  remarks TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'in-stock',
  signature TEXT,
  signature_date TIMESTAMP,
  signed_by VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create inspections table
CREATE TABLE IF NOT EXISTS inspections (
  id VARCHAR(255) PRIMARY KEY,
  date DATE NOT NULL,
  inspector VARCHAR(255) NOT NULL,
  inspector_id VARCHAR(100),
  company_name VARCHAR(255),
  dealer_code VARCHAR(100),
  firearm_type JSONB,
  caliber VARCHAR(50),
  cartridge_code VARCHAR(100),
  serial_numbers JSONB,
  action_type JSONB,
  make VARCHAR(100),
  country_of_origin VARCHAR(100),
  observations TEXT,
  comments TEXT,
  signature TEXT,
  inspector_title VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  full_name VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_firearms_status ON firearms(status);
CREATE INDEX IF NOT EXISTS idx_firearms_stock_no ON firearms(stock_no);
CREATE INDEX IF NOT EXISTS idx_firearms_serial_no ON firearms(serial_no);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON inspections(date);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
