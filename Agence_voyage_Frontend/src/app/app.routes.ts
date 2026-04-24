import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Dashboard } from './pages/dashboard/dashboard';
import { Contact } from './pages/contact/contact';
import { ReservationsPage } from './pages/reservations/reservations';
import { ReservationDetailPage } from './pages/reservation-detail/reservation-detail';
import { ReservationCreatePage } from './pages/reservation-create/reservation-create';


export const routes: Routes = [
  { path: '', component: Home },
  { path: 'dashboard', component: Dashboard },
  { path: 'contact', component: Contact },
  { path: 'reservations', component: ReservationsPage },
  { path: 'reservations/new', component: ReservationCreatePage },
  { path: 'reservations/:id', component: ReservationDetailPage }




];
