import { Routes } from '@angular/router';
import { ReservationFormComponent } from './components/reservation-form/reservation-form.component';

export const routes: Routes = [
  { path: '', component: ReservationFormComponent },
  { path: 'review', loadComponent: () => import('./components/reservation-review/reservation-review.component').then(m => m.ReservationReviewComponent) },
  { path: 'confirmation', loadComponent: () => import('./components/reservation-confirmation/reservation-confirmation.component').then(m => m.ReservationConfirmationComponent) }
];
