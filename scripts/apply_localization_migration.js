#!/usr/bin/env node

/**
 * Script to apply the comprehensive localization migration
 * This script helps users apply the database migration and verify the changes
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`${colors.cyan}${colors.bright}${msg}${colors.reset}`)
};

async function main() {
  log.header('\n🌐 K-Saju Localization Migration Tool');
  log.header('=====================================\n');

  // Check for environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cwvtwqesfioqysaafqvg.supabase.co';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3dnR3cWVzZmlvcXlzYWFmcXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MzYxNjgsImV4cCI6MjA3NDExMjE2OH0.BumvBBQRlw4cPj5FJa7SnCQOAncxkt7S_mI0H9J3gkE';

  if (!supabaseUrl || !supabaseAnonKey) {
    log.error('Missing Supabase environment variables!');
    log.info('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    log.info('Checking current database schema...');
    
    // Check if localized fields already exist
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'locations')
      .eq('table_schema', 'public');

    if (columnsError) {
      log.error('Error checking database schema: ' + columnsError.message);
      return;
    }

    const columnNames = columns.map(col => col.column_name);
    const localizedColumns = [
      'title_ko', 'title_en', 'title_zh', 'title_ja', 'title_es',
      'subtitle_ko', 'subtitle_en', 'subtitle_zh', 'subtitle_ja', 'subtitle_es',
      'description_ko', 'description_en', 'description_zh', 'description_ja', 'description_es'
    ];

    const missingColumns = localizedColumns.filter(col => !columnNames.includes(col));

    if (missingColumns.length === 0) {
      log.success('All localized columns already exist!');
    } else {
      log.warning(`Missing localized columns: ${missingColumns.join(', ')}`);
      log.info('You need to apply the migration file:');
      log.info('  supabase/migrations/20250929_add_comprehensive_localization.sql');
      log.info('\nTo apply it, run:');
      log.info('  npx supabase db push');
    }

    // Check if sample data has localized content
    log.info('\nChecking sample data localization...');
    const { data: sampleLocation, error: sampleError } = await supabase
      .from('locations')
      .select('id, title, title_ko, title_en, title_zh, title_ja, title_es')
      .limit(1)
      .single();

    if (sampleError) {
      log.warning('No sample location data found. This is normal for a fresh installation.');
    } else {
      const hasLocalizedData = sampleLocation.title_ko || sampleLocation.title_en || 
                              sampleLocation.title_zh || sampleLocation.title_ja || 
                              sampleLocation.title_es;
      
      if (hasLocalizedData) {
        log.success('Sample data includes localized content!');
      } else {
        log.warning('Sample data exists but lacks localized content.');
        log.info('The migration will populate sample data with localized content.');
      }
    }

    log.info('\n📋 Migration Summary:');
    log.info('===================');
    log.info('This migration adds comprehensive localization support:');
    log.info('• Adds localized fields for 5 languages (ko, en, zh, ja, es)');
    log.info('• Covers: title, subtitle, description, business_hours, price_description');
    log.info('• Updates sample data with authentic localized content');
    log.info('• Creates database indexes for better performance');
    
    log.header('\n🚀 Next Steps:');
    log.info('1. Apply the migration: npx supabase db push');
    log.info('2. Verify the changes in your Supabase dashboard');
    log.info('3. Test the localized business detail page');
    log.info('4. Add your own localized content to the database');

  } catch (error) {
    log.error('Error running migration check: ' + error.message);
  }
}

main().catch(console.error);
