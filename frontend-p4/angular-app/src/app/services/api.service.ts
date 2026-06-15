import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Question {
  id: number;
  survey_id: number;
  question_text: string;
  type: 'TEXT' | 'RADIO' | 'CHECKBOX' | 'SELECT';
  options: string[] | null;
}

export interface SurveyDetail {
  id: number;
  title: string;
  points_reward: number;
  is_published: boolean;
  questions: Question[];
}

export interface AnswerItem {
  question_id: number;
  answer: string | string[];
}

export interface SubmitPayload {
  survey_id: number;
  answers_payload: AnswerItem[];
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:5001';

  constructor(private http: HttpClient) {}

  getSurveys(): Observable<any> {
    return this.http.get(`${this.baseUrl}/surveys/public`);
  }
  getSurveyDetail(surveyId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/surveys/${surveyId}`, {});
  }
  submitSurvey(payload: SubmitPayload): Observable<any> {
    return this.http.put(`${this.baseUrl}/responses/submit`, payload);
  }
}
