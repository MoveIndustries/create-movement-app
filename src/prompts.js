const inquirer = require('inquirer');
const chalk = require('chalk');

const getPrompts = async (appName, options = {}) => {
  // Skip prompts in test mode
  if (options.isTest) {
    return {
      appName: appName || 'test-app',
      description: 'A Movement mini app',
      appId: 'test-app',
      port: 3030,
      features: ['basic', 'transactions', 'ui-components']
    };
  }

  console.log(chalk.blue('Let\'s configure your Movement mini app:\n'));

  const questions = [
    {
      type: 'input',
      name: 'appName',
      message: 'App name:',
      default: appName,
      validate: (input) => {
        if (!input.trim()) {
          return 'App name is required';
        }
        if (!/^[a-z0-9-]+$/.test(input)) {
          return 'App name can only contain lowercase letters, numbers, and hyphens';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'description',
      message: 'App description:',
      default: 'A Movement mini app',
      validate: (input) => input.trim().length > 0 || 'Description is required'
    },
    {
      type: 'input',
      name: 'appId',
      message: 'App ID (used in moveeverything://apps/{appId}):',
      default: appName,
      validate: (input) => {
        if (!input.trim()) {
          return 'App ID is required';
        }
        if (!/^[a-z0-9-]+$/.test(input)) {
          return 'App ID can only contain lowercase letters, numbers, and hyphens';
        }
        return true;
      }
    },
    {
      type: 'number',
      name: 'port',
      message: 'Development port:',
      default: 3030,
      validate: (input) => {
        if (input < 1024 || input > 65535) {
          return 'Port must be between 1024 and 65535';
        }
        return true;
      }
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select features to include:',
      choices: [
        {
          name: 'Basic SDK integration',
          value: 'basic',
          checked: true
        },
        {
          name: 'Transaction handling',
          value: 'transactions',
          checked: true
        },
        {
          name: 'UI components (buttons, alerts)',
          value: 'ui-components',
          checked: true
        },
        {
          name: 'QR code scanning',
          value: 'qr-scanning',
          checked: false
        },
        {
          name: 'Notifications',
          value: 'notifications',
          checked: false
        },
        {
          name: 'Haptic feedback',
          value: 'haptics',
          checked: false
        }
      ]
    }
  ];

  const answers = await inquirer.prompt(questions);
  return answers;
};

module.exports = { getPrompts };
