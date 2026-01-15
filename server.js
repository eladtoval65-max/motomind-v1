require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'motomind',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

// Gov Data Simulation Table (In-Memory)
const MOCK_GOV_DB = {
    '12-345-67': { safety: 6, test_validity: '2026-05-20', stolen: false }, // Good
    '88-999-00': { safety: 2, test_validity: '2024-01-01', stolen: false }, // Expired Test
    '66-666-66': { safety: 4, test_validity: '2025-12-01', stolen: true },  // Stolen
};

app.post('/api/recommendations', async (req, res) => {
    try {
        const { budget, drivingStyle, experienceLevel } = req.body;

        // Map User Input to "Persona"
        let persona = 'Standard';
        if (drivingStyle === 'City') persona = 'Economizer';
        if (drivingStyle === 'Family') persona = 'Safety First';
        if (drivingStyle === 'Performance') persona = 'Enthusiast';

       const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () =>

        let query = `
            SELECT 
                l.id, l.price, l.mileage, l.is_external, l.external_url, 
                l.ownership_type, l.is_gov_verified, l.is_cleared_by_police,
                l.safety_grade, l.test_validity_date, l.is_suspicious,
                cm.make, cm.model, cm.year,
                os.smart_score, os.reliability_score, os.projected_annual_maintenance_cost,
                os.future_resale_value_24m, os.confidence_index, os.negotiation_strategy,
                os.end_of_life_warning, os.persona_match_score
            FROM listings l
            JOIN car_models cm ON l.car_model_id = cm.id
            JOIN oracle_scores os ON l.id = os.listing_id
            WHERE l.price <= $1 * 1.15
            AND l.status = 'active'
        `;

        // Gov API Integration Simulation (Enrichment on read for MVP)
        // In a real app, this runs on ingestion. Here we verify live.

        // Dynamic Sorting based on Persona
        if (persona === 'Safety First') {
            // Prioritize Safety Grade + Reliability
            query += ` ORDER BY l.safety_grade DESC, os.reliability_score DESC`;
        } else if (persona === 'Economizer') {
            // Prioritize Maintenance Cost + Future Value
            query += ` ORDER BY os.projected_annual_maintenance_cost ASC, os.future_resale_value_24m DESC`;
        } else {
            query += ` ORDER BY os.smart_score DESC`;
        }

        query += ` LIMIT 10`;

        const { rows } = await pool.query(query, [budget]);

        // Simulating the "Gov Data Check" and Updating Responses on the Fly
        const enrichedResults = rows.map(car => {
            // Mock Gov Check logic
            // If safety grade is low for a "Safety First" user, add a warning
            if (persona === 'Safety First' && car.safety_grade !== null && car.safety_grade < 4) {
                car.negotiation_strategy += " | WARNING: Low Safety Grade for Family use.";
            }

            // "End of Life" Logic
            const age = new Date().getFullYear() - car.year;
            if (age > 18) {
                car.end_of_life_warning = true;
                car.negotiation_strategy += " | Near Scrapping Age (End of Life Risk).";
            } else if (age > 12) {
                // Maintenance Tax Visual
                car.projected_annual_maintenance_cost = Number(car.projected_annual_maintenance_cost) * 1.15;
            }

            return car;
        });

        // Ensure Hunter Inclusion
        const external = enrichedResults.find(r => r.is_external);
        const internal = enrichedResults.filter(r => !r.is_external).slice(0, 3);

        let finalSet = internal;
        if (finalSet.length < 3 && external) {
            finalSet.push(external);
        } else if (external && !finalSet.includes(external)) {
            finalSet[2] = external;
        }

        res.json(finalSet);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'System Error' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`MotoMind Super-Brain Server running on port ${PORT}`);
});
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.post('/api/recommendations', async (req, res) => {
  try {
    const { budget, drivingStyle, experienceLevel } = req.body;
    
    let query = `
      SELECT l.*, cm.make, cm.model, cm.year, os.smart_score, os.reliability_score
      FROM listings l
      JOIN car_models cm ON l.car_model_id = cm.id
      JOIN oracle_scores os ON l.id = os.listing_id
      WHERE l.price <= $1 * 1.1
      AND l.status = 'active'
      ORDER BY os.smart_score DESC
      LIMIT 3
    `;

    const { rows } = await pool.query(query, [budget]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Oracle Engine Malfunction' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));