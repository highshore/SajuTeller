-- Comprehensive locations and reviews schema migration for K-Saju
-- This migration aligns the database schema with the business_detail.tsx requirements

-- Drop existing tables if they exist (for clean slate)
DROP TABLE IF EXISTS location_reviews CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS places CASCADE;

-- Create places table (geographical locations)
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  postal_code TEXT,
  address_line TEXT NOT NULL,
  place_label TEXT UNIQUE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create locations table (business/service locations)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  
  -- Images
  main_image_url TEXT,
  gallery_images TEXT[],
  icon TEXT DEFAULT '🔮',
  
  -- Service features (stored as JSONB for flexibility)
  features JSONB DEFAULT '[]'::jsonb,
  
  -- Pricing
  base_price INTEGER NOT NULL,
  price_description TEXT DEFAULT '1회 상담 기준',
  currency TEXT DEFAULT 'KRW',
  
  -- Ratings & Reviews
  rating DECIMAL(2,1) DEFAULT 4.5,
  review_count INTEGER DEFAULT 0,
  
  -- Contact information
  phone TEXT,
  email TEXT,
  address TEXT NOT NULL,
  website TEXT,
  
  -- Business hours and operational info
  business_hours TEXT DEFAULT 'Open 09:00 - 21:00',
  
  -- Legacy fields for backward compatibility
  tagline TEXT, -- maps to subtitle
  image_url TEXT, -- maps to main_image_url
  price_krw INTEGER, -- maps to base_price
  activity_level TEXT CHECK (activity_level IN ('LIGHT', 'MODERATE', 'INTENSE')),
  skill_level TEXT CHECK (skill_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
  max_guests_total INTEGER DEFAULT 4,
  min_age INTEGER DEFAULT 18,
  
  -- Relationships
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create location_reviews table
CREATE TABLE location_reviews (
  id SERIAL PRIMARY KEY,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_places_location ON places(latitude, longitude);
CREATE INDEX idx_places_region_city ON places(region, city);
CREATE INDEX idx_locations_place_id ON locations(place_id);
CREATE INDEX idx_locations_rating ON locations(rating);
CREATE INDEX idx_locations_price ON locations(base_price);
CREATE INDEX idx_location_reviews_location_id ON location_reviews(location_id);
CREATE INDEX idx_location_reviews_rating ON location_reviews(rating);
CREATE INDEX idx_location_reviews_created_at ON location_reviews(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "public_can_read_places" ON places FOR SELECT USING (true);
CREATE POLICY "auth_can_manage_places" ON places FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_can_read_locations" ON locations FOR SELECT USING (true);
CREATE POLICY "auth_can_manage_locations" ON locations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_can_read_reviews" ON location_reviews FOR SELECT USING (true);
CREATE POLICY "auth_can_manage_reviews" ON location_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON location_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample place data
INSERT INTO places (id, region, city, district, postal_code, address_line, place_label, latitude, longitude) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  '서울특별시',
  '강남구',
  '역삼동',
  '06234',
  '테헤란로 123, 코리아빌딩 15층',
  'k-saju-gangnam',
  37.5002,
  127.0374
);

-- Insert comprehensive sample location data
INSERT INTO locations (
  id,
  title,
  subtitle,
  description,
  main_image_url,
  gallery_images,
  icon,
  features,
  base_price,
  price_description,
  currency,
  rating,
  review_count,
  phone,
  email,
  address,
  website,
  business_hours,
  tagline,
  image_url,
  price_krw,
  activity_level,
  skill_level,
  max_guests_total,
  min_age,
  place_id
) VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  'K-SAJU 프리미엄 사주상담소',
  '전통 명리학과 AI 기술의 완벽한 조화',
  '수백 년 전통의 명리학과 최첨단 AI 기술을 결합하여 가장 정확하고 상세한 사주 분석을 제공합니다. 개인의 운명과 미래를 깊이 있게 해석하고, 삶의 방향성을 제시하는 프리미엄 사주 상담 서비스입니다. 경험 많은 명리학자와 AI 시스템이 협력하여 전통적 지혜와 현대적 분석의 장점을 모두 활용합니다.',
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&auto=format',
  ARRAY[
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format'
  ],
  '🔮',
  '[
    {"id": 1, "icon": "🤖", "text": "AI 기반 정밀 분석"},
    {"id": 2, "icon": "📊", "text": "상세한 운세 리포트"},
    {"id": 3, "icon": "🎯", "text": "개인 맞춤 상담"},
    {"id": 4, "icon": "⭐", "text": "전문가 검증 시스템"},
    {"id": 5, "icon": "📱", "text": "모바일 최적화 서비스"},
    {"id": 6, "icon": "🔐", "text": "개인정보 완벽 보호"},
    {"id": 7, "icon": "💡", "text": "실용적 조언 제공"},
    {"id": 8, "icon": "🌟", "text": "프리미엄 품질 보장"}
  ]'::jsonb,
  59000,
  '1회 상담 기준 (60분)',
  'KRW',
  4.8,
  127,
  '02-3456-7890',
  'premium@k-saju.com',
  '서울특별시 강남구 역삼동 테헤란로 123, 코리아빌딩 15층',
  'https://www.k-saju.com',
  '평일 09:00 - 21:00, 주말 10:00 - 18:00',
  '전통 명리학과 AI 기술의 완벽한 조화',
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&auto=format',
  59000,
  'LIGHT',
  'BEGINNER',
  2,
  18,
  '550e8400-e29b-41d4-a716-446655440001'
);

-- Insert comprehensive sample reviews
INSERT INTO location_reviews (location_id, name, date, rating, text) VALUES
('550e8400-e29b-41d4-a716-446655440002', '김지혜', '2024-09-25', 5, '정말 놀라운 경험이었습니다! AI 분석과 전통 사주학이 조화롭게 결합되어 매우 정확하고 상세한 분석을 받을 수 있었어요. 특히 제 성격과 앞으로의 운세에 대한 설명이 너무 정확해서 소름이 돋을 정도였습니다. 상담사님도 매우 친절하시고 전문적이었어요.'),
('550e8400-e29b-41d4-a716-446655440002', '박준호', '2024-09-20', 5, '친구 추천으로 방문했는데 기대 이상이었습니다. 60분 동안 정말 꼼꼼하게 상담해주시고, AI 시스템과 전통 명리학의 결합이 인상적이었어요. 특히 직업 운세와 연애 운세에 대한 조언이 매우 실용적이었습니다. 가격이 조금 부담스럽긴 했지만 그만한 값어치는 확실히 했다고 생각합니다.'),
('550e8400-e29b-41d4-a716-446655440002', '이수진', '2024-09-18', 4, '전체적으로 만족스러운 상담이었어요. 시설도 깔끔하고 분위기도 좋았습니다. AI 분석 결과와 전통 사주 해석이 거의 일치해서 신뢰감이 들었어요. 다만 예약이 좀 어려워서 별점을 하나 뺐습니다. 그래도 상담 내용 자체는 정말 좋았어요!'),
('550e8400-e29b-41d4-a716-446655440002', '최민석', '2024-09-15', 5, '회사 동료들과 함께 방문했는데 모두 만족했습니다. 각자의 특성을 정확히 파악하시고 맞춤형 조언을 해주셨어요. 특히 올해와 내년 운세에 대한 상세한 설명이 인상깊었습니다. 프리미엄 서비스라는 이름에 걸맞는 품질이었어요.'),
('550e8400-e29b-41d4-a716-446655440002', '정영미', '2024-09-12', 5, '결혼을 앞두고 궁합을 보러 갔는데 정말 상세하게 분석해주셨어요. AI와 전통 명리학 모두에서 좋은 결과가 나와서 안심이 되었습니다. 상담 후에는 자세한 리포트도 주셔서 나중에 다시 참고할 수 있어서 좋았어요.'),
('550e8400-e29b-41d4-a716-446655440002', '강태현', '2024-09-10', 4, '처음엔 AI 사주라는 게 믿음이 안 갔는데, 직접 체험해보니 정말 정확하더라고요. 제 과거 경험들과 성격 분석이 너무 맞아서 놀랐습니다. 미래에 대한 조언도 구체적이고 실용적이었어요. 추천합니다!'),
('550e8400-e29b-41d4-a716-446655440002', '윤서연', '2024-09-08', 5, 'K-SAJU는 정말 다른 곳과는 차원이 다르네요. 상담소 분위기부터 고급스럽고, 상담사님의 전문성도 뛰어나셨어요. AI 분석 결과와 전통 사주 해석을 비교해서 설명해주시니까 더욱 신뢰가 갔습니다. 가격은 좀 비싸지만 그만한 값어치를 합니다.'),
('550e8400-e29b-41d4-a716-446655440002', '임도윤', '2024-09-05', 5, '직장에서 스트레스가 많아서 상담받으러 갔는데, 정말 도움이 많이 되었어요. 제 성향과 현재 상황을 정확히 파악하시고, 앞으로 어떻게 해야 할지 구체적인 방향을 제시해주셨습니다. 마음이 많이 편해졌어요.'),
('550e8400-e29b-41d4-a716-446655440002', '조은별', '2024-09-03', 4, '예약하기까지 시간이 좀 걸렸지만, 기다린 보람이 있었어요. 상담 내용이 정말 상세하고 개인적이었습니다. 특히 건강 운세와 재물 운세에 대한 설명이 구체적이어서 도움이 되었어요. 다음에도 이용할 의향이 있습니다.'),
('550e8400-e29b-41d4-a716-446655440002', '한지우', '2024-09-01', 5, '어머니 추천으로 방문했는데 정말 만족스럽습니다. 전통적인 사주 해석과 현대적인 AI 분석이 절묘하게 조화를 이루고 있어요. 상담사님이 정말 친절하시고 설명도 이해하기 쉽게 해주셨습니다. 강력 추천!'),
('550e8400-e29b-41d4-a716-446655440002', '신재혁', '2024-08-28', 4, '사업 운세를 보러 갔는데 매우 도움이 되었습니다. AI 분석과 전통 명리학이 모두 비슷한 결과를 보여줘서 신뢰할 수 있었어요. 올해 하반기와 내년도 사업 계획에 반영할 수 있는 좋은 조언들을 얻었습니다.'),
('550e8400-e29b-41d4-a716-446655440002', '오하늘', '2024-08-25', 5, '연애 운세 상담을 받았는데 정말 정확하더라고요! 현재 연인과의 관계에서 어려움을 겪고 있었는데, 그 이유와 해결 방법을 명확하게 제시해주셨어요. 상담 후 관계가 많이 개선되었습니다. 감사합니다!'),
('550e8400-e29b-41d4-a716-446655440002', '배소희', '2024-08-22', 5, '전체적으로 인생 전반에 대한 상담을 받았는데 정말 만족스럽습니다. 과거, 현재, 미래를 종합적으로 분석해주시고, 각 시기별로 주의해야 할 점들을 상세히 알려주셨어요. 프리미엄 서비스라는 이름이 아깝지 않네요.'),
('550e8400-e29b-41d4-a716-446655440002', '남궁민', '2024-08-20', 4, '취업 준비로 고민이 많았는데 진로 상담을 받고 방향이 명확해졌습니다. AI 분석 결과가 제 적성과 성향을 정확히 파악해서 놀랐어요. 앞으로의 진로 계획을 세우는 데 큰 도움이 되었습니다. 추천해요!'),
('550e8400-e29b-41d4-a716-446655440002', '송가연', '2024-08-18', 5, '이사를 앞두고 방위와 시기를 상담받으러 갔는데 정말 전문적이었어요. 전통 명리학과 AI 분석 모두에서 일치하는 결과가 나와서 확신을 갖고 이사할 수 있었습니다. 세심한 배려와 전문성에 감동받았어요.');

-- Update review count in locations table based on actual review count
UPDATE locations 
SET review_count = (
  SELECT COUNT(*) 
  FROM location_reviews 
  WHERE location_reviews.location_id = locations.id
)
WHERE id = '550e8400-e29b-41d4-a716-446655440002';

-- Update rating in locations table based on actual review ratings
UPDATE locations 
SET rating = (
  SELECT ROUND(AVG(rating)::numeric, 1) 
  FROM location_reviews 
  WHERE location_reviews.location_id = locations.id
)
WHERE id = '550e8400-e29b-41d4-a716-446655440002';
