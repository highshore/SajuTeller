-- K-Saju Location Images Update - Replace with Local Pseudo Images
-- Updates all 21 locations with images from src/assets/pseudo directory
-- Each location gets at least 3 images, reusing images as needed

BEGIN;

-- Helper function to create relative paths for the images
-- We'll use the local pseudo images from src/assets/pseudo/

-- Available images in src/assets/pseudo/:
-- 1651732113097.jpg
-- 1651734489956.jpg  
-- 1713242744077-photo-6l22g-601275-0.jpeg
-- 8rPK21688101602.jpg
-- A6knw1705443007.jpg
-- images-1.png
-- images.jpeg
-- images.png
-- main_photo.png
-- sub_photo1.jpg
-- sub_photo2.jpg

-- Note: Skipping NULL assignment due to NOT NULL constraints
-- Will directly update each location with new images

-- Update Tarot Services (ID: 11111111-1111-4111-8111-111111111111)
UPDATE locations SET 
  main_image_url = '/images/1651732113097.jpg',
  image_url = '/images/1651732113097.jpg',
  gallery_images = ARRAY[
    '/images/1651732113097.jpg',
    '/images/1651734489956.jpg',
    '/images/1713242744077-photo-6l22g-601275-0.jpeg'
  ]
WHERE id = '11111111-1111-4111-8111-111111111111';

-- Update Traditional Saju (ID: 22222222-2222-4222-8222-222222222222)
UPDATE locations SET 
  main_image_url = '/images/8rPK21688101602.jpg',
  image_url = '/images/8rPK21688101602.jpg',
  gallery_images = ARRAY[
    '/images/8rPK21688101602.jpg',
    '/images/A6knw1705443007.jpg',
    '/images/images-1.png'
  ]
WHERE id = '22222222-2222-4222-8222-222222222222';

-- Update Palm Reading (ID: 33333333-3333-4333-8333-333333333333)
UPDATE locations SET 
  main_image_url = '/images/images.jpeg',
  image_url = '/images/images.jpeg',
  gallery_images = ARRAY[
    '/images/images.jpeg',
    '/images/images.png',
    '/images/main_photo.png'
  ]
WHERE id = '33333333-3333-4333-8333-333333333333';

-- Update Numerology (ID: 44444444-4444-4444-8444-444444444444)
UPDATE locations SET 
  main_image_url = '/images/sub_photo1.jpg',
  image_url = '/images/sub_photo1.jpg',
  gallery_images = ARRAY[
    '/images/sub_photo1.jpg',
    '/images/sub_photo2.jpg',
    '/images/1651732113097.jpg'
  ]
WHERE id = '44444444-4444-4444-8444-444444444444';

-- Update Crystal Healing (ID: 55555555-5555-4555-8555-555555555555)
UPDATE locations SET 
  main_image_url = '/images/1651734489956.jpg',
  image_url = '/images/1651734489956.jpg',
  gallery_images = ARRAY[
    '/images/1651734489956.jpg',
    '/images/1713242744077-photo-6l22g-601275-0.jpeg',
    '/images/8rPK21688101602.jpg'
  ]
WHERE id = '55555555-5555-4555-8555-555555555555';

-- Update Feng Shui (ID: 66666666-6666-4666-8666-666666666666)
UPDATE locations SET 
  main_image_url = '/images/A6knw1705443007.jpg',
  image_url = '/images/A6knw1705443007.jpg',
  gallery_images = ARRAY[
    '/images/A6knw1705443007.jpg',
    '/images/images-1.png',
    '/images/images.jpeg'
  ]
WHERE id = '66666666-6666-4666-8666-666666666666';

-- Update Dream Interpretation (ID: 77777777-7777-4777-8777-777777777777)
UPDATE locations SET 
  main_image_url = '/images/images.png',
  image_url = '/images/images.png',
  gallery_images = ARRAY[
    '/images/images.png',
    '/images/main_photo.png',
    '/images/sub_photo1.jpg'
  ]
WHERE id = '77777777-7777-4777-8777-777777777777';

-- Update I-Ching (ID: 88888888-8888-4888-8888-888888888888)
UPDATE locations SET 
  main_image_url = '/images/main_photo.png',
  image_url = '/images/main_photo.png',
  gallery_images = ARRAY[
    '/images/main_photo.png',
    '/images/sub_photo2.jpg',
    '/images/1651732113097.jpg'
  ]
WHERE id = '88888888-8888-4888-8888-888888888888';

-- Update Tea Meditation (ID: 99999999-9999-4999-8999-999999999999)
UPDATE locations SET 
  main_image_url = '/images/sub_photo2.jpg',
  image_url = '/images/sub_photo2.jpg',
  gallery_images = ARRAY[
    '/images/sub_photo2.jpg',
    '/images/1651734489956.jpg',
    '/images/1713242744077-photo-6l22g-601275-0.jpeg'
  ]
WHERE id = '99999999-9999-4999-8999-999999999999';

-- Update Astrology (ID: aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa)
UPDATE locations SET 
  main_image_url = '/images/1713242744077-photo-6l22g-601275-0.jpeg',
  image_url = '/images/1713242744077-photo-6l22g-601275-0.jpeg',
  gallery_images = ARRAY[
    '/images/1713242744077-photo-6l22g-601275-0.jpeg',
    '/images/8rPK21688101602.jpg',
    '/images/A6knw1705443007.jpg'
  ]
WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

-- Update Sky Palace (ID: bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb)
UPDATE locations SET 
  main_image_url = '/images/images-1.png',
  image_url = '/images/images-1.png',
  gallery_images = ARRAY[
    '/images/images-1.png',
    '/images/images.jpeg',
    '/images/images.png'
  ]
WHERE id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

-- Update Star Sign Cafe (ID: cccccccc-cccc-4ccc-8ccc-cccccccccccc)
UPDATE locations SET 
  main_image_url = '/images/main_photo.png',
  image_url = '/images/main_photo.png',
  gallery_images = ARRAY[
    '/images/main_photo.png',
    '/images/sub_photo1.jpg',
    '/images/sub_photo2.jpg'
  ]
WHERE id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

-- Update Viking Rune Stone (ID: dddddddd-dddd-4ddd-8ddd-dddddddddddd)
UPDATE locations SET 
  main_image_url = '/images/1651732113097.jpg',
  image_url = '/images/1651732113097.jpg',
  gallery_images = ARRAY[
    '/images/1651732113097.jpg',
    '/images/1651734489956.jpg',
    '/images/8rPK21688101602.jpg'
  ]
WHERE id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

-- Update Celtic Druid/Chakra (ID: eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee)
UPDATE locations SET 
  main_image_url = '/images/A6knw1705443007.jpg',
  image_url = '/images/A6knw1705443007.jpg',
  gallery_images = ARRAY[
    '/images/A6knw1705443007.jpg',
    '/images/images-1.png',
    '/images/images.jpeg'
  ]
WHERE id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';

-- Update Soul Sanctuary (ID: ffffffff-ffff-4fff-8fff-ffffffffffff)
UPDATE locations SET 
  main_image_url = '/images/images.png',
  image_url = '/images/images.png',
  gallery_images = ARRAY[
    '/images/images.png',
    '/images/main_photo.png',
    '/images/sub_photo1.jpg'
  ]
WHERE id = 'ffffffff-ffff-4fff-8fff-ffffffffffff';

-- Update Mystic Oracle Center (ID: aaaabbbb-cccc-4ddd-8eee-ffffaaaabbbb)
UPDATE locations SET 
  main_image_url = '/images/sub_photo2.jpg',
  image_url = '/images/sub_photo2.jpg',
  gallery_images = ARRAY[
    '/images/sub_photo2.jpg',
    '/images/1651732113097.jpg',
    '/images/1651734489956.jpg'
  ]
WHERE id = 'aaaabbbb-cccc-4ddd-8eee-ffffaaaabbbb';

-- Update Oracle Garden Cafe (ID: bbbbcccc-dddd-4eee-8fff-aaaaabbbbccc)
UPDATE locations SET 
  main_image_url = '/images/1713242744077-photo-6l22g-601275-0.jpeg',
  image_url = '/images/1713242744077-photo-6l22g-601275-0.jpeg',
  gallery_images = ARRAY[
    '/images/1713242744077-photo-6l22g-601275-0.jpeg',
    '/images/8rPK21688101602.jpg',
    '/images/A6knw1705443007.jpg'
  ]
WHERE id = 'bbbbcccc-dddd-4eee-8fff-aaaaabbbbccc';

-- Update Fortune Plaza (ID: ccccdddd-eeee-4fff-8aaa-bbbbccccdddd)
UPDATE locations SET 
  main_image_url = '/images/images-1.png',
  image_url = '/images/images-1.png',
  gallery_images = ARRAY[
    '/images/images-1.png',
    '/images/images.jpeg',
    '/images/images.png'
  ]
WHERE id = 'ccccdddd-eeee-4fff-8aaa-bbbbccccdddd';

-- Update Times Square Academy (ID: ddddeeee-ffff-4aaa-8bbb-ccccddddeeee)
UPDATE locations SET 
  main_image_url = '/images/main_photo.png',
  image_url = '/images/main_photo.png',
  gallery_images = ARRAY[
    '/images/main_photo.png',
    '/images/sub_photo1.jpg',
    '/images/sub_photo2.jpg'
  ]
WHERE id = 'ddddeeee-ffff-4aaa-8bbb-ccccddddeeee';

-- Update Yeouido Energy Center (ID: eeeeffff-aaaa-4bbb-8ccc-ddddeeeeefff)
UPDATE locations SET 
  main_image_url = '/images/1651734489956.jpg',
  image_url = '/images/1651734489956.jpg',
  gallery_images = ARRAY[
    '/images/1651734489956.jpg',
    '/images/1713242744077-photo-6l22g-601275-0.jpeg',
    '/images/8rPK21688101602.jpg'
  ]
WHERE id = 'eeeeffff-aaaa-4bbb-8ccc-ddddeeeeefff';

-- Update Premium Sky Center (ID: ffffaaaa-bbbb-4ccc-8ddd-eeeeffffaaaa)
UPDATE locations SET 
  main_image_url = '/images/A6knw1705443007.jpg',
  image_url = '/images/A6knw1705443007.jpg',
  gallery_images = ARRAY[
    '/images/A6knw1705443007.jpg',
    '/images/images-1.png',
    '/images/images.jpeg'
  ]
WHERE id = 'ffffaaaa-bbbb-4ccc-8ddd-eeeeffffaaaa';

-- Fallback: Ensure all locations have a main image
UPDATE locations 
SET 
  main_image_url = '/images/main_photo.png',
  image_url = '/images/main_photo.png'
WHERE main_image_url IS NULL OR main_image_url = '' OR main_image_url NOT LIKE '/images/%';

-- Fallback: Ensure all locations have gallery images
UPDATE locations 
SET gallery_images = ARRAY[
  COALESCE(main_image_url, '/images/main_photo.png'),
  '/images/sub_photo1.jpg',
  '/images/sub_photo2.jpg'
]
WHERE gallery_images IS NULL OR array_length(gallery_images, 1) < 3;

-- Verification query to check the updates
SELECT 
  id, 
  title, 
  main_image_url,
  array_length(gallery_images, 1) as image_count,
  CASE 
    WHEN main_image_url LIKE '/images/%' THEN '✅ Updated with local image'
    WHEN main_image_url IS NULL THEN '❌ No image'
    ELSE '⚠️ External image still present'
  END as status
FROM locations 
ORDER BY title;

-- Count verification
SELECT 
  COUNT(*) as total_locations,
  COUNT(CASE WHEN main_image_url LIKE '/images/%' THEN 1 END) as updated_with_local,
  COUNT(CASE WHEN array_length(gallery_images, 1) >= 3 THEN 1 END) as locations_with_3plus_images
FROM locations;

COMMIT;

-- Success message
SELECT '🎉 All location images have been updated with local pseudo images! Each location now has at least 3 images.' as result;