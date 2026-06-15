import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { SurveyDetailComponent } from './features/survey-detail/survey-detail.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  {
    path: 'survey/:id',
    component: SurveyDetailComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
