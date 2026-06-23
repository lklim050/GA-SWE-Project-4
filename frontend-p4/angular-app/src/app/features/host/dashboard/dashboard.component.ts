import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService, AuthUser } from '../../../core/services/auth.service';
import { ModalService } from '../../../core/services/modal.service';
import { FormsModule } from '@angular/forms';

interface HostSurvey {
  id: number;
  title: string;
  points_reward: number;
  is_published: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  surveys: HostSurvey[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  isPublishing = false;
  editingTitleId: number | null = null;
  editTitleValue = '';
  isSavingTitle = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    this.loadSurveys();
  }

  get currentUser() {
    return this.authService.currentUser;
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
    // if (!confirm(`Publish "${survey.title}"? Action cannot be undone.`)) return;

    this.modalService
      .confirm({
        title: 'Publishing Survey...',
        message: `Publish "${survey.title}"? Action cannot be undone.`,
        confirmLabel: 'Yes, Confirm Publish',
        cancelLabel: 'Cancel',
        danger: false,
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;
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
      });
  }

  manageQuestions(surveyId: number) {
    this.router.navigate(['/host/manage', surveyId]);
  }

  deleteSurvey(survey: HostSurvey) {
    if (survey.is_published) return;
    // if (!confirm(`Delete "${survey.title}"? Action cannot be undone.`)) return;

    this.modalService
      .confirm({
        title: 'Deleting survey...',
        message: `Delete "${survey.title}"? Action cannot be undone.`,
        confirmLabel: 'Yes, Confirm Delete',
        cancelLabel: 'Cancel',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.apiService.deleteSurvey(survey.id).subscribe({
          next: () => {
            this.surveys = this.surveys.filter((s) => s.id !== survey.id);
          },
          error: (err) => {
            this.errorMessage = err.error?.msg || 'Failed to delete survey';
          },
        });
      });
  }

  viewResults(surveyId: number) {
    this.router.navigate(['/host/results', surveyId]);
  }

  startEditTitle(survey: HostSurvey) {
    this.editingTitleId = survey.id;
    this.editTitleValue = survey.title;
  }

  cancelEditTitle() {
    this.editingTitleId = null;
    this.editTitleValue = '';
  }

  saveTitle(survey: HostSurvey) {
    const newTitle = this.editTitleValue.trim();

    if (newTitle.length < 5) {
      this.errorMessage = 'Title need to be at least 5 characters';
      setTimeout(() => (this.errorMessage = ''), 3000);
      return;
    }

    if (newTitle === survey.title) {
      this.cancelEditTitle();
      return;
    }

    this.isSavingTitle = true;
    this.apiService.updateSurvey(survey.id, { title: newTitle }).subscribe({
      next: (res: any) => {
        survey.title = newTitle;
        // ↑ Update local state
        this.editingTitleId = null;
        this.isSavingTitle = false;
        this.successMessage = 'Title updated successfully.';
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to update title.';
        this.isSavingTitle = false;
        setTimeout(() => (this.errorMessage = ''), 3000);
      },
    });
  }
}
