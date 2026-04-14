-- Seed synagogues in South Florida (Aventura, Boca Raton, Sunny Isles Beach, Hollywood)
INSERT INTO synagogues (id, name, denomination, address, city, state, zip, phone, lat, lng, "isVerified") VALUES
  ('syn_001', 'Young Israel of Aventura',                      'MODERN_ORTHODOX', '2999 NE 191st St',         'Aventura',        'FL', '33180', '(305) 937-0030', 25.9620, -80.1393, true),
  ('syn_002', 'Aventura Turnberry Jewish Center',              'CONSERVATIVE',    '20400 NE 30th Ave',         'Aventura',        'FL', '33180', '(305) 931-0986', 25.9581, -80.1356, true),
  ('syn_003', 'Beth Torah Benny Rok Campus',                   'CONSERVATIVE',    '20350 NE 26th Ave',         'Aventura',        'FL', '33180', '(305) 932-2829', 25.9556, -80.1367, true),
  ('syn_004', 'Chabad of Aventura',                            'CHABAD',          '21001 Biscayne Blvd',       'Aventura',        'FL', '33180', '(305) 682-2222', 25.9637, -80.1418, true),
  ('syn_005', 'Shul of Bal Harbour',                           'ORTHODOX',        '9540 Harding Ave',          'Surfside',        'FL', '33154', '(305) 868-1411', 25.8812, -80.1240, true),
  ('syn_006', 'Chabad of Sunny Isles Beach',                   'CHABAD',          '17770 Collins Ave Ste 100', 'Sunny Isles Beach','FL', '33160', '(305) 947-6500', 25.9388, -80.1220, true),
  ('syn_007', 'Young Israel of Sunny Isles Beach',             'ORTHODOX',        '271 174th St',              'Sunny Isles Beach','FL', '33160', '(305) 948-3552', 25.9302, -80.1247, true),
  ('syn_008', 'Temple Beth El of Boca Raton',                  'REFORM',          '333 SW 4th Ave',            'Boca Raton',      'FL', '33432', '(561) 391-8900', 26.3453, -80.0987, true),
  ('syn_009', 'Boca Raton Synagogue',                          'MODERN_ORTHODOX', '7900 Montoya Cir',          'Boca Raton',      'FL', '33433', '(561) 394-5732', 26.3602, -80.1423, true),
  ('syn_010', 'Chabad of Boca Raton',                          'CHABAD',          '17950 Military Trail',      'Boca Raton',      'FL', '33496', '(561) 994-6257', 26.4019, -80.1318, true),
  ('syn_011', 'Anshei Shalom West',                            'CONSERVATIVE',    '8209 Jog Rd',               'Boynton Beach',   'FL', '33472', '(561) 736-7000', 26.4789, -80.1456, true),
  ('syn_012', 'Kol Ami – North Broward',                       'REFORM',          '2501 N University Dr',      'Coral Springs',   'FL', '33065', '(954) 341-7882', 26.2712, -80.2567, false),
  -- Hollywood, FL synagogues
  ('syn_013', 'Young Israel of Hollywood-Fort Lauderdale',  'ORTHODOX',     '3291 Stirling Rd',      'Hollywood',       'FL', '33312', null, 26.0112, -80.2081, true),
  ('syn_014', 'Hollywood Community Synagogue Chabad',        'CHABAD',       '4441 Sheridan St',      'Hollywood',       'FL', '33021', null, 26.0190, -80.1694, true),
  ('syn_015', 'Chabad Lubavitch of Hollywood',               'CHABAD',       '2221 N 46th Ave',       'Hollywood',       'FL', '33021', null, 26.0130, -80.1728, true),
  ('syn_016', 'The Shul of Hollywood Hills',                 'ORTHODOX',     '4801 Sheridan St',      'Hollywood',       'FL', '33021', null, 26.0190, -80.1745, true),
  ('syn_017', 'Young Israel of Hollywood Beach (Beach Shul)','ORTHODOX',     '315 Madison St',        'Hollywood',       'FL', '33019', null, 26.0145, -80.1190, true),
  ('syn_018', 'B''nai Sephardim Synagogue',                  'SEPHARDIC',    '3670 Stirling Rd',      'Fort Lauderdale', 'FL', '33312', null, 26.0112, -80.2120, true),
  ('syn_019', 'Temple Sinai of Hollywood',                   'CONSERVATIVE', '1400 N 46th Ave',       'Hollywood',       'FL', '33021', null, 26.0201, -80.1732, true),
  ('syn_020', 'Temple Beth El of Hollywood',                 'CONSERVATIVE', '1351 S 14th Ave',       'Hollywood',       'FL', '33020', null, 26.0040, -80.1541, true),
  ('syn_021', 'Temple Solel',                                'REFORM',       '5100 Sheridan St',      'Hollywood',       'FL', '33021', null, 26.0190, -80.1813, true),
  ('syn_022', 'Ramat Shalom Synagogue',                      'REFORM',       '11301 Taft St',         'Pembroke Pines',  'FL', '33026', null, 26.0070, -80.2820, true),
  ('syn_023', 'Congregation Beth T''Fillah',                 'CONSERVATIVE', '1926 Hollywood Blvd',   'Hollywood',       'FL', '33020', null, 26.0112, -80.1558, true),
  -- Note: Beth Moshe is listed in Hollywood community guides but confirmed address is in North Miami per national directories
  ('syn_024', 'Beth Moshe Congregation',                     'ORTHODOX',     'Hollywood',             'Hollywood',       'FL', '33020', null, 26.0179, -80.1534, false),
  ('syn_025', 'Aish HaTorah South Florida',                  'ORTHODOX',     '4010 N 46th Ave',       'Hollywood',       'FL', '33021', null, 26.0190, -80.1728, true);

-- Seed properties in Aventura and nearby areas
INSERT INTO properties (id, title, address, city, state, zip, neighborhood, lat, lng, "listingType", status, price, beds, baths, sqft, "yearBuilt", "imageUrls", "isApproved", "isFeatured", "nearestSynagogueId", "nearestSynagugueDist", "synagogueCount1mi") VALUES
  ('prop_001',
   'Spacious 3BR in Aventura – Steps from Shul',
   '19370 Collins Ave #1804', 'Aventura', 'FL', '33160', 'Sunny Isles Beach',
   25.9480, -80.1215,
   'SALE', 'ACTIVE', 64900000, 3, 2.5, 1820, 2008,
   ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
         'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
         'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
   true, true, 'syn_007', 0.38, 3),

  ('prop_002',
   'Modern 2BR Condo | Walk to Chabad',
   '3000 Island Blvd #2103', 'Aventura', 'FL', '33160', 'Williams Island',
   25.9542, -80.1273,
   'SALE', 'ACTIVE', 48500000, 2, 2.0, 1350, 2012,
   ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
         'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
   true, false, 'syn_006', 0.52, 2),

  ('prop_003',
   'Luxury Rental – Turnberry Area',
   '20505 E Country Club Dr #1802', 'Aventura', 'FL', '33180', 'Aventura',
   25.9573, -80.1347,
   'RENT', 'ACTIVE', 450000, 2, 2.0, 1200, 2015,
   ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
         'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'],
   true, true, 'syn_002', 0.21, 4),

  ('prop_004',
   'Family Home – Aventura Near YIAB',
   '3300 NE 190th St', 'Aventura', 'FL', '33180', 'Aventura',
   25.9622, -80.1389,
   'SALE', 'ACTIVE', 89500000, 4, 3.0, 2600, 1998,
   ARRAY['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
         'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800'],
   true, false, 'syn_001', 0.07, 5),

  ('prop_005',
   'Cozy 1BR Rental – Sunny Isles',
   '17555 Collins Ave #904', 'Sunny Isles Beach', 'FL', '33160', 'Sunny Isles Beach',
   25.9362, -80.1225,
   'RENT', 'ACTIVE', 280000, 1, 1.0, 780, 2005,
   ARRAY['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
   true, false, 'syn_006', 0.29, 2),

  ('prop_006',
   'Boca Raton Estate – Near BRS',
   '7750 Montoya Cir', 'Boca Raton', 'FL', '33433', 'Boca',
   26.3588, -80.1411,
   'SALE', 'ACTIVE', 179900000, 5, 4.5, 4200, 2001,
   ARRAY['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
         'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800'],
   true, true, 'syn_009', 0.15, 3),

  ('prop_007',
   'Updated 3BR Townhouse – Boca',
   '6300 NW 2nd Ave', 'Boca Raton', 'FL', '33487', 'East Boca',
   26.3942, -80.0876,
   'SALE', 'ACTIVE', 55000000, 3, 2.5, 1950, 1995,
   ARRAY['https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800',
         'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
   true, false, 'syn_010', 0.72, 2),

  ('prop_008',
   'Penthouse with Ocean View – Sunny Isles',
   '16901 Collins Ave #4801', 'Sunny Isles Beach', 'FL', '33160', 'Sunny Isles Beach',
   25.9298, -80.1219,
   'SALE', 'ACTIVE', 349000000, 4, 4.5, 3800, 2018,
   ARRAY['https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800',
         'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
         'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800'],
   true, true, 'syn_007', 0.44, 2);

-- Populate property_synagogue_distances for seed properties
INSERT INTO property_synagogue_distances ("propertyId", "synagogueId", "distanceMi", "walkMinutes") VALUES
  -- prop_001
  ('prop_001', 'syn_007', 0.38, 8),
  ('prop_001', 'syn_006', 0.61, 12),
  ('prop_001', 'syn_005', 1.21, 24),
  -- prop_002
  ('prop_002', 'syn_006', 0.52, 10),
  ('prop_002', 'syn_007', 0.73, 15),
  -- prop_003
  ('prop_003', 'syn_002', 0.21, 4),
  ('prop_003', 'syn_003', 0.34, 7),
  ('prop_003', 'syn_001', 0.48, 10),
  ('prop_003', 'syn_004', 0.67, 13),
  -- prop_004
  ('prop_004', 'syn_001', 0.07, 2),
  ('prop_004', 'syn_004', 0.23, 5),
  ('prop_004', 'syn_002', 0.45, 9),
  ('prop_004', 'syn_003', 0.52, 10),
  ('prop_004', 'syn_006', 1.38, 28),
  -- prop_005
  ('prop_005', 'syn_006', 0.29, 6),
  ('prop_005', 'syn_007', 0.65, 13),
  -- prop_006
  ('prop_006', 'syn_009', 0.15, 3),
  ('prop_006', 'syn_008', 0.88, 18),
  ('prop_006', 'syn_010', 1.44, 29),
  -- prop_007
  ('prop_007', 'syn_010', 0.72, 14),
  ('prop_007', 'syn_009', 1.31, 26),
  -- prop_008
  ('prop_008', 'syn_007', 0.44, 9),
  ('prop_008', 'syn_006', 0.91, 18);

-- Refresh proximity scores
UPDATE properties p SET
  "proximityScore" = compute_proximity_score(
    p."nearestSynagugueDist",
    p."synagogueCount1mi",
    p."listedAt"
  );
