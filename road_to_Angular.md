## Angular (Road to Angular App Setup Guide)

### Table of Contents

- [Prequisites (Ask Copilot to do the scaffolding for you)](#prequisites-ask-copilot-to-do-the-scaffolding-for-you)
- [Install Angular CLI globally](#install-angular-cli-globally)
- [Test API service](#test-api-service)
  - [1. Generate API service, Component](#1-generate-api-service-component)
  - [2. Setup route for home in app.routes.ts](#2-setup-route-for-home-in-approutests)
  - [3. Wire Up API service](#3-wire-up-api-service)
  - [4. Add a interface](#4-add-a-interface) - [Build Auth Service](#build-auth-service)
  - [1. Generate core and features](#1-generate-core-and-features)
  - [2. Implement auth service, interceptor, guard](#2-implement-auth-service-interceptor-guard)
  - [3. Implement component Typescript and Design UI for auth(login and register components)]
- [Build Navbar](#build-navbar)
  - [1. Generate Navbar component](#1-generate-navbar-component)
  - [2. Implement Navbar Component Typescript](#2-implement-navbar-component-typescript)
  - [3. Design Navbar Component HTML, CSS](#3-design-navbar-component-html-css)
  - [4. Add Navbar to AppComponent](#4-add-navbar-to-appcomponent)

### Prequisites (Ask Copilot to do the scaffolding for you)

### Install Angular CLI globally

```bash
npm install -g @angular/cli
ng version
```

### Test API service

#### 1. Generate API service, Component

```bash
ng generate service services/api
```

```bash
ng generate component features/home
```

#### 2. Setup route for home in app.routes.ts

```typescript
import { Routes } from "@angular/router";
import { HomeComponent } from "./features/home/home.component";

export const routes: Routes = [{ path: "", component: HomeComponent }];
```

#### 3. Wire Up API service

- at api.service.ts, add the following code to test the API service:

`````typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getSurveys(): Observable<any> {
    return this.http.get(`${this.baseUrl}/surveys`);
  }
}

- at home.component.ts, add the following code to test the API service:
````typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  surveys: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getSurveys().subscribe({
      next: (data: any) => this.surveys = data,
      error: (err) => console.error('API error:', err)
    });
  }
}

`````

- at the home.component.html, add the following code to display the API data:

```html
<h1>Surveys</h1>
<pre>{{ surveys | json }}</pre>
```

- note: when hit with CORS errors,you may need to setup cors at backend with the following:

```bash
npm install cors
```

```javascript
const cors = require("cors");
app.use(cors({ origin: "http://localhost:4200" }));
```

#### 4. Add a interface

- at the home.component.ts, adjust the following code to define the interface:

```typescript
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "../../services/api.service";

// ↑ Define the shape of your survey data
//   This replaces 'any' with a proper TypeScript interface
//   Now TypeScript will warn you if you mistype a property name
interface Survey {
  id: number;
  title: string;
  points_reward: number;
  is_published: boolean;
  created_by: string;
}

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent implements OnInit {
  surveys: Survey[] = [];
  // ↑ Now typed as Survey[] instead of any[]
  //   TypeScript now knows exactly what properties exist
  isLoading = true;
  // ↑ Controls showing a loading state while data fetches
  errorMessage = "";
  // ↑ Holds any error message to display to user

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getSurveys().subscribe({
      next: (data: Survey[]) => {
        this.surveys = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = "Failed to load surveys. Please try again.";
        this.isLoading = false;
        console.error("API error:", err);
      },
    });
  }
}
```

- at the home.component.html, adjust the following code to display loading and error states:

```html
<div class="container">
  <!-- Loading state -->
  <div *ngIf="isLoading" class="loading">Loading surveys...</div>

  <!-- Error state -->
  <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>

  <!-- Survey list -->
  <div *ngIf="!isLoading && !errorMessage">
    <h1>Community Surveys</h1>
    <p class="subtitle">Complete surveys and earn points!</p>

    <div class="survey-grid">
      <div class="survey-card" *ngFor="let survey of surveys">
        <!-- ↑ *ngFor loops over your surveys array
              and creates one card per survey -->

        <div class="card-header">
          <h2>{{ survey.title }}</h2>
        </div>

        <div class="card-body">
          <span class="points-badge"> 🏆 {{ survey.points_reward }} pts </span>
        </div>

        <div class="card-footer">
          <button class="btn-primary">Take Survey</button>
        </div>
      </div>
    </div>

    <p *ngIf="surveys.length === 0" class="empty">
      No surveys available right now.
    </p>
    <!-- ↑ Handles the edge case of empty array -->
  </div>
</div>
```

### Build Auth Service

#### 1. Generate core and features

```bash
ng generate service core/services/auth
ng generate interceptor core/interceptors/auth
ng generate guard core/guards/auth
ng generate component features/auth/login
ng generate component features/auth/register
```

#### 2. Implement auth service, interceptor, guard

- at auth.service.ts, add the following code to implement the auth service:

```typescript
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, tap } from "rxjs";

// ↑ BehaviorSubject: a special Observable that holds a
//   current value and emits it to new subscribers immediately.
//   Perfect for storing "is the user logged in?" state
//   that any component can subscribe to.

export interface AuthUser {
  uuid: string;
  email: string;
  role: "USER" | "HOST" | "ADMIN";
  access: string;
  refresh: string;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private baseUrl = "http://localhost:3000/users";

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(
    this.loadFromStorage(),
  );
  // ↑ Initialise from localStorage so login persists
  //   across page refreshes. Starts as null if not logged in.

  currentUser$ = this.currentUserSubject.asObservable();
  // ↑ Public Observable that components subscribe to.
  //   The $ suffix is a convention meaning "this is an Observable"

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  // ── Getters ───────────────────────────────────────────

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
    // ↑ Synchronous access to current user — useful when
    //   you just need a quick check without subscribing
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
    // ↑ !! converts to boolean: null → false, object → true
  }

  get isHost(): boolean {
    return this.currentUser?.role === "HOST";
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === "ADMIN";
  }

  get accessToken(): string | null {
    return this.currentUser?.access ?? null;
    // ↑ Used by AuthInterceptor to attach to requests
  }

  // ── Auth Methods ──────────────────────────────────────

  login(email: string, password: string): Observable<AuthUser> {
    return this.http
      .post<AuthUser>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap((user) => this.setUser(user)),
        // ↑ tap: performs a side effect (saving user) without
        //   changing the Observable value. Like a middleware step.
      );
  }

  register(
    email: string,
    name: string,
    password: string,
    role?: string,
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/register`, {
      email,
      name,
      password,
      role,
    });
    // ↑ PUT /users/register per your API dictionary
  }

  logout() {
    this.http.post(`${this.baseUrl}/logout`, {}).subscribe();
    this.clearUser();
    this.router.navigate(["/login"]);
  }

  refreshToken(): Observable<{ access: string }> {
    const refresh = this.currentUser?.refresh;
    return this.http
      .post<{ access: string }>(`${this.baseUrl}/refresh`, { refresh })
      .pipe(
        tap((res) => {
          if (this.currentUser) {
            this.setUser({ ...this.currentUser, access: res.access });
            // ↑ Update only the access token, keep everything else
          }
        }),
      );
  }

  // ── Private Helpers ───────────────────────────────────

  private setUser(user: AuthUser) {
    localStorage.setItem("some_user", JSON.stringify(user));
    this.currentUserSubject.next(user);
    // ↑ .next() pushes a new value to all subscribers
  }

  private clearUser() {
    localStorage.removeItem("some_user");
    this.currentUserSubject.next(null);
  }

  private loadFromStorage(): AuthUser | null {
    const stored = localStorage.getItem("some_user");
    return stored ? JSON.parse(stored) : null;
    // ↑ Runs once on app startup to rehydrate login state
  }
}
```

- at auth.interceptor.ts, add the following code to implement the auth interceptor:

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  // ↑ inject() is how you get services inside a
  //   functional interceptor (Angular 17 style)

  const token = authService.accessToken;

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  // ↑ Clone the request (requests are immutable) and
  //   attach the Bearer token if one exists.
  //   If no token, pass request through unchanged.

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(["/login"]);
        // ↑ Auto-logout if backend returns 401 Unauthorized
      }
      return throwError(() => error);
    }),
  );
};
```

- update app.config.ts, you need to add in the interceptor (withInterceptors and authInterceptor) as follows:

```typescript
import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { routes } from "./app.routes";
import { authInterceptor } from "./core/interceptors/auth.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // ↑ Registers your interceptor globally — every HTTP
    //   request now automatically goes through authInterceptor
  ],
};
```

- at auth.guard.ts, you can implement the guard as follows:

```typescript
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn) {
    return true;
    // ↑ User is logged in — allow navigation to the route
  }

  router.navigate(["/login"]);
  return false;
  // ↑ Not logged in — redirect to login page
};
```

- update app.routes.ts, you can add the newly created component, guard to protected routes as follows:

```typescript
import { Routes } from "@angular/router";
import { HomeComponent } from "./features/home/home.component";
import { LoginComponent } from "./features/auth/login/login.component";
import { RegisterComponent } from "./features/auth/register/register.component";
import { authGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "", component: HomeComponent, canActivate: [authGuard] },
  // ↑ canActivate: [authGuard] means only logged-in
  //   users can access this route
  { path: "**", redirectTo: "" },
  // ↑ Wildcard — any unknown route redirects to home
];
```

#### 3. Implement component Typescript and Design UI for auth(login and register components)

- at login.component.ts, you can add the following code to design the login page:

`````typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// ↑ ReactiveFormsModule: Angular's way of handling forms in code
//   rather than in the template. More powerful than template-driven
//   forms — easier to validate, test, and control programmatically.
//   FormBuilder: helper that creates form controls cleanly
//   Validators: built-in validation rules (required, email, minLength etc.)

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      // ↑ ['', [...]] means: default value '', with these validators
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Handy getter so template can access controls cleanly
  // e.g. this.email instead of this.loginForm.get('email')
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit() {
    if (this.loginForm.invalid) return;
    // ↑ Double safety check — don't submit if validation fails

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (user) => {
        // Redirect based on role after login
        if (user.role === 'HOST' || user.role === 'ADMIN') {
          this.router.navigate(['/host']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Login failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
```

- at login.component.html, you can add the following code to design the login page:
_to be added..._

- at login.component.css, you can add the following code to design the login page:
_to be added..._

- at register.component.ts, you can add the following code to design the register page:

````typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['USER']
      // ↑ Default role is USER — HOST can be selected in the form
    });
  }

  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get role() { return this.registerForm.get('role'); }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { name, email, password, role } = this.registerForm.value;

    this.authService.register(email, name, password, role).subscribe({
      next: () => {
        this.successMessage = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
        // ↑ Brief success message before redirect
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
`````

- at register.component.html, you can add the following code to design the register page:
  _to be added..._

- at register.component.css, you can add the following code to design the login page:
  _to be added..._

- after components created, you need to route to navigate between login and register pages as follows:

```typescript
import { Routes } from "@angular/router";
import { HomeComponent } from "./features/home/home.component";
import { LoginComponent } from "./features/auth/login/login.component";
import { RegisterComponent } from "./features/auth/register/register.component";
import { authGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "", component: HomeComponent, canActivate: [authGuard] },
  { path: "**", redirectTo: "" },
];
```

### Build Navbar

#### 1. Generate Navbar component

- At bash ,generate Navbar component as follows:

```bash
ng generate component shared/components/navbar
```

#### 2. Implement Navbar Component Typescript

- at navbar.component.ts, add the following code:

```Typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService, AuthUser } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  currentUser: AuthUser | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      // ↑ Subscribe to user state changes — navbar updates
      //   automatically when user logs in or out
    });
  }

  logout() {
    this.authService.logout();
  }
}
```

#### 3. Design Navbar Component HTML, CSS

- at navbar.component.html, you can add the following code to design the navbar:
  _to be added..._

- at navbar.component.css, you can add the following code to design the navbar:
  _to be added..._

#### 4. Add Navbar to AppComponent

- at app.component.html, you can add the following code to add the navbar to the app:

```html
<app-navbar />
<br />
<router-outlet />
```

- at app.component.ts, import the navbar component as follows:

```Typescript
...
import { NavbarComponent } from './shared/components/navbar/navbar.component';
...
imports: [... NavbarComponent],
```

### Build Survey Response Page

#### 1. Generate Survey Response Component

```bash
ng generate component features/survey-response
```

#### 2. Setup API service method for getting and submitting survey response

- at api.service.ts, you can add the following code to implement the API service method for getting and submitting survey response:

```typescript
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface Question {
  id: number;
  survey_id: number;
  question_text: string;
  type: "TEXT" | "RADIO" | "CHECKBOX" | "SELECT";
  options: string[] | null;
}

export interface SurveyDetail {
  id: number;
  title: string;
  points_reward: number;
  is_published: boolean;
  questions: Question[];
}

export interface AnswerItem {
  question_id: number;
  answer: string | string[];
}

export interface SubmitPayload {
  survey_id: number;
  answers_payload: AnswerItem[];
}

@Injectable({ providedIn: "root" })
export class ApiService {
  private baseUrl = "http://localhost:3000/api";

  constructor(private http: HttpClient) {}

  getSurveys(): Observable<any> {
    return this.http.get(`${this.baseUrl}/surveys`);
  }

  getSurveyDetail(surveyId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/surveys/${surveyId}`, {});
    // ↑ Your API uses POST to get a single survey — unusual
    //   but that's what your API dictionary specifies
  }

  submitSurvey(payload: SubmitPayload): Observable<any> {
    return this.http.put(`${this.baseUrl}/responses/submit`, payload);
  }
}
```

#### 3. Implement Survey Response Component Typescript

- at survey-detail.component.ts, you can add the following code to implement the survey response page:

```typescript
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService, Question, SurveyDetail } from "../../services/api.service";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-survey-detail",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./survey-detail.component.html",
  styleUrl: "./survey-detail.component.css",
})
export class SurveyDetailComponent implements OnInit {
  survey: SurveyDetail | null = null;
  surveyForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  errorMessage = "";
  successMessage = "";
  pointsEarned = 0;
  newBalance = 0;
  submitted = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.surveyForm = this.fb.group({
      answers: this.fb.array([]),
    });
  }

  get answers(): FormArray {
    return this.surveyForm.get("answers") as FormArray;
  }

  ngOnInit() {
    const surveyId = Number(this.route.snapshot.paramMap.get("id"));

    this.apiService.getSurveyDetail(surveyId).subscribe({
      next: (res: any) => {
        this.survey = res.show;
        this.buildForm(res.show.questions);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || "Failed to load survey.";
        this.isLoading = false;
      },
    });
  }

  buildForm(questions: Question[]) {
    questions.forEach((q) => {
      if (q.type === "CHECKBOX") {
        const checkboxArray = this.fb.array(
          (q.options || []).map(() => this.fb.control(false)),
        );
        this.answers.push(checkboxArray);
      } else {
        this.answers.push(this.fb.control("", Validators.required));
      }
    });
  }

  getCheckboxValues(questionIndex: number, options: string[]): string[] {
    const checkboxArray = this.answers.at(questionIndex) as FormArray;
    return options.filter((_, i) => checkboxArray.at(i).value);
  }

  onSubmit() {
    if (this.surveyForm.invalid || !this.survey) return;

    this.isSubmitting = true;
    this.errorMessage = "";

    const answersPayload = this.survey.questions.map((q, index) => {
      let answer: string | string[];

      if (q.type === "CHECKBOX") {
        answer = this.getCheckboxValues(index, q.options || []);
      } else {
        answer = this.answers.at(index).value;
      }

      return { question_id: q.id, answer };
    });

    this.apiService
      .submitSurvey({
        survey_id: this.survey.id,
        answers_payload: answersPayload,
      })
      .subscribe({
        next: (res: any) => {
          this.submitted = true;
          this.pointsEarned = res.reward_points;
          this.newBalance = res.new_total_balance;
          this.refreshUserPoints(res.new_total_balance);
        },
        error: (err) => {
          this.errorMessage = err.error?.msg || "Submission failed.";
          this.isSubmitting = false;
        },
      });
  }

  refreshUserPoints(newBalance: number) {
    const current = this.authService.currentUser;
    if (current) {
      const updated = { ...current, points_bal: newBalance };
      this.authService.setUser(updated);
    }
  }

  goHome() {
    this.router.navigate(["/"]);
  }
}
```

#### 4. Design Survey Response Component HTML, CSS

- at survey-detail.component.html, you can add the following code to design the survey response page:
  _to be added..._
- at survey-detail.component.css, you can add the following code to design the survey response page:
  _to be added..._

#### 5. Add navigation method for survey response page

- at home.component.ts, you can add the following code to add navigation for survey response page:

```typescript
import { Router } from '@angular/router';

// Add Router to constructor
constructor(
  private apiService: ApiService,
  private router: Router
) {}

// Add this method
onTakeSurvey(surveyId: number) {
  this.router.navigate(['/survey', surveyId]);
  // ↑ Navigates to /survey/1 or /survey/2 etc.
}
```

- at home.component.html, you can add the following code to add navigation for survey response page:

```html
<button class="btn-primary" (click)="onTakeSurvey(survey.id)">
  Take Survey
</button>
```

#### 6. Add route for survey response page

- at app.routes.ts, you can add the following code to add route for survey response page:

```typescript
import { SurveyDetailComponent } from './features/survey-detail/survey-detail.component';
...
...
  { path: 'survey/:id', component: SurveyDetailComponent, canActivate: [authGuard] },
```

#### 7. Some adjustment for AuthService

- at auth.service.ts, you can add the following code to make setUser method public:

```typescript
public setUser(user: AuthUser) {
  localStorage.setItem('crowdtask_user', JSON.stringify(user));
  this.currentUserSubject.next(user);
}
```

### Build Host Dashboard

1. Generate Host Dashboard Component

```bash
ng generate component features/host/dashboard
ng generate component features/host/create-survey
ng generate component features/host/manage-questions
```

## Notes/Annotation

### Import

- api.service.ts

```typescript
import { Injectable } from "@angular/core";
// ↑ Injectable: marks this class as something Angular's dependency injection system can create and share.
//   Without this, you can't inject it into components.

import { HttpClient } from "@angular/common/http";
// ↑ HttpClient: Angular's built-in tool for making HTTP requests (GET, POST, PUT, DELETE).
//   Like axios or fetch, but Angular-native.

import { Observable } from "rxjs";
// ↑ Observable: a stream that emits data over time. Think of it like a Promise, but more powerful —
//   it can emit multiple values and be cancelled. HttpClient returns Observables for all requests.

@Injectable({ providedIn: "root" })
// ↑ This decorator registers the service globally. 'root' means one single shared instance exists
//   across your entire app (singleton pattern).
export class ApiService {
  private baseUrl = "http://localhost:3000/api";
  // ↑ Centralised base URL — change once, updates everywhere. 'private' means only this class can access it.

  constructor(private http: HttpClient) {}
  // ↑ Angular automatically injects HttpClient here. 'private' shorthand also declares it as a class property.

  getSurveys(): Observable<any> {
    // ↑ Return type is Observable<any> — telling TypeScript "this method returns a stream of data, type unknown for now."
    //   Later you'd replace 'any' with a proper interface.
    return this.http.get(`${this.baseUrl}/surveys`);
  }
}
```

- home.component.ts

```typescript
import { Component, OnInit } from "@angular/core";
// ↑ Component: decorator that marks this class as an Angular component (a reusable UI building block).
//   OnInit: a lifecycle interface — lets you run code exactly once when the component first loads.

import { CommonModule } from "@angular/common";
// ↑ Provides common Angular template features like: *ngIf (show/hide elements), *ngFor (loop over arrays),
//   and the 'json' pipe you used in the template.
//   Required in standalone components — older Angular had this built in via BrowserModule.

import { ApiService } from "../../services/api.service";
// ↑ Importing your own service to use in this component.

@Component({
  selector: "app-home",
  // ↑ The HTML tag name for this component.
  //   Use <app-home /> anywhere to render it.

  standalone: true,
  // ↑ Angular 17 default — means this component manages
  //   its own imports directly, no NgModule needed.

  imports: [CommonModule],
  // ↑ Standalone components declare their own dependencies.
  //   CommonModule gives access to *ngFor, *ngIf, json pipe etc.

  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent implements OnInit {
  // ↑ 'implements OnInit' is a contract — TypeScript enforces
  //   that you must define an ngOnInit() method below.

  surveys: any[] = [];
  // ↑ Class property to hold survey data.
  //   Initialised as empty array so template doesn't crash
  //   before data loads.

  constructor(private apiService: ApiService) {}
  // ↑ Angular injects your ApiService here automatically.
  //   Don't call 'new ApiService()' manually — Angular
  //   handles that. This is dependency injection.

  ngOnInit() {
    // ↑ Runs once when component loads — the right place
    //   for data fetching. Don't fetch data in constructor.
    this.apiService.getSurveys().subscribe({
      // ↑ Observables are lazy — nothing happens until
      //   you .subscribe(). This is what triggers the HTTP call.

      next: (data: any) => (this.surveys = data),
      // ↑ 'next' runs when data arrives successfully.
      //   Assigns API response to your surveys property,
      //   which automatically updates the template.

      error: (err) => console.error("API error:", err),
      // ↑ 'error' runs if the request fails.
      //   Always handle errors — silent failures are hard to debug.
    });
  }
}
```

## Angular vs React Notes

### Create Component

- React: Just write a function that returns JSX. No special syntax needed.

```jsx
function Home() {
  return <h1>Home</h1>;
}
```

- Angular: Various steps:
  - Use Angular CLI to generate a component with `ng generate component`. This gives you a .ts file (logic), .html file (template), and .css file (styles).
  - Use the @Component decorator to define metadata, and export a class. The template can be inline or in a separate HTML file.

```typescript
import { Component } from "@angular/core";
@Component({
  selector: "app-home",
  template: `<h1>Home</h1>`,
})
export class HomeComponent {}
```

### Pass Data to Child

- React: Just pass props like normal function arguments.

```jsx
function Home({ title }) {
  const [data, setData] = useState(null);
  return (
    <div>
      <someComponent title={title} data={data} />
    </div>
  );
}
```

- Angular: use @Input() for parent-to-child, @Output() + EventEmitter for child-to-parent, and services for sibling communication.

```typescript
// somecomponent.component.ts
export class SomeComponent {
  @Input() title: string = "";
  @Input() points: number = 0;
  // ↑ @Input() is Angular's equivalent of props
}
```

```typecript
// somecomponent.component.html
<app-somecomponent [title]="component.title" [points]="component.points" />
```

### Emitting Events

- React: Just call a function passed down as a prop.

```jsx
function SomeComponent({ onClick }) {
  return <button onClick={onClick}>Click me</button>;
}
```

- Angular: Use @Output() and EventEmitter to emit events from child to parent.

```typescript
import { Component, Output, EventEmitter } from "@angular/core";
@Component({
  selector: "app-somecomponent",
  template: `<button (click)="handleClick()">Click me</button>`,
})
export class SomeComponent {
  @Output() clicked = new EventEmitter<void>();
  handleClick() {
    this.clicked.emit();
  }
}
```

```html
<!-- parent.component.html -->
<app-somecomponent (clicked)="onChildClicked()" />
```

```

```
