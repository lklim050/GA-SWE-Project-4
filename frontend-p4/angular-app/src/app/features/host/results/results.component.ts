import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, InsightsResponse } from '../../../services/api.service';
import { ModalService } from '../../../core/services/modal.service';
import { InsightModalComponent } from '../../../shared/components/insight-modal/insight-modal.component';

interface QuestionResult {
  question_text: string;
  type: 'TEXT' | 'RADIO' | 'CHECKBOX' | 'SELECT';
  counts: Record<string, number>; // this is how object are defined, string is key, number is value
  total_selections_counted: number;
  text_responses: string[];
}

interface SurveyResults {
  survey_title: string;
  total_submissions: number;
  results: Record<string, QuestionResult>;
}

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, InsightModalComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css',
})
export class ResultsComponent implements OnInit {
  surveyId!: number; // surveyId must be number
  data: SurveyResults | null = null; // initial is null where data variable can be either null or SurveyResults
  isLoading = true;
  errorMessage = '';

  questionEntries: { id: string; result: QuestionResult }[] = []; // convert object into array for ngFor iteration.

  // all these to pass down to Modal (Child)
  showInsightModal = false;
  insightSummary = '';
  insightSubmissionCount = 0;
  insightGeneratedAt = '';
  isInsightLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    this.surveyId = Number(this.route.snapshot.paramMap.get('surveyId'));
    this.loadResults();
  }

  loadResults() {
    this.apiService.getSurveyResults(this.surveyId).subscribe({
      next: (res: SurveyResults) => {
        this.data = res;
        // suggested by Claude to map data in this way for ngFor iteration later
        this.questionEntries = Object.entries(res.results).map(
          ([id, result]) => ({ id, result }),
        );
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage =
          err.error?.msg || 'Failed to load results, please try again later.';
        this.isLoading = false;
      },
    });
  }

  getCountEntries(
    counts: Record<string, number>,
  ): { label: string; count: number }[] {
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }

  getBarWidth(count: number, counts: Record<string, number>): number {
    const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
    return total === 0 ? 0 : Math.round((count / total) * 100);
  }

  isChoiceType(type: string): boolean {
    return ['RADIO', 'CHECKBOX', 'SELECT'].includes(type);
  }

  generateInsight() {
    console.log('generateInsight called');
    this.showInsightModal = true;
    console.log('showInsightModal:', this.showInsightModal);
    this.isInsightLoading = true;
    this.apiService.getSurveyInsights(this.surveyId).subscribe({
      next: (res: any) => {
        this.insightSummary = res.insights.summary;
        this.insightSubmissionCount = res.insights.submission_count;
        this.insightGeneratedAt = res.insights.last_created_at;
        this.isInsightLoading = false;
      },
      error: (err) => {
        this.errorMessage =
          err.error?.msg ||
          'Failed to generate insights, please try again later';
        this.isInsightLoading = false;
      },
    });
  }

  closeInsightModal() {
    this.showInsightModal = false;
  }

  goBack() {
    this.router.navigate(['/host']);
  }
}
