-- Additional synagogues: Hollywood FL, Aventura FL, Hallandale Beach FL
INSERT INTO synagogues (id, name, denomination, address, city, state, zip, phone, lat, lng, "isVerified")
VALUES

-- ── Aventura (adding 9 more) ────────────────────────────────────────────────
('syn_026', 'Edmond J. Safra Synagogue',           'SEPHARDIC',       '19275 Mystic Pointe Dr',    'Aventura',        'FL', '33180', '(305) 931-4313', 25.9565, -80.1426, true),
('syn_027', 'Chabad of Aventura North',             'CHABAD',          '2801 NE 210th St',          'Aventura',        'FL', '33180', '(305) 933-0770', 25.9672, -80.1381, true),
('syn_028', 'Congregation Lev Tov',                 'REFORM',          '3599 NE 207th St',          'Aventura',        'FL', '33180', '(305) 935-0070', 25.9681, -80.1369, true),
('syn_029', 'Young Israel of Aventura Beach',       'ORTHODOX',        '3575 NE 207th St',          'Aventura',        'FL', '33180', '(305) 843-3033', 25.9679, -80.1372, true),
('syn_030', 'Beit Mishpacha of Aventura',           'CONSERVATIVE',    '20801 NE 31st Ave',         'Aventura',        'FL', '33180', '(305) 937-5377', 25.9607, -80.1342, true),
('syn_031', 'Chabad at the Aventura Mall',          'CHABAD',          '19501 Biscayne Blvd',       'Aventura',        'FL', '33180', '(305) 792-4770', 25.9614, -80.1404, true),
('syn_032', 'Or Haemet Sephardic Synagogue',        'SEPHARDIC',       '21150 NE 22nd Ave',         'Aventura',        'FL', '33180', null,             25.9650, -80.1360, true),
('syn_033', 'Congregation Shaarei Zion',            'SEPHARDIC',       '2530 NE 207th St',          'Aventura',        'FL', '33180', null,             25.9678, -80.1405, true),
('syn_034', 'Aventura Community Shul',              'MODERN_ORTHODOX', '3100 NE 190th St',          'Aventura',        'FL', '33180', null,             25.9624, -80.1387, false),

-- ── Hollywood (adding 14 more) ──────────────────────────────────────────────
('syn_035', 'Chabad Ocean Synagogue',               'CHABAD',          '7 Seacrest Pkwy',           'Hollywood',       'FL', '33019', '(954) 457-8080', 26.0158, -80.1172, true),
('syn_036', 'Bais Mordechai',                       'ORTHODOX',        '4200 NW 66th Ave',          'Hollywood',       'FL', '33024', '(954) 966-4411', 26.0640, -80.2436, true),
('syn_037', 'Chabad of West Hollywood',             'CHABAD',          '11298 Taft St',             'Hollywood',       'FL', '33026', '(954) 432-0770', 26.0075, -80.2847, true),
('syn_038', 'Hollywood Torah Center',               'ORTHODOX',        '5860 Garfield St',          'Hollywood',       'FL', '33021', '(954) 963-8650', 26.0213, -80.1856, true),
('syn_039', 'Congregation Dor Tikvah',              'CONSERVATIVE',    '2360 Stirling Rd',          'Hollywood',       'FL', '33020', '(954) 921-8810', 26.0108, -80.1670, true),
('syn_040', 'Beth Shalom of Hollywood',             'CONSERVATIVE',    '1400 N 46th Ave',           'Hollywood',       'FL', '33021', '(954) 987-0026', 26.0200, -80.1733, true),
('syn_041', 'Chabad of Hollywood Pines',            'CHABAD',          '3600 N 56th Ave',           'Hollywood',       'FL', '33021', '(954) 302-4770', 26.0290, -80.1950, true),
('syn_042', 'Young Israel of North Hollywood',      'ORTHODOX',        '7100 Taft St',              'Hollywood',       'FL', '33024', null,             26.0080, -80.2550, true),
('syn_043', 'Kol Yisrael',                          'SEPHARDIC',       '2719 Stirling Rd',          'Hollywood',       'FL', '33312', '(954) 964-4740', 26.0112, -80.1720, true),
('syn_044', 'Congregation Etz Chaim',               'ORTHODOX',        '3760 N 46th Ave',           'Hollywood',       'FL', '33021', null,             26.0300, -80.1732, true),
('syn_045', 'Chabad of Hallandale-Hollywood',       'CHABAD',          '416 E Hallandale Beach Blvd','Hollywood',      'FL', '33009', '(954) 458-1754', 25.9813, -80.1559, true),
('syn_046', 'Hollywood Jewish Community Center',    'OTHER',           '101 N 46th Ave',            'Hollywood',       'FL', '33021', '(954) 963-3551', 26.0165, -80.1732, true),
('syn_047', 'Congregation Kneseth Israel',          'ORTHODOX',        '1444 N 46th Ave',           'Hollywood',       'FL', '33021', null,             26.0204, -80.1732, true),
('syn_048', 'Nusach Ari of Hollywood',              'CHABAD',          '2031 Van Buren St',         'Hollywood',       'FL', '33020', null,             26.0095, -80.1571, true),

-- ── Hallandale Beach (adding 6) ─────────────────────────────────────────────
('syn_049', 'Netive Ezra Congregation',             'SEPHARDIC',       '1930 E Hallandale Beach Blvd', 'Hallandale Beach', 'FL', '33009', '(954) 455-8233', 25.9810, -80.1389, true),
('syn_050', 'Chabad of Hallandale Beach',           'CHABAD',          '1295 E Hallandale Beach Blvd', 'Hallandale Beach', 'FL', '33009', '(954) 458-1877', 25.9808, -80.1520, true),
('syn_051', 'Chabad of Golden Isles',               'CHABAD',          '425 Layne Blvd',            'Hallandale Beach', 'FL', '33009', '(954) 864-1674', 25.9873, -80.1319, true),
('syn_052', 'Young Israel of Hallandale',           'ORTHODOX',        '416 NE 8th St',             'Hallandale Beach', 'FL', '33009', '(954) 454-2244', 25.9855, -80.1489, true),
('syn_053', 'Congregation Anshei Sfard',            'ORTHODOX',        '630 NE 7th St',             'Hallandale Beach', 'FL', '33009', null,             25.9862, -80.1472, true),
('syn_054', 'Temple Beth Torah',                    'CONSERVATIVE',    '1401 NE 4th Ave',           'Hallandale Beach', 'FL', '33009', '(954) 456-1325', 25.9839, -80.1442, true);
