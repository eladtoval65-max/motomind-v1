-- MotoMind Super-Brain Schema
-- Focus: 100% Accuracy, Gov Data, & Lifecycle Logic

-- 1. Users & Auth
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Base Vehicle Data
CREATE TABLE car_models (
    id SERIAL PRIMARY KEY,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    generation_code VARCHAR(50),
    trim_level VARCHAR(100),
    engine_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(make, model, year, trim_level)
);

-- 3. Predictive Maintenance (The Knowledge Base)
CREATE TABLE predictive_maintenance (
    id SERIAL PRIMARY KEY,
    car_model_id INT REFERENCES car_models(id) ON DELETE CASCADE,
    component_name VARCHAR(100) NOT NULL, 
    description TEXT,
    mileage_threshold INT NOT NULL, 
    failure_probability DECIMAL(5, 4) NOT NULL, 
    estimated_repair_cost DECIMAL(10, 2) NOT NULL, 
    severity_score INT CHECK (severity_score BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Market Values
CREATE TABLE market_values (
    id SERIAL PRIMARY KEY,
    car_model_id INT REFERENCES car_models(id),
    avg_market_price DECIMAL(10, 2) NOT NULL,
    annual_depreciation_rate DECIMAL(4, 3) DEFAULT 0.12,
    recorded_at DATE DEFAULT CURRENT_DATE
);

-- 5. Listings (The Inventory)
-- Added: Gov Data Fields (Safety, Test Dates) & Suspicion Flag
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    car_model_id INT REFERENCES car_models(id),
    
    price DECIMAL(10, 2) NOT NULL,
    mileage INT NOT NULL,
    manufacture_year INT NOT NULL,
    hand INT, 
    
    -- Gov / Truth Layer
    vin_number VARCHAR(17) UNIQUE,
    license_plate VARCHAR(20),
    ownership_type VARCHAR(20) DEFAULT 'Private', 
    
    safety_grade INT DEFAULT 0, -- 0-8 (Ministry of Transport)
    last_test_date DATE,
    test_validity_date DATE,
    
    is_gov_verified BOOLEAN DEFAULT FALSE,
    is_cleared_by_police BOOLEAN DEFAULT TRUE,
    is_suspicious BOOLEAN DEFAULT FALSE, -- Mismatch flag
    
    description TEXT,
    location VARCHAR(100),
    is_external BOOLEAN DEFAULT FALSE, 
    external_url TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Oracle Scores
-- Added: Persona Match, End of Life Warning
CREATE TABLE oracle_scores (
    id SERIAL PRIMARY KEY,
    listing_id INT REFERENCES listings(id) ON DELETE CASCADE UNIQUE,
    
    smart_score DECIMAL(3, 1), 
    reliability_score DECIMAL(3, 1),
    value_for_money_score DECIMAL(3, 1),
    persona_match_score DECIMAL(3, 1), -- Dynamic score based on user persona
    
    projected_annual_maintenance_cost DECIMAL(10, 2),
    future_resale_value_24m DECIMAL(10, 2),
    
    confidence_index INT DEFAULT 50,
    negotiation_strategy TEXT,
    end_of_life_warning BOOLEAN DEFAULT FALSE, -- For antique/scrap age cars
    
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_listings_car_model ON listings(car_model_id);
CREATE INDEX idx_listings_vin ON listings(vin_number);
CREATE INDEX idx_listings_plate ON listings(license_plate);

