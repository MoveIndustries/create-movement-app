import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import degit from 'degit';

const REPO_BASE = 'moveindustries/mini-app-examples';

const TEMPLATES = {
  designSystem: 'mini-app-starter-ds',
  basic: 'mini-app-starter-basic'
};

const createApp = async (answers) => {
  const { appName, useDesignSystem } = answers;

  // Check if directory already exists
  if (await fs.pathExists(appName)) {
    throw new Error(`Directory "${appName}" already exists`);
  }

  const template = useDesignSystem ? TEMPLATES.designSystem : TEMPLATES.basic;
  const repoPath = `${REPO_BASE}/${template}`;

  const spinner = ora(`Downloading template from ${repoPath}...`).start();

  try {
    // Download template from GitHub
    const emitter = degit(repoPath, {
      cache: false,
      force: true,
      verbose: false
    });

    emitter.on('info', info => {
      // Optional: log download progress
    });

    await emitter.clone(appName);

    spinner.text = 'Customizing app...';

    // Update package.json with the app name
    await updatePackageJson(appName);

    spinner.succeed('Movement mini app created successfully!');

  } catch (error) {
    spinner.fail('Failed to create mini app');

    // Clean up partial directory if it exists
    if (await fs.pathExists(appName)) {
      await fs.remove(appName);
    }

    throw error;
  }
};

const updatePackageJson = async (appName) => {
  const packagePath = path.join(process.cwd(), appName, 'package.json');

  if (await fs.pathExists(packagePath)) {
    const packageJson = await fs.readJson(packagePath);
    packageJson.name = appName;
    await fs.writeJson(packagePath, packageJson, { spaces: 2 });
  }
};

export { createApp };
