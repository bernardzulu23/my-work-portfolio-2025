# Repository Overview

- **Name**: angular-portfolio-2025
- **Framework**: Angular 20 (Standalone APIs)
- **Package manager**: npm
- **Dev server**: ng serve (default port 4200)
- **Build**: ng build (output: dist/angular-portfolio-2025/browser)
- **Styling**: Tailwind CSS + PostCSS (autoprefixer)
- **Language**: TypeScript 5.9

## Key Files
- **angular.json**: Angular workspace config
- **package.json**: Scripts and deps
- **src/main.ts**: Bootstrap entry
- **src/app/**: Application code (standalone components, routes)
- **tailwind.config.js**: Tailwind setup
- **postcss.config.js**: PostCSS plugins

## NPM Scripts
- **start**: ng serve
- **build**: ng build
- **watch**: ng build --watch --configuration development
- **test**: ng test

## Dependencies (selected)
- **@angular/**: ^20.3.x
- **rxjs**: ~7.8
- **jspdf**: ^3.0.3

## Dev Dependencies (selected)
- **@angular/cli**: ^20.3.2
- **@angular/build**: ^20.3.2
- **tailwindcss**: ^3.4.17
- **postcss**: ^8.5.6
- **autoprefixer**: ^10.4.21

## Build Output
- **dist/angular-portfolio-2025/browser**: Production build artifacts

## Notes
- Uses Angular Standalone components and `app.routes.ts` for routing.
- Tailwind is enabled globally via `src/styles.css` and PostCSS config.
- For port changes: `npm start -- --port 4300`.