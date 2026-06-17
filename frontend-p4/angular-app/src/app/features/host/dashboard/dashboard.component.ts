import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../core/services/auth.service';

interface HostSurvey {
  id: number;
  title: string;
  points_reward: number;
  is_published: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  surveys: HostSurvey[] = [];
  isLoading = true;
  errorMessage = '';
  // togglingId: number | null = null;
  isPublishing = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadSurveys();
  }

  loadSurveys() {
    this.apiService.getHostSurveys().subscribe({
      next: (res: any) => {
        this.surveys = res.surveys;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to load surveys';
        this.isLoading = false;
      },
    });
  }

  togglePublish(survey: HostSurvey) {
    if (survey.is_published) return;
    if (!confirm(`Publish "${survey.title}"? Action cannot be undone.`)) return;
    // this.togglingId = survey.id;
    this.isPublishing = true;
    this.apiService
      .updateSurvey(survey.id, {
        is_published: true, // cannot be undone
      })
      .subscribe({
        next: (res: any) => {
          survey.is_published = true;
          // this.togglingId = null;
          this.isPublishing = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.msg || 'Failed to update survey';
          this.isPublishing = false;
        },
      });
  }

  manageQuestions(surveyId: number) {
    this.router.navigate(['/host/manage', surveyId]);
  }

  deleteSurvey(survey: HostSurvey) {
    if (survey.is_published) return;
    if (!confirm(`Delete "${survey.title}"? Action cannot be undone.`)) return;

    this.apiService.deleteSurvey(survey.id).subscribe({
      next: () => {
        this.surveys = this.surveys.filter((s) => s.id !== survey.id);
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to delete survey';
      },
    });
  }

  viewResults(surveyId: number) {
    this.router.navigate(['/host/results', surveyId]);
  }
}
