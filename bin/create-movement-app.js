#!/usr/bin/env node

const { createApp } = require('../src/index.js');
const chalk = require('chalk');

// Get app name from command line arguments
const appName = process.argv[2];
const isTest = process.argv.includes('--test');

if (!appName && !isTest) {
  console.log(chalk.red('Please provide an app name'));
  console.log(chalk.yellow('Usage: npx create-movement-app my-app'));
  process.exit(1);
}

// Show welcome message
console.log(chalk.cyan('Creating Movement Mini App...'));
console.log(chalk.gray('This will create a new mini app with Movement SDK integration\n'));

// Create the app
createApp(appName || 'test-app', { isTest })
  .then(() => {
    if (!isTest) {
      console.log(chalk.green('\nMovement mini app created successfully!'));
      console.log(chalk.yellow(`\nNext steps:`));
      console.log(chalk.white(`  cd ${appName}`));
      console.log(chalk.white(`  npm install`));
      console.log(chalk.white(`  npm run dev`));
      console.log(chalk.gray(`\nThen open the Movement Everything app to test your mini app!`));
    }
  })
  .catch((error) => {
    console.error(chalk.red('Error creating mini app:'), error.message);
    process.exit(1);
  });
