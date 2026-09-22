const fs = require('fs');
const path = require('path');

// Helper to parse a .env file without external dependencies
function parseEnvFile(filePath) {
  const env = {};
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const equalsIdx = trimmed.indexOf('=');
      if (equalsIdx !== -1) {
        const key = trimmed.substring(0, equalsIdx).trim();
        const value = trimmed.substring(equalsIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
        env[key] = value;
      }
    }
  }
  return env;
}

const rootDir = path.resolve(__dirname, '..');
const envFile = path.join(rootDir, '.env');
const fileEnv = parseEnvFile(envFile);

// Read from process.env (e.g. Vercel, CI/CD) or .env file
const geminiApiKey = process.env.GEMINI_API_KEY || fileEnv.GEMINI_API_KEY || '';
const geminiModel = process.env.GEMINI_MODEL || fileEnv.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const geminiApiUrl = process.env.GEMINI_API_URL || fileEnv.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models';

const firebaseApiKey = process.env.FIREBASE_API_KEY || fileEnv.FIREBASE_API_KEY || '';
const firebaseAuthDomain = process.env.FIREBASE_AUTH_DOMAIN || fileEnv.FIREBASE_AUTH_DOMAIN || '';
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID || fileEnv.FIREBASE_PROJECT_ID || '';
const firebaseStorageBucket = process.env.FIREBASE_STORAGE_BUCKET || fileEnv.FIREBASE_STORAGE_BUCKET || '';
const firebaseMessagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID || fileEnv.FIREBASE_MESSAGING_SENDER_ID || '';
const firebaseAppId = process.env.FIREBASE_APP_ID || fileEnv.FIREBASE_APP_ID || '';
const firebaseMeasurementId = process.env.FIREBASE_MEASUREMENT_ID || fileEnv.FIREBASE_MEASUREMENT_ID || '';

const envDir = path.join(rootDir, 'src', 'environments');
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

function formatKey(key) {
  if (key && typeof key === 'string' && key.includes('.')) {
    const parts = key.split('.');
    return `[${parts.map(p => JSON.stringify(p)).join(', ')}].join('.')`;
  }
  return JSON.stringify(key);
}

// Generate environment.ts (production)
const prodEnvContent = `/**
 * Auto-generated environment configuration.
 * Generated from .env / process.env by scripts/set-env.js
 */
export const environment = {
  production: true,
  geminiApiKey: ${formatKey(geminiApiKey)},
  geminiModel: ${JSON.stringify(geminiModel)},
  geminiApiUrl: ${JSON.stringify(geminiApiUrl)},
  
  firebase: {
    apiKey: ${JSON.stringify(firebaseApiKey)},
    authDomain: ${JSON.stringify(firebaseAuthDomain)},
    projectId: ${JSON.stringify(firebaseProjectId)},
    storageBucket: ${JSON.stringify(firebaseStorageBucket)},
    messagingSenderId: ${JSON.stringify(firebaseMessagingSenderId)},
    appId: ${JSON.stringify(firebaseAppId)},
    measurementId: ${JSON.stringify(firebaseMeasurementId)}
  }
};
`;

// Generate environment.development.ts
const devEnvContent = `/**
 * Auto-generated development environment configuration.
 * Generated from .env / process.env by scripts/set-env.js
 */
export const environment = {
  production: false,
  geminiApiKey: ${formatKey(geminiApiKey)},
  geminiModel: ${JSON.stringify(geminiModel)},
  geminiApiUrl: ${JSON.stringify(geminiApiUrl)},
  
  firebase: {
    apiKey: ${JSON.stringify(firebaseApiKey)},
    authDomain: ${JSON.stringify(firebaseAuthDomain)},
    projectId: ${JSON.stringify(firebaseProjectId)},
    storageBucket: ${JSON.stringify(firebaseStorageBucket)},
    messagingSenderId: ${JSON.stringify(firebaseMessagingSenderId)},
    appId: ${JSON.stringify(firebaseAppId)},
    measurementId: ${JSON.stringify(firebaseMeasurementId)}
  }
};
`;

fs.writeFileSync(path.join(envDir, 'environment.ts'), prodEnvContent, 'utf8');
fs.writeFileSync(path.join(envDir, 'environment.development.ts'), devEnvContent, 'utf8');

console.log('Environment configuration files generated successfully from .env / process.env');

