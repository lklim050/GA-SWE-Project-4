import { Injectable } from '@angular/core';
import { Observable, Subject, take } from 'rxjs';

export interface ModalConfig {
  title: String;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private openSubject = new Subject<ModalConfig>();
  open$ = this.openSubject.asObservable();

  private resultSubject = new Subject<boolean>();

  confirm(config: ModalConfig): Observable<boolean> {
    this.openSubject.next(config);

    // Create a new Subject with each confirm call
    this.resultSubject = new Subject<boolean>();

    // take is rxjs which ensure completion after one result
    return this.resultSubject.asObservable().pipe(take(1));
  }
  resolve(result: boolean) {
    this.resultSubject.next(result);
  }
}
