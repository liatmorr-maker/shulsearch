-- Fix synagogue addresses and coordinates based on cross-check (April 2026)

-- syn_001: Young Israel of Aventura relocated to Shoppes at the Waterways
UPDATE synagogues SET address = '3575 NE 207th St', lat = 25.9756, lng = -80.1451 WHERE id = 'syn_001';

-- syn_003: Beth Torah — official city is North Miami Beach, not Aventura
UPDATE synagogues SET city = 'North Miami Beach' WHERE id = 'syn_003';

-- syn_005: Shul of Bal Harbour — Collins Ave not Harding Ave
UPDATE synagogues SET address = '9540 Collins Ave', lng = -80.1218 WHERE id = 'syn_005';

-- syn_006: Chabad of Sunny Isles Beach — Atlantic Blvd not Collins Ave
UPDATE synagogues SET address = '17555 Atlantic Blvd', lat = 25.9336, lng = -80.1381 WHERE id = 'syn_006';

-- syn_009: BRS — add "N" suffix to Montoya Cir
UPDATE synagogues SET address = '7900 Montoya Cir N', name = 'Boca Raton Synagogue (BRS)' WHERE id = 'syn_009';

-- syn_010: Chabad Boca — add "N" to Military Trail
UPDATE synagogues SET address = '17950 N Military Trail' WHERE id = 'syn_010';

-- syn_012: Kol Ami merged into Broward Central Synagogue (2025)
UPDATE synagogues SET name = 'Broward Central Synagogue', address = '2151 Riverside Dr', city = 'Coral Springs', zip = '33071', lat = 26.2620, lng = -80.2534, "isVerified" = true WHERE id = 'syn_012';

-- syn_013: City is Fort Lauderdale (zip 33312), not Hollywood
UPDATE synagogues SET city = 'Fort Lauderdale' WHERE id = 'syn_013';

-- syn_015: Possibly closed since 2014 — mark unverified
UPDATE synagogues SET "isVerified" = false WHERE id = 'syn_015';

-- syn_016: Shul of Hollywood Hills correct address is 2215 N 46th Ave
UPDATE synagogues SET address = '2215 N 46th Ave', lat = 26.0140, lng = -80.1728 WHERE id = 'syn_016';

-- syn_017: Correct zip is 33022
UPDATE synagogues SET zip = '33022' WHERE id = 'syn_017';

-- syn_022: Ramat Shalom Beth Israel — address is in Plantation, not Pembroke Pines
UPDATE synagogues SET name = 'Ramat Shalom Beth Israel', address = '11301 W Broward Blvd', city = 'Plantation', zip = '33325', lat = 26.1182, lng = -80.2652 WHERE id = 'syn_022';

-- syn_024: Beth Moshe — real congregation is in North Miami, not Hollywood
UPDATE synagogues SET address = '2225 NE 121st St', city = 'North Miami', zip = '33181', lat = 25.8990, lng = -80.1630, "isVerified" = false WHERE id = 'syn_024';
