# Angular (TypeScript) Setup — Installation Guide

This guide converts the React-based dependency list in [frontend-p4/package.json](frontend-p4/package.json) into an Angular (TypeScript) setup. Run the commands inside your Angular project directory (or create a new project first with `ng new`).

## 1) Install Angular CLI and scaffold

```bash
npm install -g @angular/cli
ng new my-angular-app --routing --style=css
cd my-angular-app
```

If you want to migrate into the existing `frontend-p4` folder, consider creating the Angular project in a new folder and copying assets.

## 2) Core package installs (if needed)

```bash
npm install @angular/core @angular/common @angular/compiler @angular/platform-browser @angular/platform-browser-dynamic @angular/router @angular/forms @angular/animations rxjs zone.js
```

## 3) Mapped equivalents from React deps

- `@tanstack/react-query` → consider using RxJS with Angular services or `@tanstack/query-core` if you want similar cache/query utilities:
  ```bash
  npm install @tanstack/query-core
  ```
- `jwt-decode` → same package works:
  ```bash
  npm install jwt-decode
  ```
- Routing → built-in Angular Router (created with `--routing`):
  ```bash
  npm install @angular/router
  ```
- `react-icons` → use Font Awesome Angular wrapper or other icon libs:
  ```bash
  npm install @fortawesome/angular-fontawesome @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons
  ```
- `react-big-calendar` → Angular alternatives: `angular-calendar` or FullCalendar Angular:
  ```bash
  npm install angular-calendar date-fns
  # or for FullCalendar
  npm install @fullcalendar/angular @fullcalendar/core @fullcalendar/daygrid
  ```
- `date-fns` → works with Angular as-is:
  ```bash
  npm install date-fns
  ```

## 4) Dev tooling (linters, tailwind)

- ESLint for Angular:
  ```bash
  ng add @angular-eslint/schematics
  # or
  npm install -D @angular-eslint/eslint-plugin @angular-eslint/eslint-plugin-template @angular-eslint/template-parser eslint
  ```
- Tailwind CSS (optional):
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init
  # then add Tailwind directives to styles.css and configure postcss
  ```

## 5) Example combined install

```bash
npm install jwt-decode date-fns @tanstack/query-core @fortawesome/angular-fontawesome @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons angular-calendar
npm install -D tailwindcss postcss autoprefixer
ng add @angular-eslint/schematics
```

## 6) Notes & migration tips

- Data fetching: use Angular `HttpClient` + RxJS; use service singletons for caching; consider NgRx for larger state.
- Error handling: extend Angular's `ErrorHandler` to implement global boundaries.
- Calendar: `angular-calendar` is a close analogue to `react-big-calendar`.
- Keep the original React `frontend-p4/package.json` handy for reference.

If you want, I can scaffold the Angular project, create a starter `src/app` structure, or commit these files. Tell me which next step you prefer.

## 7) Differences: original React `package.json` vs current Angular `package.json`

Summary of key changes made when converting the original React/Vite `package.json` into an Angular-ready `package.json`:

- **Removed (React-specific) dependencies**:
  - `react`, `react-dom`, `@tanstack/react-query` (React adapter), `react-error-boundary`, `react-router`, `react-icons`, `react-big-calendar`, plus React type packages (`@types/react`, `@types/react-dom`) and Vite-specific dev tooling (`vite`, `@vitejs/plugin-react`).

- **Added (Angular-specific) dependencies**:
  - Angular core packages: `@angular/core`, `@angular/common`, `@angular/compiler`, `@angular/platform-browser`, `@angular/platform-browser-dynamic`, `@angular/forms`, `@angular/animations`, `@angular/router`.
  - Runtime utilities: `rxjs`, `zone.js`.
  - Angular-friendly alternatives and helpers: `@tanstack/query-core` (core query utilities if you want React-Query style behavior), `@fortawesome/angular-fontawesome`, `@fortawesome/fontawesome-svg-core`, `@fortawesome/free-solid-svg-icons`, `angular-calendar`.
  - Kept reusable libs: `jwt-decode`, `date-fns`.

- **DevDependencies swapped**:
  - Removed: `vite`, `@vitejs/plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, React type packages.
  - Added: `@angular/cli`, `@angular/compiler-cli`, `@angular-devkit/build-angular`, `typescript`, `@angular-eslint/*` packages. Kept or re-added: `tailwindcss`, `postcss`, `autoprefixer`, `eslint` (configured for Angular templates).

- **Scripts changed**:
  - React/Vite scripts (`dev`, `build`, `preview`, `start` using Vite) were replaced with Angular CLI scripts: `start` (`ng serve`), `build` (`ng build`), `test` (`ng test`), `lint` (`ng lint`), and an added `format` helper. Development server and build pipeline are now driven by the Angular CLI instead of Vite.

- **Architecture implications**:
  - Routing, state, and data fetching move from React idioms (React Router, hooks, react-query) to Angular idioms (Angular Router, services + RxJS, Angular DI, optionally NgRx).
  - Tooling and config (build, linting, TypeScript setup, environment files) are now managed by Angular CLI and Angular ESLint schematics.
