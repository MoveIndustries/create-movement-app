# create-move-mini-app

A CLI tool to quickly scaffold Movement mini apps with the Movement SDK integration.

## Quick Start

```bash
npx github:yourusername/create-move-mini-app my-awesome-app
```

## What It Creates

This CLI creates a complete Next.js mini app with:

- ✅ **Movement SDK Integration** - Ready-to-use SDK methods
- ✅ **PWA Support** - Installable as home screen icon
- ✅ **TypeScript** - Full type safety
- ✅ **Tailwind CSS** - Modern styling
- ✅ **Interactive Prompts** - Choose features you need
- ✅ **Template System** - Based on the official scaffold

## Features

### Core Features (Always Included)
- Basic SDK integration and connection handling
- Transaction signing and submission
- Native UI components (buttons, alerts, confirmations)

### Optional Features
- QR code scanning
- Push notifications
- Haptic feedback
- Advanced UI components

## Usage

### Create a New Mini App

```bash
# Using npx (recommended)
npx github:yourusername/create-move-mini-app my-app

# Or clone and use locally
git clone https://github.com/yourusername/create-move-mini-app.git
cd create-move-mini-app
npm install
npm link
create-move-mini-app my-app
```

### Interactive Setup

The CLI will ask you:

1. **App name** - Your mini app name
2. **Description** - What your app does
3. **App ID** - Used in `moveeverything://apps/{appId}` scheme
4. **Port** - Development server port (default: 3030)
5. **Features** - Choose which SDK features to include

### Generated Structure

```
my-app/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
│   ├── manifest.json
│   ├── icon-192.svg
│   ├── icon-512.svg
│   └── ...
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Development

### Local Testing

```bash
# Test the CLI locally
npm run test

# Or test with a real app
node bin/create-move-mini-app.js my-test-app
```

### Running Your Mini App

```bash
cd my-app
npm install
npm run dev
```

The app will start on your specified port. Open the Movement Everything app and navigate to your mini app using the `moveeverything://apps/{appId}` scheme.

## SDK Methods Available

The generated app includes examples of:

- **Connection**: `isInstalled()`, `ready()`, `connect()`
- **Account**: `getUserInfo()`, `getAccount()`, `getBalance()`
- **Transactions**: `sendTransaction()`, `waitForTransaction()`
- **UI**: `showAlert()`, `showConfirm()`, `showPopup()`
- **Device**: `scanQRCode()`, `haptic()`, `sendNotification()`
- **Storage**: `CloudStorage`, `Clipboard`

## Customization

### Adding New Features

1. Edit the template files in `templates/mini-app-template/`
2. Update the prompts in `src/prompts.js`
3. Modify the generation logic in `src/createApp.js`

### Template Files

- `templates/mini-app-template/` - Base template files
- `src/createApp.js` - File generation logic
- `src/prompts.js` - Interactive prompts

## Requirements

- Node.js 16+
- npm or yarn
- Movement Everything app (for testing)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run test`
5. Submit a pull request

## License

MIT

## Support

- [Movement Documentation](https://docs.movementlabs.xyz)
- [GitHub Issues](https://github.com/yourusername/create-move-mini-app/issues)
