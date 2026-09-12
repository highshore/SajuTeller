# 🌐 K-Saju Database Localization Setup

This document explains the comprehensive localization system implemented for the K-Saju business detail pages and how to set it up.

## Overview

The localization system ensures that **all content** (both UI text and database content) is displayed in the user's preferred language. The system supports 5 languages:

- **Korean (ko)** - Primary language
- **English (en)** - International users
- **Chinese (zh)** - Chinese market
- **Japanese (ja)** - Japanese market
- **Spanish (es)** - Spanish-speaking markets

## Database Schema Changes

### New Localized Fields Added

The migration adds comprehensive localized fields to the `locations` table:

```sql
-- Title fields
title_ko, title_en, title_zh, title_ja, title_es

-- Subtitle fields  
subtitle_ko, subtitle_en, subtitle_zh, subtitle_ja, subtitle_es

-- Description fields
description_ko, description_en, description_zh, description_ja, description_es

-- Business hours fields
business_hours_ko, business_hours_en, business_hours_zh, business_hours_ja, business_hours_es

-- Price description fields
price_description_ko, price_description_en, price_description_zh, price_description_ja, price_description_es

-- Tagline fields (backward compatibility)
tagline_ko, tagline_en, tagline_zh, tagline_ja, tagline_es
```

## Setup Instructions

### 1. Apply the Database Migration

```bash
# Apply the localization migration
npx supabase db push
```

### 2. Verify Migration Success

Run the helper script to check the migration status:

```bash
node scripts/apply_localization_migration.js
```

### 3. Test Localized Content

1. **Switch languages** in the app UI
2. **Navigate** to a business detail page
3. **Verify** that content appears in the selected language
4. **Check reviews** - they should also be language-appropriate

## How It Works

### Frontend Localization Logic

The system uses a smart fallback mechanism:

```javascript
const getLocalizedContent = (ko, en, zh, ja, es, fallback) => {
  switch (language) {
    case 'ko': return ko || en || fallback;
    case 'en': return en || ko || fallback;
    case 'zh': return zh || ko || en || fallback;
    case 'ja': return ja || ko || en || fallback;
    case 'es': return es || en || ko || fallback;
    default: return en || ko || fallback;
  }
};
```

### Localized Reviews

Pseudo reviews are also localized and include:
- **Authentic names** for each culture
- **Native language text** that feels natural
- **Cultural appropriate content**

### Data Fetching

The business detail page now fetches all localized fields:

```sql
SELECT 
  *, 
  title_ko, title_en, title_zh, title_ja, title_es,
  subtitle_ko, subtitle_en, subtitle_zh, subtitle_ja, subtitle_es,
  description_ko, description_en, description_zh, description_ja, description_es,
  business_hours_ko, business_hours_en, business_hours_zh, business_hours_ja, business_hours_es,
  price_description_ko, price_description_en, price_description_zh, price_description_ja, price_description_es
FROM locations 
WHERE id = $1;
```

## Adding Your Own Localized Content

### Using Supabase Dashboard

1. Go to your Supabase dashboard
2. Navigate to **Table Editor** > **locations**
3. Edit any location record
4. Fill in the localized fields for each language:
   - `title_ko`, `title_en`, `title_zh`, `title_ja`, `title_es`
   - `description_ko`, `description_en`, etc.

### Using SQL

```sql
UPDATE locations 
SET 
  title_ko = '한국어 제목',
  title_en = 'English Title',
  title_zh = '中文标题',
  title_ja = '日本語タイトル',
  title_es = 'Título en Español',
  
  description_ko = '한국어 설명...',
  description_en = 'English description...',
  description_zh = '中文描述...',
  description_ja = '日本語の説明...',
  description_es = 'Descripción en español...'
WHERE id = 'your-location-id';
```

## Best Practices

### 1. Content Quality
- **Native speakers** should review translations
- **Cultural context** should be considered
- **Professional tone** should be maintained across languages

### 2. Fallback Strategy
- Always provide **Korean** content (primary language)
- **English** as secondary fallback
- Other languages can fall back to Korean or English

### 3. Performance
- Database indexes are created for all localized title fields
- Content is fetched in a single query
- Client-side language switching is instant

## Sample Data

The migration includes comprehensive sample data with:
- **Authentic business descriptions** in all 5 languages
- **Culturally appropriate formatting** (lists, emojis, etc.)
- **Professional business hours** translations
- **Localized price descriptions**

## Troubleshooting

### Migration Issues
```bash
# Reset and reapply migrations
npx supabase db reset
npx supabase db push
```

### Missing Translations
- Check if the migration was applied: `\d locations` in psql
- Verify environment variables are set
- Check browser console for data fetching errors

### Performance Issues
- Ensure database indexes exist on localized fields
- Consider caching frequently accessed translations

## Future Enhancements

- **Admin interface** for managing translations
- **Translation memory** system
- **Automatic translation** using AI services
- **Region-specific content** (not just language)
- **SEO optimization** with localized URLs

---

✅ **Status**: Fully implemented and ready for production use!

The localization system now ensures that users see content in their preferred language, creating a truly international experience for K-Saju users worldwide.
