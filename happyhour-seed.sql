-- both test users have the password "password"

-- Insert users
INSERT INTO users (username, password, first_name, last_name, email, is_admin)
VALUES ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User',
        'user@user.com',
        FALSE),
       ('testadmin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'Admin',
        'admin@admin.com',
        TRUE);

-- Insert categories
INSERT INTO categories (cat_type) VALUES
  ('Restaurant'),
  ('Cafe'),
  ('Retail'),
  ('Office'),
  ('Gallery'),
  ('Spa'),
  ('Event Space'),
  ('Residence'),
  ('Studio'),
  ('Salon'),
  ('Closed'),
  ('Bar'),
  ('Music Venue'),
  ('Winery');

-- Insert locations
INSERT INTO locations (city, neighborhood) VALUES
  ('Chicago', 'Gold Coast'),
  ('Dubai', 'Downtown Dubai'),
  ('Irvine', 'UCI Research Park'),
  ('Los Angeles', 'Beverly Hills'),
  ('Los Angeles', 'Brentwood'),
  ('Los Angeles', 'Culver City'),
  ('Los Angeles', 'DTLA'),
  ('Los Angeles', 'Echo Park'),
  ('Los Angeles', 'Hermosa Beach'),
  ('Los Angeles', 'Hollywood'),
  ('Los Angeles', 'Mar Vista'),
  ('Los Angeles', 'Mid City'),
  ('Los Angeles', 'Pasadena'),
  ('Los Angeles', 'Santa Monica'),
  ('Los Angeles', 'Silver Lake'),
  ('Los Angeles', 'Venice'),
  ('Los Angeles', 'West Hollywood'),
  ('Mission Viejo', 'Rancho Mission Viejo'),
  ('New York', 'Flatiron'),
  ('New York', 'Williamsburg'),
  ('Newport Beach', 'Lido Village'),
  ('Palm Springs', 'Rancho Mirage'),
  ('San Diego', 'Carlsbad'),
  ('San Diego', 'Carmel Valley'),
  ('San Diego', 'Clairemont Mesa'),
  ('San Diego', 'Coronado'),
  ('San Diego', 'Del Mar'),
  ('San Diego', 'Downtown'),
  ('San Diego', 'East Village'),
  ('San Diego', 'Encinitas'),
  ('San Diego', 'Gaslamp Quarter'),
  ('San Diego', 'Golden Hill'),
  ('San Diego', 'La Jolla'),
  ('San Diego', 'Little Italy'),
  ('San Diego', 'Marina District'),
  ('San Diego', 'Mission Hills'),
  ('San Diego', 'Normal Heights'),
  ('San Diego', 'North Park'),
  ('San Diego', 'Oceanside'),
  ('San Diego', 'Solana Beach'),
  ('San Francisco', 'Mission District'),
  ('Santa Ana', 'Park & Paseo'),
  ('Temecula', 'Temecula');

-- Insert spaces
INSERT INTO spaces (title, description, image_url, category_id, address, location_id, est_year) VALUES
('Animae', 'Modern fusion restaurant yumminess', 'https://images.squarespace-cdn.com/content/v1/5e795a0c72ed9820e962164b/1592097777614-G3Y3NEAYXX5FCF5VBV2L/Web_07.jpg', 1, '969 Pacific Hwy, San Diego, CA, 92101', 35, 2019),
('BÄCOSHOP', 'Baco (Vietnamese taco) cafe that has sadly closed.', 'https://cdn.vox-cdn.com/thumbor/IJWYlpYQMjfpOhlj5uuinpWsvCA=/0x0:2000x1335/1820x1213/filters:focal(840x508:1160x828):format(webp)/cdn.vox-cdn.com/uploads/chorus_image/image/63742502/2017_03_03_BacoShop_003.0.jpg', 11, '9552 Washington Blvd Culver City, CA 90232', 6, 2017),
('Blue Ocean Robata & Sushi Bar', 'Great Sushi and fun atmosphere', 'https://blueoceansushibar.com/wp-content/uploads/2023/07/Interior_1_small-1024x680.png', 1, '2958 Madison St, Carlsbad, CA, 92008', 23, 2014),
('Bracero Cocina De Raiz', 'Modern Mexican fare that has since closed.', 'https://cdn.vox-cdn.com/thumbor/HKXoPCun3VwCsZqZ1pkEqR_RceI=/2200x0/filters:no_upscale()/cdn.vox-cdn.com/uploads/chorus_asset/file/3861302/Bracero-3395.0.jpg', 11, '1490 Kettner Blvd, San Diego, CA 92101', 34, 2015),
('Broadstone Archive', 'New apartment complex in Santa Ana with a secret karaoke room.', 'https://www.aoarchitects.com/wp-content/uploads/Archive_2880x1350_03-scaled.jpg', 8, '1901 E Dyer Rd, Santa Ana, CA, 92705', 42, 2021),
('Broken Spanish', 'Mexican and Southern California fusion restaurant that has since closed.', 'https://cdn.vox-cdn.com/thumbor/s5gT0TBA1peppWWMDtBzKg0yzl0=/2200x0/filters:no_upscale()/cdn.vox-cdn.com/uploads/chorus_asset/file/3812956/2015-06-20-brokenspanish-001.0.jpg', 11, '1050 Flower St, Los Angeles, CA 90015', 7, 2015),
('Broken Spanish Pop-Up', 'Mexican and Southern California fusion residency at NeueHouse that has since closed.', 'https://ftcsfo3digitaloceanspaces.b-cdn.net/optimized/3X/0/8/08d8e1311dd3db8fc8f98492bbad5f5994210526_2_1332x1000.jpeg', 11, '6121 Sunset Blvd, Los Angeles, CA 90028', 10, 2021),
('B.S. Taqueria', 'Mexican and Southern California casual fusion restaurant that has since closed.', 'https://cdn.vox-cdn.com/thumbor/6M-y-N2wkfwrifd9w7qmDTfZ82o=/2200x0/filters:no_upscale()/cdn.vox-cdn.com/uploads/chorus_asset/file/3564368/2015-03-30-bstaqueria-008.0.jpg', 11, '514 W. 7th St, Los Angeles, CA 90014', 7, 2015),
('Campfire', 'Bib Gourmand restaurant specializing in open fire cooking', 'https://afar.brightspotcdn.com/dims4/default/75def59/2147483647/strip/true/crop/728x500+36+0/resize/1320x906!/format/webp/quality/90/?url=https%3A%2F%2Fafar-media-production-web.s3.us-west-2.amazonaws.com%2Fbrightspot%2F98%2Fa4%2Fca2c31e5d731ac7021ed5af80c79%2Foriginal-efca2f636ac65ced2a5f48ac47417123.jpg', 1, '2725 State St, Carlsbad, CA, 92008', 23, 2016),
('Coffee Bean & Tea Leaf 3rd Street Promenade', 'Popular coffee chain that received a special redesign', 'https://s3-media0.fl.yelpcdn.com/bphoto/nfD9klSosC2N021f-H0moQ/o.jpg', 2, '1312 Third St Promenade, Santa Monica, California, 90401', 14, 2016),
('Enclave Cafe', 'Gorgeouse coffee shop that has since closed', 'https://s3-media0.fl.yelpcdn.com/bphoto/QwMlT4apJBVy6oPl4qpCsA/o.jpg', 11, '4655 Executive Dr San Diego, CA 92121', 33, 2012),
('Herb & Ranch', 'Brian Malarkey Ranch Foodz', 'https://images.squarespace-cdn.com/content/v1/5ef26a85d879cd5df1940a4d/1592945832038-VWWPLL2CWMGCLNO6534U/Web_11.jpg', 2, '5301 California Ave, Irvine, CA, 92617', 3, 2019),
('Herb & Sea', 'Brian Malarkey Sea Foodz', 'https://images.squarespace-cdn.com/content/v1/5e7909824663f45adca1fa30/94b0085d-113e-4238-bc99-ff3c205d516d/Web_06.jpg?format=1500w', 1, '131 W D St, Encinitas, CA, 92024', 30, 2019),
('Influx Cafe', 'One of B+W''s first projects. Coffe Shop', 'https://fastly.4sqi.net/img/general/width960/48786292_dbZgJ3mxuaLR_cSHNjhn20GWxjvxLdxYw-YIqIbIOVw.jpg', 2, '1948 Broadway, San Diego, CA, 92102', 32, 2002),
('Jet Rhys Hair', 'hair salon.', 'https://jetrhys.com/wp-content/themes/jetrhys/img/salon-tour/salon-tour-2.jpg', 10 , '437 Hwy 101, Solana Beach, CA, 92075', 40, 2010),
('Jeune et Jolie', 'Michelin Star restaurant specializing in French cuisine', 'https://sandiegomagazine.com/wp-content/uploads/2023/08/0c4fb76e2f4741a70e33453cb47caec6-1.jpg', 1, '2659 State St, Carlsbad, CA, 92008', 23, 2018),
('Juice Served Here 3rd Street', 'Juice bar chain that has since closed', 'https://images.squarespace-cdn.com/content/v1/536a9244e4b0f62696d24c22/1627624247212-UJO0M7EJ8QEFI9K9YTES/JSH-Fashion-Island-12.jpg?format=2500w', 11, '8366 W 3rd St, Los Angeles, CA 90048', 12, 2012),
('Juice Served Here Culver City', 'Juice bar chain that has since closed', 'https://archinect.imgix.net/uploads/gy/gysxa2rprhzdjol5.jpg?fit=crop&auto=compress%2Cformat&w=615&dpr=2', 11, '8820 Washington Blvd. Culver City, CA 90232', 6, 2012),
('Juice Served Here Hollywood', 'Juice bar chain that has since closed', 'https://images.squarespace-cdn.com/content/v1/536a9244e4b0f62696d24c22/1627624247212-UJO0M7EJ8QEFI9K9YTES/JSH-Fashion-Island-12.jpg?format=2500w', 11, '6464 Sunset Blvd, Los Angeles, CA 90028', 10, 2012),
('Juice Served Here Newport Beach', 'Juice bar chain that has since closed', 'https://images.squarespace-cdn.com/content/v1/536a9244e4b0f62696d24c22/1627624247212-UJO0M7EJ8QEFI9K9YTES/JSH-Fashion-Island-12.jpg?format=2500w', 11, '1181 Newport Center Dr, Newport Beach, CA 92660', 21, 2012),
('Juice Served Here Pasadena', 'Juice bar chain that has since closed', 'https://s3-media0.fl.yelpcdn.com/bphoto/T3He2osRdN0SywsUhwaCsw/o.jpg', 11, '59 E Colorado Blvd, Pasadena, CA 91105', 13, 2012),
('Juice Served Here Santa Monica', 'Juice bar chain that has since closed', 'https://images.squarespace-cdn.com/content/v1/536a9244e4b0f62696d24c22/1627624205324-5HRCR5RVSG7F7YZR7URK/JSH-Santa-Monica-4.jpg?format=2500w', 11, '1023 Montana Ave, Santa Monica, CA 90403', 14, 2012),
('Juice Served Here Silver Lake', 'Juice bar chain that has since closed', 'https://s3-media0.fl.yelpcdn.com/bphoto/w4niDY7_iRSq_SsFR5m8VQ/o.jpg', 11, '3827 Sunset Blvd, Los Angeles, CA 90026', 15, 2012),
('Juice Served Here Venice', 'Juice bar chain that has since closed', 'https://cdn.archilovers.com/projects/dd066110-bb01-4427-ac0e-513964955e81.jpg', 11, '609 S Lincoln Blvd, Venice, CA 90291', 16, 2012),
('Leoness Cellars', 'Amazing Winery in Temecula', 'https://assets.simpleviewinc.com/simpleview/image/upload/c_limit,q_75,w_1200/v1/crm/temecula/1_F0E90FA8-5056-A36A-07E9F1602ED18447-f0e90ee85056a36_f0e911fe-5056-a36a-07d242cbcb2e58db.jpg', 14, '38311 De Portola Rd, Temecula, CA 92592', 43, 2017),
('Lola 55', 'Great tacos and even better margaritas.', 'https://media.cntraveler.com/photos/5e41bdd3a007f90008d5bade/16:9/w_1920,c_limit/Lola55-MExicanRestaurant-SanDiego-2020-1.jpg', 1, '1290 F St, San Diego, CA, 92101', 29, 2018),
('Marisi', 'Elevated maximalist Italian restaurant', 'https://cdn.vox-cdn.com/thumbor/AF-PeYlbqfC-XRuTigVSTyCFU0A=/0x0:5943x3962/1200x675/filters:focal(2497x1506:3447x2456)/cdn.vox-cdn.com/uploads/chorus_image/image/71309018/Marisi_Bar_PC_Kimberly_Motos.0.jpg', 1, '1044 Wall St, La Jolla, CA 92037', 33, 2023),
('Marrow Fine Chicago', 'Modern jewelry store with art deco flare', 'https://www.marrowfine.com/cdn/shop/files/marrow-fine-chicago-1.jpg?crop=center&v=1701717081&width=1500', 3, '9 West Walton St, Chicago, IL, 60610', 1, 2023),
('Marrow Fine Newport Beach', 'Modern jewelry store with art deco flare', 'https://www.marrowfine.com/cdn/shop/files/LidoVillage.jpg?crop=center&v=1701991680&width=1500', 3, '343 Via Oporto, Newport Beach, CA, 92663', 21, 2021),
('Marrow Fine San Diego', 'Modern jewelry store with art deco flare', 'https://www.marrowfine.com/cdn/shop/files/20230302_MARROWFINE_ONEPASEO_7.jpg?crop=center&v=1678919165&width=1500', 3, '3665 Caminito Ct, San Diego, CA, 92130', 27, 2019),
('Milo Shoes and Gallery', 'Fun retail store for both shoes and art that has since closed.', 'https://i.pinimg.com/564x/c9/50/1f/c9501fa6fbaf0fe36dd9b0bc2bfd85e7.jpg', 11, '3824 Ray St, San Diego, CA 92104', 38, 2012),
('MiresBall Office', 'office space for MiresBall', 'https://i.pinimg.com/564x/4b/15/66/4b1566f88f651cc3e829c6fb3ac6c5d2.jpg', 4, '2605 State St, San Diego, CA, 92103', 36, 2011),
('n-soto', 'Modern Izakaya by Michelin Star Chef, Niki Nakayama', 'https://cdn.vox-cdn.com/thumbor/da_pGtnupLTPjyJKnruauxxQbmw=/0x0:8203x5469/1720x0/filters:focal(0x0:8203x5469):format(webp):no_upscale()/cdn.vox-cdn.com/uploads/chorus_asset/file/23374468/2022_04_04_nsoto_interior_004.jpg', 1 , '4566 W Washington Blvd, Los Angeles, CA, 90016', 12, 2022),
('Nima', 'Animaes event space for rent', 'https://cdn.vox-cdn.com/uploads/chorus_image/image/65655486/_DSF4047.0.jpg', 7, '969 Pacific Hwy, San Diego, CA, 92101', 35, 2019),
('Parakeet Cafe Beverly Hills', 'San Diego-based eatery specializing in high quality ethically and locally sourced dishes, coffee and baked goods with an elevated interior style.', 'https://s3-media0.fl.yelpcdn.com/bphoto/8l__obCpV5rgjWB1ex2Img/o.jpg', 2 , '206 S Beverly Dr, Beverly Hills, CA 90212', 4, 2023),
('Parakeet Cafe Brentwood', 'San Diego-based eatery specializing in high quality ethically and locally sourced dishes, coffee and baked goods with an elevated interior style.', 'https://s3-media0.fl.yelpcdn.com/bphoto/MFE6o78yZ18i55_yQqBzww/o.jpg', 2 , '13050 San Vicente Blvd, Los Angeles, CA 90049', 5, 2024),
('Parakeet Cafe Carlsbad', 'San Diego-based eatery specializing in high quality ethically and locally sourced dishes, coffee and baked goods with an elevated interior style.', 'https://images.getbento.com/accounts/d4535bdfe54bd0246bc27df676662225/media/images/1256Berry_Cacao_Waffle-md.png?w=1200&fit=crop&auto=compress,format&crop=focalpoint&fp-x=0.5&fp-y=0.5', 2 , '1935 Calle Barcelona, Carlsbad, CA 92009', 23, 2024),
('Parakeet Cafe Coronado', 'San Diego-based eatery specializing in high quality ethically and locally sourced dishes, coffee and baked goods with an elevated interior style.', 'https://s3-media0.fl.yelpcdn.com/bphoto/WCbS0TANhs6tblWlmMoGJg/o.jpg', 2 , '1134 Orange Ave, Coronado, CA 92118', 26, 2024),
('Parakeet Cafe Newport Beach', 'San Diego-based eatery specializing in high quality ethically and locally sourced dishes, coffee and baked goods with an elevated interior style.', 'https://lh5.googleusercontent.com/p/AF1QipM2xGDFof1OQPqx5OuS3E49LwpaioxlA1ZbEHKX=s1030-k-no', 2 , '7972 Pacific Coast Hwy, Newport Beach, CA 92657', 21, 2023),
('Piper', 'New Italian Breakfast and Brunch spot in the Seabird Resort. Fun fact: the Top Gun house is around the corner.', 'https://theseabirdresort.com/wp-content/uploads/2022/10/14072728/Seabird_piperdining1_615166666.png', 1 , '105 Mission Ave, Oceanside, CA, 92054', 39, 2021),
('Providence', '2 Michelin Star Restaurant serving modern French cuisine', 'https://resizer.otstatic.com/v2/photos/xlarge/2/57045720.webp', 1, '5955 Melrose Ave, Los Angeles, CA, 90038', 10, 2023),
('Ramirez Tran Salon', 'High end hair salon that has since closed', 'https://925xtu.com/wp-content/uploads/sites/89/2020/09/698511044.jpg', 11, '8912 W Olympic Blvd Beverly Hills, CA 90211', 4, 2012),
('Ranch Camp', 'Community homes in Mission Viejo', 'https://scontent-lax3-1.xx.fbcdn.net/v/t39.30808-6/280651199_5180095502053602_5203537080775493582_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=c83dfd&_nc_ohc=kvxY6pk4GMYAX_IOzgq&_nc_ht=scontent-lax3-1.xx&oh=00_AfAcdtDTdjHuIFnDVmUhHxfxwZ1-_X7W6RskD2tE2SnD3g&oe=65C4435F', 8, '30225 Ranch Cyn, Rancho Mission Viejo, CA 92694', 18, 2022),
('Red Bull Music Studios', 'Music Studio that gives you wings', 'https://www.redbullmusicstudios.com/dist/img/losangeles/Liveroom.jpg', 9, '1740 Stewart St, Santa Monica, CA, 90404', 14, 2007),
('Remedy Place New York', 'Spa time in NY', 'https://hips.hearstapps.com/hmg-prod/images/vitamin-iv-suites-1667338370.jpg', 6, '12 W 21st St, New York, NY, 10010', 19, 2022),
('Remedy Place West Hollywood', 'Amazing spa', 'https://imageio.forbes.com/specials-images/imageserve/5de34771ea103f000653ccd1/A-menu-of-services-ranges-from-cryotherapy-to-infrared-sauna-and-guided-meditation/960x0.jpg?format=jpg&width=1440', 6, '8305 Sunset Blvd, West Hollywood, CA, 90069', 17, 2019),
('Ryla', 'Modern Asian Fusion Yummers', 'https://cdn.vox-cdn.com/thumbor/B9dpdqtsSFPSrExGSJuyyGxb2rk=/0x0:2000x1333/1720x0/filters:focal(0x0:2000x1333):format(webp):no_upscale()/cdn.vox-cdn.com/uploads/chorus_asset/file/23271863/2022_02_17_RYLA_004.jpg', 1, '1220 Hermosa Ave, Hermosa Beach, CA, 90254', 9, 2022),
('Sea & Smoke', 'Sophisticated brasserie with a modern design that has since closed.', 'https://lh3.googleusercontent.com/proxy/71KJ5F0_m5QQTq8GalzGZAPLYpmjc0M5DZj7mOc9mTrSTp7am-XKJZEcfv8FNHlyLEeH9E1jcOlxoE1dSFiPd3xOFJ2xMzH7fWeNNX83ExchT5_eU2pco3-wNU8vemxbcg7re_rrq6VdJfXNaw7SL9tXFy_AV0FoEKcWLA=s1360-w1360-h1020', 11, '2690 Via De La Valle, Del Mar, CA 92014', 27, 2013),
('Simsim Mediterranean Grill', 'Fast casual Mediterranean food that has since closed.', 'https://s3-media0.fl.yelpcdn.com/bphoto/hOFAVcmP1oVV6Nl5cTxdTQ/o.jpg', 11, '7051 Clairemont Mesa Blvd, San Diego, CA 92111', 25, 2018),
('Somewhere', 'Contemporary restaurant in The Dubai Mall', 'https://wl-img-prd.s3-accelerate.amazonaws.com/d9a95a02-2564-4135-9f8d-678ffd05d6a6-t.jpeg', 1, '305 Level 1 New Extension, The Dubai Mall, Downtown Dubai, Dubai, UAE', 2, 2018),
('Starlite', 'Space Age Magic Bar, the project that basically started it all.', 'https://cdn.vox-cdn.com/thumbor/3qsW95LiVnr8zFcvfSiWlBSo2fI=/1400x1050/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/24016482/IMG_6161.jpg', 1, '3175 India Street, San Diego, CA 92103', 36, 2007),
('Sycamore Den', 'Laid back bar in Normal Heights… nothing normal there.', 'https://cdn.vox-cdn.com/thumbor/6V6ZqwXr2pE4-_bNKAst2oHjI1g=/0x0:5839x3893/1220x813/filters:focal(2735x2300:3669x3234):format(webp)/cdn.vox-cdn.com/uploads/chorus_image/image/70901543/IMG_0011__1_.0.jpg', 12, '3391 Adams Ave, San Diego, CA, 92116', 37, 2013),
('Ten Fifty B', 'Newer apartment building in San Diego''s East Village', 'https://hughesmarino.com/wp-content/uploads/1050-B-Street-seating.jpg', 8, '1050 B St, San Diego, CA, 92101', 29, 2010),
('The Charlie Mar Vista', 'New multi-unit residential space in Mar Vista', 'https://images1.apartments.com/i2/yjESMvOqcRX-VpyR-fyzTsuI1suHPh54ErtUptf7yGk/111/the-charlie-mar-vista-los-angeles-ca-building-photo.jpg', 8, '12444 Venice Blvd, Los Angeles, CA 90066', 11, 2022),
('The Charlie Echo Park', 'New multi-unit residential space in Echo Park', 'https://thecharlieechopark.com/wp-content/uploads/2022/05/CHARLIE_ECHO_56-scaled.jpg', 8, '1100 W Temple St, Los Angeles, CA 90012', 8, 2022),
('The Loft', 'UCSD''s live music venue.', 'https://i.pinimg.com/originals/25/15/8d/25158ddc8ee6c4dd01725512cb6e3269.jpg', 13, '3151 Matthews Ln, La Jolla, CA 92093', 33, 2010),
('The Lion''s Share', 'Intimate and moody bar.', 'https://images.squarespace-cdn.com/content/v1/5a1a4b60f14aa168f5252484/1513991836470-WQHJ9FRZ37RQK9HRHQ1J/The+Lion%27s+Share-8.jpg?format=2500w', 12, '629 Kettner Blvd, San Diego, CA 92101', 35, 2010),
('The Smoking Goat', 'French-American bistro with an upscale farmhouse vibe and exposed-brick walls.', 'https://lh3.googleusercontent.com/p/AF1QipNRwXaT6PHvCjg_WFtGRPYJsLARYcg7CS4ieWD1=s1360-w1360-h1020', 1, '3408 30th St, San Diego, CA 92104', 38, 2010),
('Zeeto', 'Modern office space.', 'https://sandiegolifechanging.org/wp-content/uploads/2017/09/blog_70Compaines.jpg', 4, ' 925 B St, San Diego, CA 92101', 28, 2012);

-- Insert likes
-- INSERT INTO likes (user_id, space_id) VALUES
--   (1, 1), -- Test user likes Starlite
--   (1, 2), -- Test user likes Coffee Haven
--   (2, 1); -- Test admin likes Starlite

-- -- Insert ratings
-- INSERT INTO ratings (user_id, space_id, rating) VALUES
--   (1, 1, 5), -- Test user rates Starlite 5
--   (1, 2, 4), -- Test user rates Coffee Haven 4
--   (2, 1, 4); -- Test admin rates Starlite 4

-- Insert visits
-- INSERT INTO visits (user_id, space_id, visit_date) VALUES
--   (1, 1, '2023-01-01'), -- Test user visits Starlite on January 1, 2023
--   (1, 2, '2023-02-01'), -- Test user visits Coffee Haven on February 1, 2023
--   (2, 1, '2023-03-01'); -- Test admin visits Starlite on March 1, 2023

-- Insert comments
-- INSERT INTO comments (user_id, space_id, comment, comment_date) VALUES
--   (1, 1, 'Love the atmosphere here!', '2023-01-05'), -- Test user comments on Starlite
--   (1, 2, 'Great place to work and sip coffee.', '2023-02-10'), -- Test user comments on Coffee Haven
--   (2, 1, 'Magical experience!', '2023-03-15'); -- Test admin comments on Starlite
