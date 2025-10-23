const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

const createApp = async (answers) => {
  const { appName, description, appId, port, features } = answers;

  // Check if directory already exists
  if (await fs.pathExists(appName)) {
    throw new Error(`Directory "${appName}" already exists`);
  }

  const spinner = ora('Creating mini app...').start();

  try {
    // Create app directory
    await fs.ensureDir(appName);

    // Copy template files
    await copyTemplateFiles(appName, answers);

    // Generate package.json
    await generatePackageJson(appName, answers);

    // Generate app files
    await generateAppFiles(appName, answers);

    // Generate README
    await generateReadme(appName, answers);

    spinner.succeed('Mini app created successfully!');

  } catch (error) {
    spinner.fail('Failed to create mini app');
    throw error;
  }
};

const copyTemplateFiles = async (appName, answers) => {
  const templateDir = path.join(__dirname, '../templates/mini-app-template');
  const targetDir = path.join(process.cwd(), appName);

  // Copy all template files
  await fs.copy(templateDir, targetDir);
};

const generatePackageJson = async (appName, answers) => {
  const packageJson = {
    name: appName,
    version: "1.0.0",
    private: true,
    scripts: {
      dev: `next dev -p ${answers.port}`,
      build: "next build",
      start: `next start -p ${answers.port}`,
      lint: "next lint"
    },
    dependencies: {
      "@movement-labs/miniapp-sdk": "github:vpallegar/movement-miniapp-sdk",
      "@tailwindcss/postcss": "^4.1.14",
      "@types/node": "^24.6.2",
      "@types/react": "^19.2.0",
      "autoprefixer": "^10.4.21",
      "next": "^15.5.4",
      "postcss": "^8.5.6",
      "react": "^19.2.0",
      "react-dom": "^19.2.0",
      "tailwindcss": "^4.1.14",
      "typescript": "^5.9.3"
    }
  };

  const packagePath = path.join(process.cwd(), appName, 'package.json');
  await fs.writeJson(packagePath, packageJson, { spaces: 2 });
};

const generateAppFiles = async (appName, answers) => {
  const { appName: name, description, appId, features } = answers;

  // Generate layout.tsx
  const layoutContent = `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '${name} - Movement Mini App',
  description: '${description}',
  manifest: "/manifest.json",
  themeColor: "#06B6D4",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "${name}",
  },
  icons: {
    icon: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="${name}" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="${name}" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#06B6D4" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/favicon-32x32.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/favicon-16x16.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
      </head>
      <body className="antialiased bg-[#0A0F1E] text-white">{children}</body>
    </html>
  );
}`;

  const layoutPath = path.join(process.cwd(), appName, 'app', 'layout.tsx');
  await fs.writeFile(layoutPath, layoutContent);

  // Generate page.tsx based on selected features
  const pageContent = generatePageContent(answers);
  const pagePath = path.join(process.cwd(), appName, 'app', 'page.tsx');
  await fs.writeFile(pagePath, pageContent);

  // Generate manifest.json
  const manifestContent = {
    name: `${name} - Movement Mini App`,
    short_name: name,
    description: description,
    start_url: `/redirect-to-app.html?appId=${appId}`,
    display: "standalone",
    background_color: "#0A0F1E",
    theme_color: "#06B6D4",
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any maskable"
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any maskable"
      },
      {
        src: "/apple-touch-icon.svg",
        sizes: "180x180",
        type: "image/svg+xml"
      }
    ],
    categories: ["finance", "utilities"],
    lang: "en",
    dir: "ltr"
  };

  const manifestPath = path.join(process.cwd(), appName, 'public', 'manifest.json');
  await fs.writeJson(manifestPath, manifestContent, { spaces: 2 });
};

const generatePageContent = (answers) => {
  const { appName, features } = answers;

  // This would be a simplified version of the scaffold page
  // focusing on the selected features
  return `'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window { movementSDK?: any }
}

export default function ${appName.charAt(0).toUpperCase() + appName.slice(1)}() {
  const [sdk, setSDK] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');

  // Initialize SDK
  useEffect(() => {
    const bootstrap = async () => {
      const instance = (typeof window !== 'undefined' ? (window as any).movementSDK : undefined);
      
      if (instance) {
        setSDK(instance);
        setIsInstalled(instance.isInstalled?.() || false);
        
        if (instance.isInstalled?.()) {
          try {
            await instance.ready();
            setIsReady(true);
            
            const userInfo = await instance.getUserInfo();
            setIsConnected(!!userInfo?.address);
            setAddress(userInfo?.address || '');
          } catch (error) {
            console.error('SDK ready error:', error);
          }
        }
      }
    };

    bootstrap();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">${appName}</h1>
        
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">SDK Status</h2>
            <div className="space-y-2">
              <p>Installed: {isInstalled ? '✅' : '❌'}</p>
              <p>Ready: {isReady ? '✅' : '❌'}</p>
              <p>Connected: {isConnected ? '✅' : '❌'}</p>
              {address && <p>Address: {address}</p>}
            </div>
          </div>

          ${features.includes('transactions') ? `
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Transaction Features</h2>
            <p className="text-gray-300">Transaction handling features are included in this mini app.</p>
          </div>
          ` : ''}

          ${features.includes('ui-components') ? `
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">UI Components</h2>
            <p className="text-gray-300">Native UI components (buttons, alerts) are available.</p>
          </div>
          ` : ''}

          ${features.includes('qr-scanning') ? `
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">QR Code Scanning</h2>
            <p className="text-gray-300">QR code scanning functionality is included.</p>
          </div>
          ` : ''}

          ${features.includes('notifications') ? `
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <p className="text-gray-300">Push notification support is included.</p>
          </div>
          ` : ''}

          ${features.includes('haptics') ? `
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Haptic Feedback</h2>
            <p className="text-gray-300">Haptic feedback is available on mobile devices.</p>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  );
}`;
};

const generateReadme = async (appName, answers) => {
  const { description, appId, port, features } = answers;

  const readmeContent = `# ${appName}

${description}

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

The app will start on port ${port}. Open the Movement Everything app and navigate to this mini app using the \`moveeverything://apps/${appId}\` scheme.

## Features

${features.map(feature => `- ${feature}`).join('\n')}

## Development

This mini app is built with:
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Movement Mini App SDK

## Testing

To test this mini app:
1. Run \`npm run dev\`
2. Open the Movement Everything app on your mobile device
3. Navigate to this mini app using the app ID: \`${appId}\`
`;

  const readmePath = path.join(process.cwd(), appName, 'README.md');
  await fs.writeFile(readmePath, readmeContent);
};

module.exports = { createApp };
