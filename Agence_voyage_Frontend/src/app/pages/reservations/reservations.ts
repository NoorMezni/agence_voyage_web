import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { ReservationItem, ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-reservations-page',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css'
})
export class ReservationsPage implements OnInit {
  reservations: ReservationItem[] = [];
  loading = false;
  errorMessage = '';

  page = 1;
  limit = 10;
  totalPages = 1;
  total = 0;

  constructor(private readonly reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.errorMessage = '';

    this.reservationService
      .getMyReservations({ page: this.page, limit: this.limit })
      .subscribe({
        next: (response) => {
          this.reservations = response.data;
          this.total = response.total;
          this.page = response.page;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error?.error?.message || 'Impossible de charger vos reservations.';
        }
      });
  }

  onCancelReservation(reservationId: number): void {
    const confirmed = window.confirm('Voulez-vous vraiment annuler cette reservation ?');
    if (!confirmed) {
      return;
    }

    this.reservationService.cancelReservation(reservationId).subscribe({
      next: () => this.loadReservations(),
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Annulation impossible.';
      }
    });
  }

  previousPage(): void {
    if (this.page <= 1 || this.loading) {
      return;
    }

    this.page -= 1;
    this.loadReservations();
  }

  nextPage(): void {
    if (this.page >= this.totalPages || this.loading) {
      return;
    }

    this.page += 1;
    this.loadReservations();
  }

  canCancel(reservation: ReservationItem): boolean {
    return reservation.statut !== 'annulee';
  }

  statusLabel(status: ReservationItem['statut']): string {
    if (status === 'confirmee') {
      return 'Confirmee';
    }

    if (status === 'annulee') {
      return 'Annulee';
    }

    return 'En attente';
  }

  paymentLabel(status: ReservationItem['paiement_statut']): string {
    if (!status) {
      return 'Aucun paiement';
    }

    if (status === 'reussi') {
      return 'Reussi';
    }

    if (status === 'echoue') {
      return 'Echoue';
    }

    if (status === 'rembourse') {
      return 'Rembourse';
    }

    return 'En attente';
  }
}
