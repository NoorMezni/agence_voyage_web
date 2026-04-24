import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { PaymentItem, PaymentService } from '../../services/payment.service';
import { ReservationItem, ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-reservation-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer],
  templateUrl: './reservation-detail.html',
  styleUrl: './reservation-detail.css'
})
export class ReservationDetailPage implements OnInit {
  reservation: ReservationItem | null = null;
  payments: PaymentItem[] = [];
  loading = false;
  errorMessage = '';

  private reservationId = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly reservationService: ReservationService,
    private readonly paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    const id = Number.parseInt(this.route.snapshot.paramMap.get('id') || '', 10);

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage = 'Identifiant de reservation invalide.';
      return;
    }

    this.reservationId = id;
    this.loadReservation();
    this.loadPayments();
  }

  loadReservation(): void {
    this.loading = true;
    this.errorMessage = '';

    this.reservationService.getReservationById(this.reservationId).subscribe({
      next: (reservation) => {
        this.reservation = reservation;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Impossible de charger la reservation.';
      }
    });
  }

  loadPayments(): void {
    this.paymentService.getReservationPayments(this.reservationId).subscribe({
      next: (payments) => {
        this.payments = payments;
      },
      error: () => {
        this.payments = [];
      }
    });
  }

  cancelReservation(): void {
    if (!this.reservation || this.reservation.statut === 'annulee') {
      return;
    }

    const confirmed = window.confirm('Confirmer l annulation de cette reservation ?');
    if (!confirmed) {
      return;
    }

    this.reservationService.cancelReservation(this.reservation.id).subscribe({
      next: () => {
        this.loadReservation();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Annulation impossible.';
      }
    });
  }

  reservationStatusLabel(status: ReservationItem['statut']): string {
    if (status === 'confirmee') {
      return 'Confirmee';
    }

    if (status === 'annulee') {
      return 'Annulee';
    }

    return 'En attente';
  }

  paymentStatusLabel(status: PaymentItem['statut']): string {
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
