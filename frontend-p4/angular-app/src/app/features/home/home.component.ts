import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

interface Survey {
  id: number;
  title: string;
  points_reward: number;
  creator: {
    name: string;
    // ↑ New field from /surveys/public response
    //   replaces created_by uuid which isn't useful for display
  };
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  surveys: Survey[] = [];

  isLoading = true;

  errorMessage = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.apiService.getSurveys().subscribe({
      next: (res: any) => {
        this.surveys = res.surveys;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load, please try again';
        this.isLoading = false;
        console.error('API error: ', err);
      },
    });
  }
  onTakeSurvey(surveyId: number) {
    this.router.navigate(['/survey', surveyId]);
  }
}
