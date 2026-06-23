import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ApiService,
  Question,
  SurveyDetail,
} from '../../../services/api.service';

@Component({
  selector: 'app-manage-questions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './manage-questions.component.html',
  styleUrl: './manage-questions.component.css',
})
export class ManageQuestionsComponent implements OnInit {
  survey: SurveyDetail | null = null;
  surveyId!: number;
  // ! means surveyId will be set in ngOnInit from route params
  questions: Question[] = [];
  isSurveyLoading = true;
  isQuestionLoading = true;
  isAdding = false;
  errorMessage = '';
  successMessage = '';
  questionTypes = ['TEXT', 'RADIO', 'CHECKBOX', 'SELECT'];
  addForm: FormGroup;
  // ── New Edit Properties ──────────────────────────
  editingQuestionId: number | null = null;
  // ↑ Tracks which question is currently being edited
  //   null means no question is in edit mode
  editForm: FormGroup;
  // ↑ Separate form for editing — keeps add and edit
  //   forms independent of each other
  isUpdating = false;
  // ↑ Loading state for the update API call

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.addForm = this.formBuilder.group({
      question_text: ['', [Validators.required, Validators.minLength(5)]],
      type: ['RADIO', Validators.required],
      options: this.formBuilder.array([]),
    });
    // Edit form has same structure as add form
    this.editForm = this.formBuilder.group({
      question_text: ['', [Validators.required, Validators.minLength(5)]],
      type: ['RADIO', Validators.required],
      options: this.formBuilder.array([]),
    });
  }

  get question_text() {
    return this.addForm.get('question_text');
  }
  get type() {
    return this.addForm.get('type');
  }
  get options(): FormArray {
    return this.addForm.get('options') as FormArray;
  }
  // ── New Edit Getters ─────────────────────────────
  get editQuestionText() {
    return this.editForm.get('question_text');
  }
  get editType() {
    return this.editForm.get('type');
  }
  get editOptions(): FormArray {
    return this.editForm.get('options') as FormArray;
    // ↑ Separate getter for edit form's options array
  }

  ngOnInit() {
    this.surveyId = Number(this.route.snapshot.paramMap.get('surveyId'));
    this.loadSurveyQuestion();

    this.type?.valueChanges.subscribe((type) => {
      this.onTypeChange(type);
      //render whenever type selection changes
    });
    // Watch edit form type changes too
    this.editType?.valueChanges.subscribe((type) => {
      this.onEditTypeChange(type);
      // ↑ Same pattern as add form but for edit form
    });
  }

  loadSurveyQuestion() {
    this.isSurveyLoading = true;
    this.apiService.getSurveyDetail(this.surveyId).subscribe({
      next: (res: any) => {
        this.survey = res.survey;
        this.isSurveyLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to load survey.';
        this.isSurveyLoading = false;
      },
    });

    this.isQuestionLoading = true;
    this.apiService.getQuestions(this.surveyId).subscribe({
      next: (res: any) => {
        this.questions = res.questions;
        this.isQuestionLoading = false;
      },
      error: (err) => {
        this.errorMessage =
          err.error?.msg || 'Failed to load questions, please try again later';
        this.isQuestionLoading = false;
      },
    });
  }

  onTypeChange(type: string) {
    // remove the last added entry
    while (this.options.length) {
      this.options.removeAt(0);
    }
    if (type !== 'TEXT') {
      this.addOption();
      this.addOption();
    }
  }

  addOption() {
    this.options.push(this.formBuilder.control('', Validators.required));
  }
  removeOption(index: number) {
    if (this.options.length <= 2) {
      this.errorMessage = 'Minimum 2 options required';
      return;
    }
    this.options.removeAt(index);
  }
  toggleAddForm() {
    this.isAdding = !this.isAdding;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isAdding) {
      this.addForm.reset({ type: 'RADIO', question_text: '' });
      while (this.options.length) this.options.removeAt(0);
      this.addOption();
      this.addOption();
    }
  }

  onSubmit() {
    if (this.addForm.invalid) return;

    const { question_text, type } = this.addForm.value;
    const optionsValue =
      type === 'TEXT'
        ? undefined
        : this.options.controls.map((option) => option.value);

    this.apiService
      .createQuestion(this.surveyId, question_text, type, optionsValue)
      .subscribe({
        next: (res: any) => {
          this.questions.push(res.question);
          this.successMessage = 'Question added successfully';
          this.isAdding = false;
          this.addForm.reset({ type: 'RADIO', question_text: '' });
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (err) => {
          this.errorMessage =
            err.error?.msg || 'Failed to add question, please try again later';
        },
      });
  }

  deleteQuestion(question: Question) {
    if (!confirm(`Delete this question? This cannot be undone.`)) return;

    this.apiService.deleteQuestion(question.id).subscribe({
      next: () => {
        this.questions = this.questions.filter(
          (find) => find.id !== question.id,
        );
      },
      error: (err) => {
        this.errorMessage =
          err.error?.msg || 'Failed to delete question, please try again later';
      },
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      TEXT: '📝 Text',
      RADIO: '🔘 Radio',
      CHECKBOX: '☑️ Checkbox',
      SELECT: '📋 Select',
    };
    return labels[type] || type;
  }
  goBack() {
    this.router.navigate(['/host']);
  }
  // ── New Edit Methods ─────────────────────────────

  onEditTypeChange(type: string) {
    while (this.editOptions.length) this.editOptions.removeAt(0);
    if (type !== 'TEXT') {
      this.addEditOption();
      this.addEditOption();
    }
  }

  addEditOption() {
    this.editOptions.push(this.formBuilder.control('', Validators.required));
  }

  removeEditOption(index: number) {
    if (this.editOptions.length <= 2) {
      this.errorMessage = 'Must have at least 2 options.';
      return;
    }
    this.editOptions.removeAt(index);
  }

  startEdit(question: Question) {
    this.editingQuestionId = question.id;
    this.isAdding = false;
    // ↑ Close add form if open
    this.errorMessage = '';

    // Pre-populate edit form with existing question data
    this.editForm.patchValue({
      question_text: question.question_text,
      type: question.type,
      // ↑ patchValue updates specific fields without
      //   resetting the entire form — unlike setValue
      //   which requires ALL fields to be provided
    });

    // Rebuild options array from existing options
    while (this.editOptions.length) this.editOptions.removeAt(0);
    if (question.options && question.options.length > 0) {
      question.options.forEach((opt) => {
        this.editOptions.push(
          this.formBuilder.control(opt, Validators.required),
        );
        // ↑ Pre-fill each option with existing value
      });
    }
  }

  cancelEdit() {
    this.editingQuestionId = null;
    this.editForm.reset();
    this.errorMessage = '';
    // ↑ Clear edit state without saving
  }

  onUpdate(question: Question) {
    if (this.editForm.invalid) return;

    this.isUpdating = true;
    this.errorMessage = '';

    const { question_text, type } = this.editForm.value;
    const optionsValue =
      type === 'TEXT'
        ? undefined
        : this.editOptions.controls.map((c) => c.value);

    this.apiService
      .updateQuestion(question.id, {
        question_text,
        type,
        options: optionsValue,
      })
      .subscribe({
        next: (res: any) => {
          // Update the question in local array
          const index = this.questions.findIndex((q) => q.id === question.id);
          if (index !== -1) {
            this.questions[index] = res.question;
            // ↑ Replace old question with updated one from API
            //   Keeps local state in sync with database
          }
          this.editingQuestionId = null;
          this.isUpdating = false;
          this.successMessage = 'Question updated successfully!';
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.msg || 'Failed to update question.';
          this.isUpdating = false;
        },
      });
  }
}
