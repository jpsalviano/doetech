import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-password-reset-confirmation',
  imports: [CommonModule, RouterModule],
  templateUrl: './password-reset-confirmation.component.html',
  styleUrl: './password-reset-confirmation.component.css'
})
export class PasswordResetConfirmationComponent implements OnInit {
  email = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }
}
