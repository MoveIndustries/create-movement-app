#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing create-move-mini-app CLI...\n');

try {
  // Test 1: Check if all required files exist
  console.log('✅ Checking required files...');
  const requiredFiles = [
    'package.json',
    'bin/create-move-mini-app.js',
    'src/index.js',
    'src/createApp.js',
    'src/prompts.js',
    'templates/mini-app-template/package.json',
    'templates/mini-app-template/app/layout.tsx',
    'templates/mini-app-template/app/page.tsx'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing required file: ${file}`);
    }
  }
  console.log('✅ All required files present');

  // Test 2: Check package.json structure
  console.log('✅ Checking package.json...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!packageJson.bin || !packageJson.bin['create-move-mini-app']) {
    throw new Error('package.json missing bin field');
  }
  console.log('✅ package.json structure valid');

  // Test 3: Check template files
  console.log('✅ Checking template files...');
  const templateDir = 'templates/mini-app-template';
  if (!fs.existsSync(templateDir)) {
    throw new Error('Template directory missing');
  }
  console.log('✅ Template files present');

  // Test 4: Test CLI execution (dry run)
  console.log('✅ Testing CLI execution...');
  const testAppName = 'test-cli-app';

  // Clean up any existing test app
  if (fs.existsSync(testAppName)) {
    fs.rmSync(testAppName, { recursive: true, force: true });
  }

  // Run the CLI in test mode
  execSync(`node bin/create-move-mini-app.js ${testAppName} --test`, { stdio: 'pipe' });

  // Check if app was created
  if (!fs.existsSync(testAppName)) {
    throw new Error('CLI failed to create app directory');
  }

  // Check if key files were generated
  const generatedFiles = [
    `${testAppName}/package.json`,
    `${testAppName}/app/layout.tsx`,
    `${testAppName}/app/page.tsx`,
    `${testAppName}/README.md`
  ];

  for (const file of generatedFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Generated file missing: ${file}`);
    }
  }

  // Clean up test app
  fs.rmSync(testAppName, { recursive: true, force: true });
  console.log('✅ CLI execution successful');

  console.log('\n🎉 All tests passed! The CLI is ready to use.');
  console.log('\nNext steps:');
  console.log('1. Run: npm install');
  console.log('2. Run: npm link');
  console.log('3. Test: create-move-mini-app my-test-app');
  console.log('4. Push to GitHub and test with: npx github:yourusername/create-move-mini-app my-app');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}
