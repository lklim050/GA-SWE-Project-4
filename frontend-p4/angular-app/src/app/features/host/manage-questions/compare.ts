import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, Question } from '../../../services/api.service';
// ↑ Adjust path based on your actual api.service.ts location

@Component({
  selector: 'app-manage-questions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './manage-questions.component.html',
  styleUrl: './manage-questions.component.css',
})
export class ManageQuestionsComponent implements OnInit {
  surveyId!: number;
  // ↑ ! tells TypeScript "this will definitely be set
  //   before use" — set in ngOnInit from route params

  questions: Question[] = [];
  isLoading = true;
  isAdding = false;
  // ↑ Controls showing the add question form
  errorMessage = '';
  successMessage = '';

  questionTypes = ['TEXT', 'RADIO', 'CHECKBOX', 'SELECT'];
  // ↑ Dropdown options for question type selector

  addForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private fb: FormBuilder,
  ) {
    this.addForm = this.fb.group({
      question_text: ['', [Validators.required, Validators.minLength(5)]],
      type: ['RADIO', Validators.required],
      // ↑ Default to RADIO as it's most common question type
      options: this.fb.array([]),
      // ↑ FormArray for dynamic options (RADIO, CHECKBOX, SELECT)
      //   stays empty for TEXT questions
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

  ngOnInit() {
    this.surveyId = Number(this.route.snapshot.paramMap.get('surveyId'));
    this.loadQuestions();

    // Watch for type changes to manage options array
    this.type?.valueChanges.subscribe((type) => {
      this.onTypeChange(type);
      // ↑ When host changes question type, reset options
      //   e.g. switching from RADIO to TEXT clears options
    });
  }

  loadQuestions() {
    this.isLoading = true;
    this.apiService.getQuestions(this.surveyId).subscribe({
      next: (res: any) => {
        this.questions = res.questions;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to load questions.';
        this.isLoading = false;
      },
    });
  }

  onTypeChange(type: string) {
    // Clear existing options
    while (this.options.length) {
      this.options.removeAt(0);
    }
    // ↑ Clear FormArray by removing from the end

    // Pre-populate 2 empty options for choice-based types
    if (type !== 'TEXT') {
      this.addOption();
      this.addOption();
      // ↑ Start with 2 blank options — host adds more as needed
    }
  }

  addOption() {
    this.options.push(
      this.fb.control('', Validators.required),
      // ↑ Each option is a simple required string control
    );
  }

  removeOption(index: number) {
    if (this.options.length <= 2) {
      this.errorMessage = 'Must have at least 2 options.';
      return;
    }
    // ↑ Enforce minimum 2 options for choice questions
    this.options.removeAt(index);
  }

  toggleAddForm() {
    this.isAdding = !this.isAdding;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isAdding) {
      // Reset form and pre-populate options for default type RADIO
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
      type === 'TEXT' ? null : this.options.controls.map((c) => c.value);
    // ↑ TEXT questions have no options — send null
    //   All other types send the options array

    this.apiService
      .createQuestion(this.surveyId, question_text, type, optionsValue)
      .subscribe({
        next: (res: any) => {
          this.questions.push(res.question);
          // ↑ Add new question to local array immediately
          //   without re-fetching all questions
          this.successMessage = 'Question added successfully!';
          this.isAdding = false;
          this.addForm.reset({ type: 'RADIO', question_text: '' });
          setTimeout(() => (this.successMessage = ''), 3000);
          // ↑ Clear success message after 3 seconds
        },
        error: (err) => {
          this.errorMessage = err.error?.msg || 'Failed to add question.';
        },
      });
  }

  deleteQuestion(question: Question) {
    if (!confirm(`Delete this question? This cannot be undone.`)) return;

    this.apiService.deleteQuestion(question.id).subscribe({
      next: () => {
        this.questions = this.questions.filter((q) => q.id !== question.id);
        // ↑ Remove from local array without re-fetching
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Failed to delete question.';
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
    // ↑ Friendly display labels for question types
  }

  goBack() {
    this.router.navigate(['/host']);
  }
}
