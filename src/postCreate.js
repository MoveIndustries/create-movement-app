import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { spawn, exec } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Detect which package manager to use
 * Priority: pnpm > yarn > npm
 */
const detectPackageManager = () => {
  // Check for lock files in current directory
  if (existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (existsSync('yarn.lock')) return 'yarn';
  if (existsSync('package-lock.json')) return 'npm';

  // Default to pnpm as recommended
  return 'pnpm';
};

/**
 * Detect available code editors
 * Returns array of available editors
 */
const detectEditors = async () => {
  const editors = [
    { name: 'Cursor', command: 'cursor' },
    { name: 'VS Code', command: 'code' },
    { name: 'VS Code Insiders', command: 'code-insiders' },
    { name: 'Zed', command: 'zed' },
    { name: 'Sublime Text', command: 'subl' }
  ];

  const available = [];

  for (const editor of editors) {
    try {
      await execAsync(`which ${editor.command}`);
      available.push(editor);
    } catch {
      // Editor not available
    }
  }

  return available;
};

/**
 * Run a command in a specific directory
 */
const runCommand = (command, args, cwd) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
      } else {
        resolve();
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
};

/**
 * Run post-creation steps: install dependencies and optionally start dev server
 */
export const runPostCreationSteps = async (appName) => {
  const appPath = path.join(process.cwd(), appName);
  const packageManager = detectPackageManager();

  console.log(); // Empty line for spacing

  // Ask if user wants to install dependencies
  const { shouldInstall } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldInstall',
      message: 'Install dependencies now?',
      default: true
    }
  ]);

  if (!shouldInstall) {
    console.log(chalk.yellow('\nNext steps:'));
    console.log(chalk.white(`  cd ${appName}`));
    console.log(chalk.white(`  ${packageManager} install`));
    console.log(chalk.white(`  ${packageManager} dev`));
    return;
  }

  // Install dependencies
  const spinner = ora(`Installing dependencies with ${packageManager}...`).start();

  try {
    spinner.stop(); // Stop spinner to allow command output
    console.log(chalk.cyan(`Running ${packageManager} install...\n`));

    await runCommand(packageManager, ['install'], appPath);

    console.log(chalk.green('\nDependencies installed successfully!\n'));

    // Detect available editors
    const availableEditors = await detectEditors();
    let selectedEditor = null;

    // Ask which editor to open (before asking about dev server)
    if (availableEditors.length > 0) {
      const editorChoices = [
        ...availableEditors.map(e => ({ name: e.name, value: e })),
        { name: "Don't open in editor", value: null }
      ];

      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedEditor',
          message: 'Open project in editor?',
          choices: editorChoices,
          default: editorChoices[0].value
        }
      ]);

      selectedEditor = answer.selectedEditor;
    }

    // Ask if user wants to start dev server
    const { shouldStartDev } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldStartDev',
        message: 'Start development server now?',
        default: true
      }
    ]);

    // Open in editor BEFORE starting dev server (since dev server blocks)
    if (selectedEditor) {
      try {
        await execAsync(`${selectedEditor.command} "${appPath}"`);
        console.log(chalk.green(`Opened project in ${selectedEditor.name}\n`));
      } catch (error) {
        console.log(chalk.yellow(`Could not open editor: ${error.message}\n`));
      }
    }

    // Start dev server (this will block until user stops it)
    if (shouldStartDev) {
      console.log(chalk.cyan(`Starting development server...`));
      console.log(chalk.gray(`Press Ctrl+C to stop the server\n`));

      await runCommand(packageManager, ['dev'], appPath);
    } else {
      console.log(chalk.yellow('To start the development server later:'));
      console.log(chalk.white(`  cd ${appName}`));
      console.log(chalk.white(`  ${packageManager} dev`));
    }
  } catch (error) {
    spinner.fail('Failed to install dependencies');
    console.log(chalk.red(`Error: ${error.message}`));
    console.log(chalk.yellow('\nYou can install manually:'));
    console.log(chalk.white(`  cd ${appName}`));
    console.log(chalk.white(`  ${packageManager} install`));
  }
};
