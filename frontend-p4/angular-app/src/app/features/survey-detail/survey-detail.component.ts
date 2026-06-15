import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Question, SurveyDetail } from '../../services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-survey-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './survey-detail.component.html',
  styleUrl: './survey-detail.component.css',
})
export class SurveyDetailComponent implements OnInit {
  survey: SurveyDetail | null = null;
  surveyForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  pointsEarned = 0;
  newBalance = 0;
  submitted = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.surveyForm = this.formBuilder.group({
      answers: this.formBuilder.array([]),
    });
  }

  get answers(): FormArray {
    return this.surveyForm.get('answers') as FormArray;
  }

  ngOnInit() {
    const surveyId = Number(this.route.snapshot.paramMap.get('id'));

    this.apiService.getSurveyDetail(surveyId).subscribe({
      next: (res: any) => {
        this.survey = res.show;
        this.buildForm(res.show.questions);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to load survey.';
        this.isLoading = false;
      },
    });
  }

  buildForm(questions: Question[]) {
    questions.forEach((question) => {
      if (question.type === 'CHECKBOX') {
        const checkboxArray = this.formBuilder.array(
          (question.options || []).map(() => this.formBuilder.control(false)),
        );
        this.answers.push(checkboxArray);
      } else {
        this.answers.push(this.formBuilder.control('', Validators.required));
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
    this.errorMessage = '';

    const answersPayload = this.survey.questions.map((question, index) => {
      let answer: string | string[];

      if (question.type === 'CHECKBOX') {
        answer = this.getCheckboxValues(index, question.options || []);
      } else {
        answer = this.answers.at(index).value;
      }
      return { question_id: question.id, answer };
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
          this.errorMessage =
            err.error?.msg || 'Submission failed. Please try again.';
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
    this.router.navigate(['/']);
  }
}
