-- ============================================================
-- Seed Data — Inspetroleum Services
-- Run this in Supabase Studio SQL Editor after migration
-- ============================================================

-- NOTE: Create users via Supabase Auth dashboard or the app's register flow.
-- Then promote one to admin:
--   UPDATE public.profiles SET role = 'admin' WHERE id = '<your-user-id>';

-- ── Sample Services ──────────────────────────────────────────
INSERT INTO public.services (title, description, category, price, image_url, features) VALUES

-- OILFIELD_SERVICES
('Directional Drilling Services',
 'Advanced directional and horizontal drilling solutions using state-of-the-art rotary steerable systems to maximize reservoir contact and production efficiency.',
 'OILFIELD_SERVICES', 85000.00, NULL,
 ARRAY['Rotary steerable systems', 'Real-time geo-steering', 'MWD/LWD services', '24/7 technical support']),

('Well Integrity & Cementing',
 'Comprehensive well integrity management including primary cementing, remedial cementing, and wellbore integrity diagnostics to ensure safe and productive wells.',
 'OILFIELD_SERVICES', 42000.00, NULL,
 ARRAY['Primary cementing', 'Squeeze cementing', 'Ultrasonic cement evaluation', 'Zonal isolation']),

('Production Optimization',
 'Data-driven production optimization services combining artificial lift design, flow assurance, and real-time monitoring to maximize field output.',
 'OILFIELD_SERVICES', 28000.00, NULL,
 ARRAY['Artificial lift design', 'Flow assurance', 'Real-time surveillance', 'Production chemistry']),

('Wireline & Perforation',
 'Complete wireline services including open-hole and cased-hole logging, perforating, and mechanical services for formation evaluation and well completion.',
 'OILFIELD_SERVICES', 35000.00, NULL,
 ARRAY['Open-hole logging', 'Cased-hole logging', 'TCP perforating', 'Slickline services']),

-- LNG
('LNG Terminal Design & Engineering',
 'Full-scope LNG terminal engineering from conceptual design through detailed engineering, including liquefaction train design and cryogenic system engineering.',
 'LNG', 150000.00, NULL,
 ARRAY['Conceptual & FEED studies', 'Liquefaction design', 'Cryogenic engineering', 'Safety & HAZOP studies']),

('LNG Storage & Regasification',
 'Design, supply, and commissioning of LNG storage tanks, regasification units, and associated infrastructure for import/export terminals.',
 'LNG', 95000.00, NULL,
 ARRAY['Full containment tanks', 'Open rack vaporizers', 'Submerged combustion vaporizers', 'Metering systems']),

-- INDUSTRIAL_TECH
('Turbomachinery Solutions',
 'Industrial gas turbines, compressors, and pumps for oil & gas, power generation, and process industries. Includes installation, commissioning, and lifecycle services.',
 'INDUSTRIAL_TECH', 210000.00, NULL,
 ARRAY['Gas turbines', 'Centrifugal compressors', 'Reciprocating compressors', 'Remote monitoring']),

('Process Automation & Control',
 'Integrated process control and automation solutions including DCS, SCADA, safety instrumented systems, and digital twin technology for operational excellence.',
 'INDUSTRIAL_TECH', 67000.00, NULL,
 ARRAY['DCS integration', 'SCADA systems', 'SIS/SIL compliance', 'Digital twin deployment']),

-- ENERGY_TRANSITION
('Carbon Capture & Storage Consulting',
 'End-to-end CCS project development including source characterization, transport pipeline design, geological storage site selection, and monitoring & verification.',
 'ENERGY_TRANSITION', 120000.00, NULL,
 ARRAY['Source characterization', 'CO2 transport design', 'Storage site selection', 'MVA programs']),

('Emissions Monitoring & Reporting',
 'Continuous emissions monitoring systems (CEMS), fugitive emissions detection using drone and satellite technology, and ESG reporting frameworks.',
 'ENERGY_TRANSITION', 45000.00, NULL,
 ARRAY['CEMS installation', 'Drone-based LDAR', 'Satellite methane detection', 'ESG reporting']);
