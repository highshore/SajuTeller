-- Add comprehensive localization fields to locations table
-- This migration adds localized versions of all text fields for 5 languages: ko, en, zh, ja, es

-- Add localized title fields
ALTER TABLE locations ADD COLUMN IF NOT EXISTS title_ko TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS title_zh TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS title_ja TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS title_es TEXT;

-- Add localized subtitle fields
ALTER TABLE locations ADD COLUMN IF NOT EXISTS subtitle_ko TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS subtitle_en TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS subtitle_zh TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS subtitle_ja TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS subtitle_es TEXT;

-- Add localized description fields
ALTER TABLE locations ADD COLUMN IF NOT EXISTS description_ko TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS description_zh TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS description_ja TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS description_es TEXT;

-- Add localized business hours fields
ALTER TABLE locations ADD COLUMN IF NOT EXISTS business_hours_ko TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS business_hours_en TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS business_hours_zh TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS business_hours_ja TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS business_hours_es TEXT;

-- Add localized price description fields
ALTER TABLE locations ADD COLUMN IF NOT EXISTS price_description_ko TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS price_description_en TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS price_description_zh TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS price_description_ja TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS price_description_es TEXT;

-- Add localized tagline fields (for backward compatibility)
ALTER TABLE locations ADD COLUMN IF NOT EXISTS tagline_ko TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS tagline_en TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS tagline_zh TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS tagline_ja TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS tagline_es TEXT;

-- Update the existing sample data with comprehensive localized content
UPDATE locations 
SET 
  title_ko = 'K-SAJU 프리미엄 사주상담소',
  title_en = 'K-SAJU Premium Fortune Reading Center',
  title_zh = 'K-SAJU 高级四柱推命馆',
  title_ja = 'K-SAJU プレミアム四柱推命館',
  title_es = 'Centro Premium de Lectura de Fortuna K-SAJU',
  
  subtitle_ko = '전통 명리학과 AI 기술의 완벽한 조화',
  subtitle_en = 'Perfect harmony of traditional fortune-telling and AI technology',
  subtitle_zh = '传统命理学与AI技术的完美结合',
  subtitle_ja = '伝統命理学とAI技術の完璧な調和',
  subtitle_es = 'Perfecta armonía entre la adivinación tradicional y la tecnología AI',
  
  description_ko = '🔮 **전통과 혁신의 만남**

수백 년 전통의 명리학과 최첨단 AI 기술을 결합하여 가장 정확하고 상세한 사주 분석을 제공합니다. 개인의 운명과 미래를 깊이 있게 해석하고, 삶의 방향성을 제시하는 프리미엄 사주 상담 서비스입니다.

⭐ **주요 특징**

1. **AI 기반 정밀 분석**: 최신 인공지능 기술로 전통 사주학의 정확도를 한층 높였습니다.
2. **개인 맞춤 상담**: 고객님의 고유한 사주를 바탕으로 개인화된 조언을 제공합니다.
3. **전문가 검증**: 경험 많은 명리학자가 AI 분석 결과를 검토하고 보완합니다.

💡 **서비스 혜택**

- 상세한 운세 리포트 제공
- 실용적이고 구체적인 인생 조언
- 개인정보 완벽 보호 시스템
- 모바일 최적화 서비스',
  
  description_en = '🔮 **Where Tradition Meets Innovation**

We combine centuries-old fortune-telling wisdom with cutting-edge AI technology to provide the most accurate and detailed destiny analysis. Our premium consultation service offers deep interpretation of your fate and future, providing clear direction for your life path.

⭐ **Key Features**

1. **AI-Powered Precision Analysis**: Advanced artificial intelligence enhances the accuracy of traditional fortune-telling methods.
2. **Personalized Consultation**: Customized advice based on your unique birth chart and personal circumstances.
3. **Expert Verification**: Experienced fortune-tellers review and supplement AI analysis results.

💡 **Service Benefits**

- Comprehensive fortune reports
- Practical and specific life guidance
- Complete privacy protection system
- Mobile-optimized service experience',
  
  description_zh = '🔮 **传统与创新的融合**

我们将数百年的命理学传统智慧与尖端AI技术相结合，提供最准确、最详细的命运分析。我们的高级咨询服务深度解读您的命运和未来，为您的人生道路提供明确方向。

⭐ **主要特色**

1. **AI精准分析**: 先进的人工智能技术提升传统算命方法的准确性。
2. **个性化咨询**: 基于您独特的生辰八字和个人情况提供定制建议。
3. **专家验证**: 经验丰富的命理师审核和补充AI分析结果。

💡 **服务优势**

- 提供全面的运势报告
- 实用具体的人生指导
- 完善的隐私保护系统
- 移动端优化服务体验',
  
  description_ja = '🔮 **伝統と革新の融合**

数百年の命理学の伝統的知恵と最先端AI技術を組み合わせ、最も正確で詳細な運命分析を提供しています。私たちのプレミアム相談サービスは、あなたの運命と未来を深く解釈し、人生の明確な方向性を示します。

⭐ **主な特徴**

1. **AI精密分析**: 先進的な人工知能技術で伝統的な占い方法の精度を向上させました。
2. **個人向けカウンセリング**: あなた独自の四柱推命と個人的な状況に基づくカスタマイズされたアドバイス。
3. **専門家検証**: 経験豊富な命理学者がAI分析結果を検討し補完します。

💡 **サービスメリット**

- 包括的な運勢レポート提供
- 実用的で具体的な人生指導
- 完璧なプライバシー保護システム
- モバイル最適化サービス体験',
  
  description_es = '🔮 **Donde la Tradición se Encuentra con la Innovación**

Combinamos la sabiduría ancestral de la adivinación con tecnología AI de vanguardia para proporcionar el análisis de destino más preciso y detallado. Nuestro servicio de consulta premium ofrece una interpretación profunda de su destino y futuro, proporcionando una dirección clara para su camino de vida.

⭐ **Características Principales**

1. **Análisis de Precisión Impulsado por AI**: La inteligencia artificial avanzada mejora la precisión de los métodos tradicionales de adivinación.
2. **Consulta Personalizada**: Consejos personalizados basados en su carta natal única y circunstancias personales.
3. **Verificación de Expertos**: Adivinos experimentados revisan y complementan los resultados del análisis AI.

💡 **Beneficios del Servicio**

- Informes completos de fortuna
- Orientación práctica y específica para la vida
- Sistema completo de protección de privacidad
- Experiencia de servicio optimizada para móviles',
  
  business_hours_ko = '평일 09:00 - 21:00, 주말 10:00 - 18:00',
  business_hours_en = 'Weekdays 09:00 - 21:00, Weekends 10:00 - 18:00',
  business_hours_zh = '工作日 09:00 - 21:00，周末 10:00 - 18:00',
  business_hours_ja = '平日 09:00 - 21:00、週末 10:00 - 18:00',
  business_hours_es = 'Días laborables 09:00 - 21:00, Fines de semana 10:00 - 18:00',
  
  price_description_ko = '1회 상담 기준 (60분)',
  price_description_en = 'Per consultation session (60 minutes)',
  price_description_zh = '每次咨询标准 (60分钟)',
  price_description_ja = '1回相談基準 (60分)',
  price_description_es = 'Por sesión de consulta (60 minutos)',
  
  tagline_ko = '전통 명리학과 AI 기술의 완벽한 조화',
  tagline_en = 'Perfect harmony of traditional fortune-telling and AI technology',
  tagline_zh = '传统命理学与AI技术的完美结合',
  tagline_ja = '伝統命理学とAI技術の完璧な調和',
  tagline_es = 'Perfecta armonía entre la adivinación tradicional y la tecnología AI'
WHERE id = '550e8400-e29b-41d4-a716-446655440002';

-- Create indexes for better query performance on localized fields
CREATE INDEX IF NOT EXISTS idx_locations_title_ko ON locations(title_ko);
CREATE INDEX IF NOT EXISTS idx_locations_title_en ON locations(title_en);
CREATE INDEX IF NOT EXISTS idx_locations_title_zh ON locations(title_zh);
CREATE INDEX IF NOT EXISTS idx_locations_title_ja ON locations(title_ja);
CREATE INDEX IF NOT EXISTS idx_locations_title_es ON locations(title_es);

-- Add comments to document the localization fields
COMMENT ON COLUMN locations.title_ko IS 'Korean localized title';
COMMENT ON COLUMN locations.title_en IS 'English localized title';
COMMENT ON COLUMN locations.title_zh IS 'Chinese localized title';
COMMENT ON COLUMN locations.title_ja IS 'Japanese localized title';
COMMENT ON COLUMN locations.title_es IS 'Spanish localized title';

COMMENT ON COLUMN locations.subtitle_ko IS 'Korean localized subtitle';
COMMENT ON COLUMN locations.subtitle_en IS 'English localized subtitle';
COMMENT ON COLUMN locations.subtitle_zh IS 'Chinese localized subtitle';
COMMENT ON COLUMN locations.subtitle_ja IS 'Japanese localized subtitle';
COMMENT ON COLUMN locations.subtitle_es IS 'Spanish localized subtitle';

COMMENT ON COLUMN locations.description_ko IS 'Korean localized description';
COMMENT ON COLUMN locations.description_en IS 'English localized description';
COMMENT ON COLUMN locations.description_zh IS 'Chinese localized description';
COMMENT ON COLUMN locations.description_ja IS 'Japanese localized description';
COMMENT ON COLUMN locations.description_es IS 'Spanish localized description';

COMMENT ON COLUMN locations.business_hours_ko IS 'Korean localized business hours';
COMMENT ON COLUMN locations.business_hours_en IS 'English localized business hours';
COMMENT ON COLUMN locations.business_hours_zh IS 'Chinese localized business hours';
COMMENT ON COLUMN locations.business_hours_ja IS 'Japanese localized business hours';
COMMENT ON COLUMN locations.business_hours_es IS 'Spanish localized business hours';
