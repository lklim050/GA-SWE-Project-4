import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

export interface SurveyResponse {
  response_id: number;
  user_id: string;
  survey_id: string;
  answers_payload: AnswerItem[];
  status: string;
}

export interface MessageResponse {
  status: string;
  msg: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSurveys(): Observable<SurveyDetail[]> {
    return this.http.get<SurveyDetail[]>(`${this.baseUrl}/surveys/public`);
  }
  getSurveyDetail(surveyId: number): Observable<SurveyDetail> {
    return this.http.post<SurveyDetail>(
      `${this.baseUrl}/surveys/${surveyId}`,
      {},
    );
  }
  submitSurvey(payload: SubmitPayload): Observable<SurveyResponse> {
    return this.http.put<SurveyResponse>(
      `${this.baseUrl}/responses/submit`,
      payload,
    );
  }
  getHostSurveys(): Observable<SurveyDetail[]> {
    return this.http.get<SurveyDetail[]>(`${this.baseUrl}/surveys`);
  }

  createSurvey(title: string, pointsReward: number): Observable<SurveyDetail> {
    return this.http.put<SurveyDetail>(`${this.baseUrl}/surveys`, {
      title,
      points_reward: pointsReward,
      is_published: false,
    });
  }
  updateSurvey(
    surveyId: number,
    data: Partial<{
      title: string;
      points_reward: number;
      is_published: boolean;
    }>,
  ): Observable<SurveyDetail> {
    return this.http.patch<SurveyDetail>(
      `${this.baseUrl}/surveys/${surveyId}`,
      data,
    );
  }
  deleteSurvey(surveyId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(
      `${this.baseUrl}/surveys/${surveyId}`,
    );
  }

  getSurveyResults(surveyId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/surveys/${surveyId}/results`);
  }

  getQuestions(surveyId: number): Observable<Question> {
    return this.http.get<Question>(
      `${this.baseUrl}/questions/survey/${surveyId}`,
    );
  }

  createQuestion(
    surveyId: number,
    questionText: string,
    type: string,
    options?: string[],
  ): Observable<Question> {
    return this.http.put<Question>(`${this.baseUrl}/questions`, {
      survey_id: surveyId,
      question_text: questionText,
      type,
      options: options || null,
    });
  }
  deleteQuestion(questionId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(
      `${this.baseUrl}/questions/${questionId}`,
    );
  }

  updateQuestion(
    questionId: number,
    data: {
      question_text?: string;
      type?: string;
      options?: string[];
    },
  ): Observable<Question> {
    return this.http.patch<Question>(
      `${this.baseUrl}/questions/${questionId}`,
      data,
    );
  }
}
