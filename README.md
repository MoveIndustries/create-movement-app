# create-movement-app

Create Movement mini apps with a single command.

## Quick Start

```bash
npx create-movement-app my-app
```

## What It Does

The CLI will guide you through:

1. **App name** - Validates your app name (lowercase letters, numbers, and hyphens only)
2. **Use Movement Design System?** - Choose between design system or basic template
3. **Template Download** - Downloads from [mini-app-examples](https://github.com/moveindustries/mini-app-examples):
   - With Design System → `mini-app-starter-ds`
   - Without Design System → `mini-app-starter-basic`
4. **Install dependencies?** - Automatically detects your package manager (pnpm/yarn/npm)
5. **Open in editor?** - Detects available editors (Cursor, VS Code, Zed, Sublime)
6. **Start dev server?** - Optionally starts the development server immediately

After setup, you'll see helpful links for testing and getting started with your mini app.

## Manual Setup

If you chose not to install dependencies or start the dev server during setup:

```bash
cd my-app
pnpm install  # or npm/yarn
pnpm dev      # or npm run dev / yarn dev
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
