# Angular App Setup Guide

This project was scaffolded with Angular CLI 17.3.17. The steps below show the normal setup flow a person would use from a fresh start.

## 1) Create the app scaffold

Install the Angular CLI if you do not already have it:

```bash
npm install -g @angular/cli
```

Create the project with routing enabled and CSS styling:

```bash
ng new angular-app --routing --style=css
```

When prompted, choose the default answers unless you specifically want Server-Side Rendering or analytics.

## 2) Move into the project folder

```bash
cd angular-app
```

## 3) Install dependencies

If the scaffold was created with `--skip-install`, run:

```bash
npm install
```

## 4) Start the development server

```bash
npm start
```

Then open `http://localhost:4200/` in your browser.

## 5) Replace the starter page

The default Angular welcome screen is only a starter template. A normal next step is to replace the default `app.component.html` content with your own layout and then add components as needed.

## 6) Generate app pieces as you build

Use the Angular CLI to create new features:

```bash
ng generate component features/home
ng generate service services/api
ng generate guard guards/auth
ng generate pipe pipes/date-format
```

## 7) Build and test

```bash
npm run build
npm test
```

## Notes

- `npm audit` warnings are common during scaffolding and often come from nested dependencies.
- If you want a cleaner install later, run `npm audit --omit=dev` to focus on production-only packages.
- The files created by Angular CLI are the standard starting point for a new Angular app.
