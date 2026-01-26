import { createApp as createAppFromTemplate } from './createApp.js';
import { getPrompts } from './prompts.js';

export const createApp = async (appName, options = {}) => {
  try {
    // Get user input
    const answers = await getPrompts(appName, options);

    // Create the app
    await createAppFromTemplate(answers);

    return true;
  } catch (error) {
    throw error;
  }
};
