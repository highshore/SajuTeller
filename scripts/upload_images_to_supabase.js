#!/usr/bin/env node

/**
 * Upload pseudo images to Supabase Storage
 * This script uploads all images from src/assets/pseudo/ to Supabase Storage
 * and generates a SQL script with the correct Supabase Storage URLs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.development
config({ path: path.join(__dirname, '..', '.env.development') });

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Checking environment variables...');
console.log('Supabase URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
console.log('Supabase Key:', supabaseServiceKey ? '✅ Found' : '❌ Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env.development file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration
const BUCKET_NAME = 'location-images';
const PSEUDO_IMAGES_DIR = path.join(__dirname, '..', 'src', 'assets', 'pseudo');

// Available images in pseudo directory
const imageFiles = [
  '1651732113097.jpg',
  '1651734489956.jpg',
  '1713242744077-photo-6l22g-601275-0.jpeg',
  '8rPK21688101602.jpg',
  'A6knw1705443007.jpg',
  'images (1).png',
  'images.jpeg',
  'images.png',
  'main_photo.png',
  'sub_photo1.jpg',
  'sub_photo2.jpg'
];

async function ensureBucketExists() {
  console.log('🔍 Checking if bucket exists...');
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.warn('⚠️ Cannot list buckets (permission issue), but continuing...');
    console.log('📝 Note: You may need to create the bucket manually in Supabase dashboard');
    return true; // Continue anyway
  }

  const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
  
  if (!bucketExists) {
    console.log('📦 Attempting to create bucket:', BUCKET_NAME);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true
    });
    
    if (createError) {
      console.warn('⚠️ Could not create bucket automatically (permission issue)');
      console.log('📝 Please create the bucket manually in your Supabase dashboard:');
      console.log(`   1. Go to Storage in your Supabase dashboard`);
      console.log(`   2. Click "New bucket"`);
      console.log(`   3. Name it "${BUCKET_NAME}"`);
      console.log(`   4. Make it public`);
      console.log('📝 Then run this script again');
      return false;
    }
    
    console.log('✅ Bucket created successfully!');
  } else {
    console.log('✅ Bucket already exists');
  }
  
  return true;
}

async function uploadImage(fileName) {
  const filePath = path.join(PSEUDO_IMAGES_DIR, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ File not found: ${filePath}`);
    return null;
  }

  console.log(`📤 Uploading ${fileName}...`);
  
  const fileBuffer = fs.readFileSync(filePath);
  const storageFileName = fileName.replace(/\s+/g, '-'); // Replace spaces with hyphens
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storageFileName, fileBuffer, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error(`❌ Error uploading ${fileName}:`, error);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storageFileName);

  console.log(`✅ Uploaded: ${fileName} → ${urlData.publicUrl}`);
  return {
    originalName: fileName,
    storageName: storageFileName,
    publicUrl: urlData.publicUrl
  };
}

async function uploadAllImages() {
  console.log('🚀 Starting image upload process...');
  
  // Ensure bucket exists
  const bucketReady = await ensureBucketExists();
  if (!bucketReady) {
    console.error('❌ Failed to ensure bucket exists');
    return [];
  }

  // Upload all images
  const uploadResults = [];
  
  for (const fileName of imageFiles) {
    const result = await uploadImage(fileName);
    if (result) {
      uploadResults.push(result);
    }
  }

  console.log(`\n🎉 Upload complete! ${uploadResults.length}/${imageFiles.length} images uploaded successfully.`);
  return uploadResults;
}

function generateSQLScript(uploadedImages) {
  console.log('\n📝 Generating SQL script...');
  
  // Create a mapping of original names to public URLs
  const imageUrlMap = {};
  uploadedImages.forEach(img => {
    imageUrlMap[img.originalName] = img.publicUrl;
  });

  // Helper function to get URL by original name
  const getImageUrl = (originalName) => {
    return imageUrlMap[originalName] || imageUrlMap['main_photo.png'] || uploadedImages[0]?.publicUrl;
  };

  const sqlScript = `-- K-Saju Location Images Update - Supabase Storage URLs
-- Generated automatically by upload_images_to_supabase.js
-- Updates all 21 locations with Supabase Storage URLs

BEGIN;

-- Update Tarot Services (ID: 11111111-1111-4111-8111-111111111111)
UPDATE locations SET 
  main_image_url = '${getImageUrl('1651732113097.jpg')}',
  image_url = '${getImageUrl('1651732113097.jpg')}',
  gallery_images = ARRAY[
    '${getImageUrl('1651732113097.jpg')}',
    '${getImageUrl('1651734489956.jpg')}',
    '${getImageUrl('1713242744077-photo-6l22g-601275-0.jpeg')}'
  ]
WHERE id = '11111111-1111-4111-8111-111111111111';

-- Update Traditional Saju (ID: 22222222-2222-4222-8222-222222222222)
UPDATE locations SET 
  main_image_url = '${getImageUrl('8rPK21688101602.jpg')}',
  image_url = '${getImageUrl('8rPK21688101602.jpg')}',
  gallery_images = ARRAY[
    '${getImageUrl('8rPK21688101602.jpg')}',
    '${getImageUrl('A6knw1705443007.jpg')}',
    '${getImageUrl('images (1).png')}'
  ]
WHERE id = '22222222-2222-4222-8222-222222222222';

-- Update Palm Reading (ID: 33333333-3333-4333-8333-333333333333)
UPDATE locations SET 
  main_image_url = '${getImageUrl('images.jpeg')}',
  image_url = '${getImageUrl('images.jpeg')}',
  gallery_images = ARRAY[
    '${getImageUrl('images.jpeg')}',
    '${getImageUrl('images.png')}',
    '${getImageUrl('main_photo.png')}'
  ]
WHERE id = '33333333-3333-4333-8333-333333333333';

-- Update Numerology (ID: 44444444-4444-4444-8444-444444444444)
UPDATE locations SET 
  main_image_url = '${getImageUrl('sub_photo1.jpg')}',
  image_url = '${getImageUrl('sub_photo1.jpg')}',
  gallery_images = ARRAY[
    '${getImageUrl('sub_photo1.jpg')}',
    '${getImageUrl('sub_photo2.jpg')}',
    '${getImageUrl('1651732113097.jpg')}'
  ]
WHERE id = '44444444-4444-4444-8444-444444444444';

-- Update Crystal Healing (ID: 55555555-5555-4555-8555-555555555555)
UPDATE locations SET 
  main_image_url = '${getImageUrl('1651734489956.jpg')}',
  image_url = '${getImageUrl('1651734489956.jpg')}',
  gallery_images = ARRAY[
    '${getImageUrl('1651734489956.jpg')}',
    '${getImageUrl('1713242744077-photo-6l22g-601275-0.jpeg')}',
    '${getImageUrl('8rPK21688101602.jpg')}'
  ]
WHERE id = '55555555-5555-4555-8555-555555555555';

-- Update Feng Shui (ID: 66666666-6666-4666-8666-666666666666)
UPDATE locations SET 
  main_image_url = '${getImageUrl('A6knw1705443007.jpg')}',
  image_url = '${getImageUrl('A6knw1705443007.jpg')}',
  gallery_images = ARRAY[
    '${getImageUrl('A6knw1705443007.jpg')}',
    '${getImageUrl('images (1).png')}',
    '${getImageUrl('images.jpeg')}'
  ]
WHERE id = '66666666-6666-4666-8666-666666666666';

-- Update Dream Interpretation (ID: 77777777-7777-4777-8777-777777777777)
UPDATE locations SET 
  main_image_url = '${getImageUrl('images.png')}',
  image_url = '${getImageUrl('images.png')}',
  gallery_images = ARRAY[
    '${getImageUrl('images.png')}',
    '${getImageUrl('main_photo.png')}',
    '${getImageUrl('sub_photo1.jpg')}'
  ]
WHERE id = '77777777-7777-4777-8777-777777777777';

-- Update I-Ching (ID: 88888888-8888-4888-8888-888888888888)
UPDATE locations SET 
  main_image_url = '${getImageUrl('main_photo.png')}',
  image_url = '${getImageUrl('main_photo.png')}',
  gallery_images = ARRAY[
    '${getImageUrl('main_photo.png')}',
    '${getImageUrl('sub_photo2.jpg')}',
    '${getImageUrl('1651732113097.jpg')}'
  ]
WHERE id = '88888888-8888-4888-8888-888888888888';

-- Update Tea Meditation (ID: 99999999-9999-4999-8999-999999999999)
UPDATE locations SET 
  main_image_url = '${getImageUrl('sub_photo2.jpg')}',
  image_url = '${getImageUrl('sub_photo2.jpg')}',
  gallery_images = ARRAY[
    '${getImageUrl('sub_photo2.jpg')}',
    '${getImageUrl('1651734489956.jpg')}',
    '${getImageUrl('1713242744077-photo-6l22g-601275-0.jpeg')}'
  ]
WHERE id = '99999999-9999-4999-8999-999999999999';

-- Update Astrology (ID: aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa)
UPDATE locations SET 
  main_image_url = '${getImageUrl('1713242744077-photo-6l22g-601275-0.jpeg')}',
  image_url = '${getImageUrl('1713242744077-photo-6l22g-601275-0.jpeg')}',
  gallery_images = ARRAY[
    '${getImageUrl('1713242744077-photo-6l22g-601275-0.jpeg')}',
    '${getImageUrl('8rPK21688101602.jpg')}',
    '${getImageUrl('A6knw1705443007.jpg')}'
  ]
WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

-- Update Sky Palace (ID: bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb)
UPDATE locations SET 
  main_image_url = '${getImageUrl('images (1).png')}',
  image_url = '${getImageUrl('images (1).png')}',
  gallery_images = ARRAY[
    '${getImageUrl('images (1).png')}',
    '${getImageUrl('images.jpeg')}',
    '${getImageUrl('images.png')}'
  ]
WHERE id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

-- Update Star Sign Cafe (ID: cccccccc-cccc-4ccc-8ccc-cccccccccccc)
UPDATE locations SET 
  main_image_url = '${getImageUrl('main_photo.png')}',
  image_url = '${getImageUrl('main_photo.png')}',
  gallery_images = ARRAY[
    '${getImageUrl('main_photo.png')}',
    '${getImageUrl('sub_photo1.jpg')}',
    '${getImageUrl('sub_photo2.jpg')}'
  ]
WHERE id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

-- Update Viking Rune Stone (ID: dddddddd-dddd-4ddd-8ddd-dddddddddddd)
UPDATE locations SET 
  main_image_url = '${getImageUrl('1651732113097.jpg')}',
  image_url = '${getImageUrl('1651732113097.jpg')}',
  gallery_images = ARRAY[
    '${getImageUrl('1651732113097.jpg')}',
    '${getImageUrl('1651734489956.jpg')}',
    '${getImageUrl('8rPK21688101602.jpg')}'
  ]
WHERE id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

-- Update Celtic Druid/Chakra (ID: eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee)
UPDATE locations SET 
  main_image_url = '${getImageUrl('A6knw1705443007.jpg')}',
  image_url = '${getImageUrl('A6knw1705443007.jpg')}',
  gallery_images = ARRAY[
    '${getImageUrl('A6knw1705443007.jpg')}',
    '${getImageUrl('images (1).png')}',
    '${getImageUrl('images.jpeg')}'
  ]
WHERE id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';

-- Update Soul Sanctuary (ID: ffffffff-ffff-4fff-8fff-ffffffffffff)
UPDATE locations SET 
  main_image_url = '${getImageUrl('images.png')}',
  image_url = '${getImageUrl('images.png')}',
  gallery_images = ARRAY[
    '${getImageUrl('images.png')}',
    '${getImageUrl('main_photo.png')}',
    '${getImageUrl('sub_photo1.jpg')}'
  ]
WHERE id = 'ffffffff-ffff-4fff-8fff-ffffffffffff';

-- Update Mystic Oracle Center (ID: aaaabbbb-cccc-4ddd-8eee-ffffaaaabbbb)
UPDATE locations SET 
  main_image_url = '${getImageUrl('sub_photo2.jpg')}',
  image_url = '${getImageUrl('sub_photo2.jpg')}',
  gallery_images = ARRAY[
    '${getImageUrl('sub_photo2.jpg')}',
    '${getImageUrl('1651732113097.jpg')}',
    '${getImageUrl('1651734489956.jpg')}'
  ]
WHERE id = 'aaaabbbb-cccc-4ddd-8eee-ffffaaaabbbb';

-- Update Oracle Garden Cafe (ID: bbbbcccc-dddd-4eee-8fff-aaaaabbbbccc)
UPDATE locations SET 
  main_image_url = '${getImageUrl('1713242744077-photo-6l22g-601275-0.jpeg')}',
  image_url = '${getImageUrl('1713242744077-photo-6l22g-601275-0.jpeg')}',
  gallery_images = ARRAY[
    '${getImageUrl('1713242744077-photo-6l22g-601275-0.jpeg')}',
    '${getImageUrl('8rPK21688101602.jpg')}',
    '${getImageUrl('A6knw1705443007.jpg')}'
  ]
WHERE id = 'bbbbcccc-dddd-4eee-8fff-aaaaabbbbccc';

-- Update Fortune Plaza (ID: ccccdddd-eeee-4fff-8aaa-bbbbccccdddd)
UPDATE locations SET 
  main_image_url = '${getImageUrl('images (1).png')}',
  image_url = '${getImageUrl('images (1).png')}',
  gallery_images = ARRAY[
    '${getImageUrl('images (1).png')}',
    '${getImageUrl('images.jpeg')}',
    '${getImageUrl('images.png')}'
  ]
WHERE id = 'ccccdddd-eeee-4fff-8aaa-bbbbccccdddd';

-- Update Times Square Academy (ID: ddddeeee-ffff-4aaa-8bbb-ccccddddeeee)
UPDATE locations SET 
  main_image_url = '${getImageUrl('main_photo.png')}',
  image_url = '${getImageUrl('main_photo.png')}',
  gallery_images = ARRAY[
    '${getImageUrl('main_photo.png')}',
    '${getImageUrl('sub_photo1.jpg')}',
    '${getImageUrl('sub_photo2.jpg')}'
  ]
WHERE id = 'ddddeeee-ffff-4aaa-8bbb-ccccddddeeee';

-- Update Yeouido Energy Center (ID: eeeeffff-aaaa-4bbb-8ccc-ddddeeeeefff)
UPDATE locations SET 
  main_image_url = '${getImageUrl('1651734489956.jpg')}',
  image_url = '${getImageUrl('1651734489956.jpg')}',
  gallery_images = ARRAY[
    '${getImageUrl('1651734489956.jpg')}',
    '${getImageUrl('1713242744077-photo-6l22g-601275-0.jpeg')}',
    '${getImageUrl('8rPK21688101602.jpg')}'
  ]
WHERE id = 'eeeeffff-aaaa-4bbb-8ccc-ddddeeeeefff';

-- Update Premium Sky Center (ID: ffffaaaa-bbbb-4ccc-8ddd-eeeeffffaaaa)
UPDATE locations SET 
  main_image_url = '${getImageUrl('A6knw1705443007.jpg')}',
  image_url = '${getImageUrl('A6knw1705443007.jpg')}',
  gallery_images = ARRAY[
    '${getImageUrl('A6knw1705443007.jpg')}',
    '${getImageUrl('images (1).png')}',
    '${getImageUrl('images.jpeg')}'
  ]
WHERE id = 'ffffaaaa-bbbb-4ccc-8ddd-eeeeffffaaaa';

-- Verification query
SELECT 
  id, 
  title, 
  main_image_url,
  array_length(gallery_images, 1) as image_count,
  CASE 
    WHEN main_image_url LIKE '%supabase.co/storage/v1/object/public/location-images/%' THEN '✅ Supabase Storage URL'
    WHEN main_image_url IS NULL THEN '❌ No image'
    ELSE '⚠️ Other URL format'
  END as status
FROM locations 
ORDER BY title;

COMMIT;

-- Success message
SELECT '🎉 All location images updated with Supabase Storage URLs! Each location has at least 3 images.' as result;
`;

  const outputPath = path.join(__dirname, '..', 'update_locations_with_supabase_storage.sql');
  fs.writeFileSync(outputPath, sqlScript);
  
  console.log(`✅ SQL script generated: ${outputPath}`);
  return outputPath;
}

async function main() {
  try {
    console.log('🚀 K-Saju Image Upload to Supabase Storage');
    console.log('===============================================\n');
    
    const uploadedImages = await uploadAllImages();
    
    if (uploadedImages.length === 0) {
      console.error('❌ No images were uploaded successfully');
      process.exit(1);
    }
    
    const sqlScriptPath = generateSQLScript(uploadedImages);
    
    console.log('\n🎉 Upload and SQL generation complete!');
    console.log(`\n📝 Next steps:`);
    console.log(`1. Review the generated SQL script: ${sqlScriptPath}`);
    console.log(`2. Run the SQL script in your Supabase dashboard or locally`);
    console.log(`3. Test your application to verify images are loading correctly`);
    
    console.log('\n📋 Uploaded images:');
    uploadedImages.forEach(img => {
      console.log(`   ✅ ${img.originalName} → ${img.publicUrl}`);
    });
    
  } catch (error) {
    console.error('❌ An error occurred:', error);
    process.exit(1);
  }
}

// Run the script
main();
