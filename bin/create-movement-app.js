#!/usr/bin/env node

import { createApp } from '../src/index.js';
import chalk from 'chalk';

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
      console.log(chalk.white(`  pnpm install`));
      console.log(chalk.white(`  pnpm dev`));
      console.log(chalk.gray(`\nTo test your mini app, you'll need the Movement super app installed. Get it here for iOS and here for Android.`));
      console.log(chalk.gray(`See tunneling options for testing your app locally: https://mini-app-docs.vercel.app/quick-start/testing.html`));
      console.log(chalk.gray(`To get started coding (or vibe coding) your app, see the Quick Start guide: https://mini-app-docs.vercel.app/quick-start/`));
    }
  })
  .catch((error) => {
    console.error(chalk.red('Error creating mini app:'), error.message);
    process.exit(1);
  });
