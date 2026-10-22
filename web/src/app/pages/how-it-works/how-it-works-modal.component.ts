import { NgIf } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-how-it-works-modal',
  imports: [NgIf],
  templateUrl: './how-it-works-modal.component.html',
  styleUrls: ['./how-it-works-modal.component.css']
})
export class HowItWorksModalComponent {
  @Input() isOpen = false;
  @Input() page = 0;
  @Input() content: Array<{ image: string; title: string; body: string }> = [];
  @Output() close = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();

  onClose() {
    this.close.emit();
  }

  prevPage() {
    if (this.page > 0) {
      this.pageChange.emit(this.page - 1);
    }
  }

  nextPage() {
    if (this.page < this.content.length - 1) {
      this.pageChange.emit(this.page + 1);
    }
  }
}
