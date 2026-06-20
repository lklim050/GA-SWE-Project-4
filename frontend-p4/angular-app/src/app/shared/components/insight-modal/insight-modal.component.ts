import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-insight-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insight-modal.component.html',
  styleUrl: './insight-modal.component.css',
})
export class InsightModalComponent {
  // @Input() means from parent
  @Input() isVisible = false;
  @Input() summary = '';
  @Input() submissionCount = 0;
  @Input() generatedAt = '';
  @Input() isLoading = false;
  @Input() insightMsg = '';
  @Input() aiModel = '';
  // @Output() means from child
  // void means no data passed back
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  formatSummary(text: string): string {
    return text
      .replace(/### /g, '')
      .replace(/## /g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\\n/g, '\n');
  }
  getParagraphs(text: string): string[] {
    return this.formatSummary(text)
      .split('\n')
      .filter((line) => line.trim().length > 0);
    // ↑ Split by newline, remove empty lines
  }
}
