import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { SurveyDetailComponent } from './features/survey-detail/survey-detail.component';
import { hostGuard } from './core/guards/host.guard';
import { CreateSurveyComponent } from './features/host/create-survey/create-survey.component';
import { DashboardComponent } from './features/host/dashboard/dashboard.component';
import { ManageQuestionsComponent } from './features/host/manage-questions/manage-questions.component';
import { ResultsComponent } from './features/host/results/results.component';
import { ProfileComponent } from './features/profile/profile.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  {
    path: 'survey/:id',
    component: SurveyDetailComponent,
    canActivate: [authGuard],
  },
  {
    path: 'host',
    component: DashboardComponent,
    canActivate: [authGuard, hostGuard],
  },
  {
    path: 'host/create',
    component: CreateSurveyComponent,
    canActivate: [authGuard, hostGuard],
  },
  {
    path: 'host/manage/:surveyId',
    component: ManageQuestionsComponent,
    canActivate: [authGuard, hostGuard],
  },
  {
    path: 'host/results/:surveyId',
    component: ResultsComponent,
    canActivate: [authGuard, hostGuard],
  },
  {
    path: 'user/profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
