-- Additional synagogues: Boca Raton, Sunny Isles Beach, Fort Lauderdale, Pembroke Pines, Surfside
-- Note: skips synagogues already seeded in 001/002 migrations
INSERT INTO synagogues (id, name, denomination, address, city, state, zip, phone, lat, lng, "isVerified")
VALUES

-- ── Boca Raton (adding 9 more; syn_008/009/010 already exist) ───────────────
('syn_055', 'Boca Jewish Center',                  'ORTHODOX',        '21065 Powerline Rd',        'Boca Raton',      'FL', '33433', '(561) 477-8872', 26.3490, -80.1480, true),
('syn_056', 'Young Israel of Boca Raton',           'ORTHODOX',        '7200 Palmetto Circle N',    'Boca Raton',      'FL', '33433', '(561) 391-3235', 26.3600, -80.1380, true),
('syn_057', 'Chabad of West Boca Raton',            'CHABAD',          '19701 State Road 7',        'Boca Raton',      'FL', '33498', '(561) 487-2934', 26.4050, -80.1855, true),
('syn_058', 'B''nai Torah Congregation',            'CONSERVATIVE',    '6261 SW 18th St',           'Boca Raton',      'FL', '33433', '(561) 392-8566', 26.3310, -80.1275, true),
('syn_059', 'Temple Beth Shalom',                   'CONSERVATIVE',    '19140 Lyons Rd',            'Boca Raton',      'FL', '33434', '(561) 483-5557', 26.3938, -80.1679, true),
('syn_060', 'Congregation Shaarei Kodesh',          'CONSERVATIVE',    '19785 Hampton Dr',          'Boca Raton',      'FL', '33434', '(561) 852-6555', 26.3967, -80.1518, true),
('syn_061', 'Congregation B''nai Israel',           'REFORM',          '2200 Yamato Rd',            'Boca Raton',      'FL', '33431', '(561) 241-8118', 26.3876, -80.1022, true),
('syn_062', 'Beth Midrash Sepharadi of Boca',       'SEPHARDIC',       '21301 Powerline Rd',        'Boca Raton',      'FL', '33433', '(786) 262-3955', 26.3479, -80.1481, true),
('syn_063', 'Temple Beth El Yamato Campus',         'REFORM',          '9800 Yamato Rd',            'Boca Raton',      'FL', '33434', '(561) 391-9091', 26.4167, -80.1582, true),

-- ── Sunny Isles Beach (adding 3 more; syn_006/007 already exist) ────────────
('syn_064', 'Chabad of Golden Beach',               'CHABAD',          '19201 Collins Ave',         'Sunny Isles Beach','FL', '33160', '(305) 705-0773', 25.9527, -80.1224, true),
('syn_065', 'Young Israel of Sunny Isles North',    'MODERN_ORTHODOX', '17395 N Bay Rd',            'Sunny Isles Beach','FL', '33160', '(305) 935-9095', 25.9352, -80.1267, true),
('syn_066', 'Beit Rambam Congregation',             'SEPHARDIC',       '200 178th St',              'Sunny Isles Beach','FL', '33160', '(305) 935-6133', 25.9311, -80.1278, true),

-- ── Fort Lauderdale (adding 4 more; syn_018 already exists) ─────────────────
('syn_067', 'Chabad of Fort Lauderdale',            'CHABAD',          '3500 N Ocean Blvd',         'Fort Lauderdale', 'FL', '33308', '(954) 568-1190', 26.1845, -80.1012, true),
('syn_068', 'Temple Bat Yam',                       'REFORM',          '5151 NE 14th Terrace',      'Fort Lauderdale', 'FL', '33334', '(954) 928-0410', 26.1670, -80.1105, true),
('syn_069', 'Temple Beth Israel',                   'CONSERVATIVE',    '7100 W Oakland Park Blvd',  'Fort Lauderdale', 'FL', '33313', '(954) 742-4040', 26.1742, -80.2356, true),
('syn_070', 'Eliyahu Hanavi Sephardic Congregation','SEPHARDIC',       '2615 Stirling Rd',          'Fort Lauderdale', 'FL', '33312', '(954) 281-2871', 26.0115, -80.1700, true),

-- ── Pembroke Pines (adding 3 more; syn_022 already exists) ──────────────────
('syn_071', 'Chabad of Pembroke Pines',             'CHABAD',          '18490 Johnson St',          'Pembroke Pines',  'FL', '33029', '(954) 391-9999', 26.0040, -80.3335, true),
('syn_072', 'Pembroke Pines Jewish Center',         'CONSERVATIVE',    '1200 SW 136th Ave',         'Pembroke Pines',  'FL', '33027', '(954) 431-3300', 26.0213, -80.3419, true),
('syn_073', 'Chabad of Century Village',            'CHABAD',          '13600 SW 10th St',          'Pembroke Pines',  'FL', '33027', '(954) 450-1191', 26.0188, -80.3118, true),

-- ── Surfside (adding 2 more; syn_005 already exists) ────────────────────────
('syn_074', 'The Sephardic Center of Surfside',     'SEPHARDIC',       '9524 Abbott Ave',           'Surfside',        'FL', '33154', '(305) 204-9333', 25.8805, -80.1281, true),
('syn_075', 'Young Israel of Bal Harbour',          'MODERN_ORTHODOX', '9580 Abbott Ave',           'Surfside',        'FL', '33154', '(305) 866-0203', 25.8810, -80.1281, true);
