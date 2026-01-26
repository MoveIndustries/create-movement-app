# create-movement-app

Create Movement mini apps with a single command.

## Quick Start

```bash
npx create-movement-app my-app
```

## What It Does

The CLI will ask you:

1. **App name** - Your mini app name
2. **Use Movement Design System?** - Yes/No

Based on your choice, it downloads the appropriate starter template from [mini-app-examples](https://github.com/moveindustries/mini-app-examples):

- **With Design System** → `mini-app-starter-ds`
- **Without Design System** → `mini-app-starter-basic`

## Running Your Mini App

```bash
cd my-app
npm install
npm run dev
```

Then open the Movement Everything app to test your mini app.

## Templates

Templates are hosted at [github.com/moveindustries/mini-app-examples](https://github.com/moveindustries/mini-app-examples):

- `mini-app-starter-ds` - Includes Movement Design System
- `mini-app-starter-basic` - Basic starter without design system

## Requirements

- Node.js 16+
- npm or yarn

## License

MIT
