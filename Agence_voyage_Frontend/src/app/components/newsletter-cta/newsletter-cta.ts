import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-newsletter-cta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './newsletter-cta.html',
  styleUrl: './newsletter-cta.css'
})
export class NewsletterCta {
  email = '';
  subscribed = false;

  subscribe() {
    if (this.email) {
      this.subscribed = true;
      this.email = '';
    }
  }
}