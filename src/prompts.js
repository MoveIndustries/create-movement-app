const inquirer = require('inquirer');
const chalk = require('chalk');

const getPrompts = async (appName, options = {}) => {
  // Skip prompts in test mode
  if (options.isTest) {
    return {
      appName: appName || 'test-app',
      useDesignSystem: true
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
      type: 'confirm',
      name: 'useDesignSystem',
      message: 'Use Movement Design System?',
      default: true
    }
  ];

  const answers = await inquirer.prompt(questions);
  return answers;
};

module.exports = { getPrompts };
