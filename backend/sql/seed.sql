-- Seed data for ArtisanConnect UI demo
USE artisanconnect;

-- Categories (fees + tax)
INSERT INTO categories (category_key, platform_fee, tax_rate) VALUES
  ('plumbing', 6000, 0.075),
  ('electrical', 7000, 0.085),
  ('carpentry', 5500, 0.070),
  ('cleaning', 3000, 0.050),
  ('hvac', 7500, 0.090),
  ('painting', 5000, 0.065),
  ('gardening', 3500, 0.050),
  ('tailoring', 3000, 0.040)
ON DUPLICATE KEY UPDATE platform_fee = VALUES(platform_fee), tax_rate = VALUES(tax_rate);

-- Artisans (IDs match the existing frontend demo)
INSERT INTO artisans
  (id, name, service, category, rating, reviews, hourly_rate, price_range, avatar_url, image_url, description, city, state, lat, lng, tags_json)
VALUES
  (1, 'Mike Johnson', 'Plumber', 'plumbing', 4.9, 128, 45000, '30-50',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
    'Expert plumber with 10+ years experience', 'Lagos', 'Lagos', 6.5244, 3.3792,
    '["Emergency","Residential","Commercial"]'),

  (2, 'David Chen', 'Electrician', 'electrical', 5.0, 96, 55000, '50-100',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop',
    'Licensed electrician specializing in repairs', 'Ikeja', 'Lagos', 6.6018, 3.3515,
    '["Licensed","24/7","Commercial"]'),

  (3, 'Robert Williams', 'Carpenter', 'carpentry', 4.8, 84, 50000, '30-50',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    'Master carpenter for custom furniture', 'Ibadan', 'Oyo', 7.3775, 3.9470,
    '["Custom","Furniture","Repairs"]'),

  (4, 'Lisa Anderson', 'Cleaner', 'cleaning', 4.7, 156, 35000, '0-30',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
    'Professional cleaning services', 'Abuja', 'FCT', 9.0765, 7.3986,
    '["Deep Clean","Move-in/out","Weekly"]'),

  (5, 'Sarah Johnson', 'Plumber', 'plumbing', 5.0, 72, 60000, '50-100',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
    'Expert in all plumbing services', 'Port Harcourt', 'Rivers', 4.8156, 7.0498,
    '["Emergency","Installation","Repairs"]'),

  (6, 'James Miller', 'HVAC Technician', 'hvac', 4.9, 112, 75000, '50-100',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1631545308772-81a0e0a3a6ae?w=400&h=300&fit=crop',
    'HVAC specialist for all systems', 'Lekki', 'Lagos', 6.4698, 3.5852,
    '["Repair","Installation","Maintenance"]'),

  (7, 'Maria Garcia', 'Painter', 'painting', 4.8, 89, 40000, '30-50',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop',
    'Professional painting services', 'Enugu', 'Enugu', 6.5244, 7.5086,
    '["Interior","Exterior","Commercial"]'),

  (8, 'Tom Wilson', 'Gardener', 'gardening', 4.7, 64, 30000, '0-30',
    'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1558905540-21290109218f?w=400&h=300&fit=crop',
    'Expert gardener and landscaper', 'Jos', 'Plateau', 9.8965, 8.8583,
    '["Landscaping","Maintenance","Design"]'),

  (9, 'Chinedu Okafor', 'Generator Technician', 'electrical', 4.9, 211, 50000, '30-50',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop',
    'Generator servicing, rewiring, and load balancing', 'Surulere', 'Lagos', 6.4969, 3.3496,
    '["I-better-pass-my-neighbour","Maintenance","Emergency"]'),

  (10, 'Amina Bello', 'Borehole & Water Pump Technician', 'plumbing', 4.8, 143, 65000, '50-100',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
    'Borehole troubleshooting, pump replacement, and plumbing fixes', 'Kubwa', 'FCT', 9.1498, 7.3305,
    '["Pump Repair","Installation","Fast Response"]'),

  (11, 'Kelechi Nwosu', 'Tiler (Floors & Bathrooms)', 'carpentry', 4.7, 97, 55000, '50-100',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    'Wall/floor tiling, waterproofing, and grout repairs', 'Aba', 'Abia', 5.1066, 7.3667,
    '["Bathrooms","Kitchen","Neat Finish"]'),

  (12, 'Seyi Adeyemi', 'AC Installer & Repair', 'hvac', 4.9, 188, 80000, '50-100',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1631545308772-81a0e0a3a6ae?w=400&h=300&fit=crop',
    'AC installation, gas refill, and troubleshooting', 'Yaba', 'Lagos', 6.5158, 3.3711,
    '["Split Unit","Gas Refill","Maintenance"]'),

  (13, 'Hadiza Musa', 'Laundry & Home Cleaning', 'cleaning', 4.6, 76, 28000, '0-30',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
    'Laundry pickup, deep cleaning, and move-in/out cleanup', 'Kaduna', 'Kaduna', 10.5105, 7.4165,
    '["Laundry","Deep Clean","Trusted"]'),

  (14, 'Ibrahim Sani', 'DSTV / CCTV Installer', 'electrical', 4.8, 121, 35000, '30-50',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop',
    'DSTV alignment, CCTV setup, and cable routing', 'Kano', 'Kano', 12.0022, 8.5919,
    '["DSTV","CCTV","Same Day"]'),

  (15, 'Ngozi Eze', 'Hair Stylist (Home Service)', 'tailoring', 4.7, 58, 25000, '0-30',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop',
    'Braids, wig fixing, and event styling', 'Owerri', 'Imo', 5.4763, 7.0259,
    '["Braids","Fixing","Home Service"]'),

  (16, 'Tunde Salami', 'POP Ceiling & Screeding', 'painting', 4.8, 102, 70000, '50-100',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    'POP ceilings, screeding, and finishing work', 'Ilorin', 'Kwara', 8.4799, 4.5418,
    '["POP","Finishing","Neat"]');

-- Works (minimal seed so the profile UI can show something)
INSERT INTO artisan_works (artisan_id, title, image_url) VALUES
  (1, 'Previous Work by Mike Johnson', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop'),
  (2, 'Previous Work by David Chen', 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop'),
  (3, 'Previous Work by Robert Williams', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'),
  (4, 'Previous Work by Lisa Anderson', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop'),
  (5, 'Previous Work by Sarah Johnson', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop'),
  (6, 'Previous Work by James Miller', 'https://images.unsplash.com/photo-1631545308772-81a0e0a3a6ae?w=400&h=300&fit=crop'),
  (7, 'Previous Work by Maria Garcia', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop'),
  (8, 'Previous Work by Tom Wilson', 'https://images.unsplash.com/photo-1558905540-21290109218f?w=400&h=300&fit=crop'),
  (9, 'Previous Work by Chinedu Okafor', 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop'),
  (10, 'Previous Work by Amina Bello', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop'),
  (11, 'Previous Work by Kelechi Nwosu', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'),
  (12, 'Previous Work by Seyi Adeyemi', 'https://images.unsplash.com/photo-1631545308772-81a0e0a3a6ae?w=400&h=300&fit=crop'),
  (13, 'Previous Work by Hadiza Musa', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop'),
  (14, 'Previous Work by Ibrahim Sani', 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop'),
  (15, 'Previous Work by Ngozi Eze', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop'),
  (16, 'Previous Work by Tunde Salami', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop')
;

-- Reviews (minimal seed)
INSERT INTO artisan_reviews (artisan_id, reviewer_name, rating, review_text) VALUES
  (1, 'Customer 1', 4.9, 'Very professional and quick to respond.'),
  (2, 'Customer 2', 5.0, 'Excellent work and clean finish.'),
  (3, 'Customer 3', 4.8, 'Great craftsmanship.'),
  (4, 'Customer 4', 4.7, 'Reliable and thorough cleaning.'),
  (5, 'Customer 5', 5.0, 'Solved our plumbing issue the same day.'),
  (6, 'Customer 6', 4.9, 'Fast diagnostics and good repair.'),
  (7, 'Customer 7', 4.8, 'Paint job looks amazing.'),
  (8, 'Customer 8', 4.7, 'Our garden looks well maintained.'),
  (9, 'Customer 9', 4.9, 'Strong technical knowledge and fixes worked.'),
  (10, 'Customer 10', 4.8, 'Pump issue resolved quickly.'),
  (11, 'Customer 11', 4.7, 'Tiling looks neat and aligned.'),
  (12, 'Customer 12', 4.9, 'AC repair was done properly.'),
  (13, 'Customer 13', 4.6, 'Laundry service was clean and on time.'),
  (14, 'Customer 14', 4.8, 'DSTV/CCTV installed nicely.'),
  (15, 'Customer 15', 4.7, 'Great styling and attention to detail.'),
  (16, 'Customer 16', 4.8, 'POP ceiling work is neat and smooth.');

