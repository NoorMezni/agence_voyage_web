import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-reservation-create-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar, Footer],
  templateUrl: './reservation-create.html',
  styleUrl: './reservation-create.css'
})
export class ReservationCreatePage {
  form = {
    offre_id: '',
    nb_personnes: 1
  };

  submitting = false;
  validationError = '';
  apiError = '';

  constructor(
    private readonly reservationService: ReservationService,
    private readonly router: Router
  ) {}

  submit(): void {
    this.validationError = '';
    this.apiError = '';

    const offreId = Number.parseInt(this.form.offre_id, 10);
    const nbPersonnes = Number(this.form.nb_personnes);

    if (!Number.isInteger(offreId) || offreId <= 0) {
      this.validationError = 'offre_id doit etre un entier positif.';
      return;
    }

    if (!Number.isInteger(nbPersonnes) || nbPersonnes <= 0) {
      this.validationError = 'nb_personnes doit etre un entier positif.';
      return;
    }

    this.submitting = true;

    this.reservationService
      .createReservation({
        offre_id: offreId,
        nb_personnes: nbPersonnes
      })
      .subscribe({
        next: (reservation) => {
          this.submitting = false;
          this.router.navigate(['/reservations', reservation.id]);
        },
        error: (error) => {
          this.submitting = false;
          this.apiError = error?.error?.message || 'Creation de reservation impossible.';
        }
      });
  }
}
