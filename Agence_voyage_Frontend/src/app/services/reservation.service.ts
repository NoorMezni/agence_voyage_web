import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReservationItem {
  id: number;
  user_id: number;
  offre_id: number;
  nb_personnes: number;
  prix_total: number;
  statut: 'en_attente' | 'confirmee' | 'annulee';
  date_reservation: string;
  offre_titre?: string;
  offre_prix?: number;
  date_depart?: string;
  date_retour?: string;
  places_disponibles?: number;
  paiement_statut?: 'en_attente' | 'reussi' | 'echoue' | 'rembourse' | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateReservationPayload {
  offre_id: number;
  nb_personnes: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly baseUrl = `${environment.apiBaseUrl}/reservations`;

  constructor(private readonly http: HttpClient) {}

  createReservation(payload: CreateReservationPayload): Observable<ReservationItem> {
    return this.http.post<ReservationItem>(this.baseUrl, payload);
  }

  getMyReservations(params?: { page?: number; limit?: number }): Observable<PaginatedResponse<ReservationItem>> {
    let httpParams = new HttpParams();

    if (params?.page) {
      httpParams = httpParams.set('page', String(params.page));
    }

    if (params?.limit) {
      httpParams = httpParams.set('limit', String(params.limit));
    }

    return this.http.get<PaginatedResponse<ReservationItem>>(`${this.baseUrl}/me`, {
      params: httpParams
    });
  }

  getReservationById(id: number): Observable<ReservationItem> {
    return this.http.get<ReservationItem>(`${this.baseUrl}/${id}`);
  }

  cancelReservation(id: number): Observable<ReservationItem> {
    return this.http.patch<ReservationItem>(`${this.baseUrl}/${id}/cancel`, {});
  }

  getAdminReservations(params?: {
    page?: number;
    limit?: number;
    status?: 'en_attente' | 'confirmee' | 'annulee';
  }): Observable<PaginatedResponse<ReservationItem>> {
    let httpParams = new HttpParams();

    if (params?.page) {
      httpParams = httpParams.set('page', String(params.page));
    }

    if (params?.limit) {
      httpParams = httpParams.set('limit', String(params.limit));
    }

    if (params?.status) {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<PaginatedResponse<ReservationItem>>(`${this.baseUrl}/admin/all`, {
      params: httpParams
    });
  }
}
