const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

const { createApp } = require('./createApp');
const { getPrompts } = require('./prompts');

module.exports = {
  createApp: async (appName, options = {}) => {
    try {
      // Get user input
      const answers = await getPrompts(appName, options);

      // Create the app
      await createApp(answers);

      return true;
    } catch (error) {
      throw error;
    }
  }
};
