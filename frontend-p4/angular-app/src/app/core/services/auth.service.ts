import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  uuid: string;
  email: string;
  role: 'USER' | 'HOST' | 'ADMIN';
  access: string;
  refresh: string;
  points_bal?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/users`;

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(
    this.loadFromStorage(),
  );

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  // ── Getters ───────────────────────────────────────────

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  get isHost(): boolean {
    return this.currentUser?.role === 'HOST';
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  get accessToken(): string | null {
    return this.currentUser?.access ?? null;
  }

  // ── Auth Methods ──────────────────────────────────────

  login(email: string, password: string): Observable<AuthUser> {
    return this.http
      .post<AuthUser>(`${this.baseUrl}/login`, { email, password })
      .pipe(tap((user) => this.setUser(user)));
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
  }

  logout() {
    this.http.post(`${this.baseUrl}/logout`, {}).subscribe();
    this.clearUser();
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<{ access: string }> {
    const refresh = this.currentUser?.refresh;
    return this.http
      .post<{ access: string }>(`${this.baseUrl}/refresh`, { refresh })
      .pipe(
        tap((res) => {
          if (this.currentUser) {
            this.setUser({ ...this.currentUser, access: res.access });
          }
        }),
      );
  }

  // ── Private Helpers ───────────────────────────────────
  // setUser was changed from private to public
  public setUser(user: AuthUser) {
    localStorage.setItem('some_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clearUser() {
    localStorage.removeItem('some_user');
    this.currentUserSubject.next(null);
  }

  private loadFromStorage(): AuthUser | null {
    const stored = localStorage.getItem('some_user');
    return stored ? JSON.parse(stored) : null;
  }
}
