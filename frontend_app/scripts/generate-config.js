/**
 * Runtime Configuration Injection (RCI) Script
 * Generates config.js dynamically at deployment time
 * This allows API base URL to change without rebuilding the frontend
 */
const fs = require('fs');
const path = require('path');

// Get API base URL from environment or use default
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || API_BASE_URL;

// Generate config.js content
const configContent = `
// Runtime Configuration - Generated at deployment time
// This file is loaded before the main application script
window.VERIDIA_CONFIG = {
  API_BASE_URL: '${NEXT_PUBLIC_API_URL}',
  VERSION: '1.0.0',
  ENVIRONMENT: '${process.env.NODE_ENV || 'development'}'
};

console.log('VeridiaApp Runtime Config Loaded:', window.VERIDIA_CONFIG);
`.trim();

// Write to public directory
const publicDir = path.join(__dirname, '..', 'public');
const configPath = path.join(publicDir, 'config.js');

try {
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Write config.js
  fs.writeFileSync(configPath, configContent, 'utf8');
  console.log('✅ Runtime config generated:', configPath);
  console.log('   API_BASE_URL:', NEXT_PUBLIC_API_URL);
} catch (error) {
  console.error('❌ Failed to generate runtime config:', error);
  process.exit(1);
}
