import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PaymentItem {
  id: number;
  reservation_id: number;
  montant: number;
  methode: 'carte' | 'paypal' | 'virement' | 'especes';
  statut: 'en_attente' | 'reussi' | 'echoue' | 'rembourse';
  transaction_id?: string;
  date_paiement: string;
}

export interface CreatePaymentPayload {
  reservation_id: number;
  montant: number;
  methode: 'carte' | 'paypal' | 'virement' | 'especes';
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly baseUrl = `${environment.apiBaseUrl}/paiements`;

  constructor(private readonly http: HttpClient) {}

  createPayment(payload: CreatePaymentPayload): Observable<PaymentItem> {
    return this.http.post<PaymentItem>(this.baseUrl, payload);
  }

  getReservationPayments(reservationId: number): Observable<PaymentItem[]> {
    return this.http.get<PaymentItem[]>(`${this.baseUrl}/reservation/${reservationId}`);
  }

  updatePaymentStatus(
    id: number,
    status: 'en_attente' | 'reussi' | 'echoue' | 'rembourse'
  ): Observable<PaymentItem> {
    return this.http.patch<PaymentItem>(`${this.baseUrl}/${id}/status`, { status });
  }
}
