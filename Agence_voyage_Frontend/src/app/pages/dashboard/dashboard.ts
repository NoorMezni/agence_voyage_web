import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { environment } from '../../../environments/environment';

interface MonthStat {
  month: string;
  count: number;
  current?: boolean;
}

interface RoleItem {
  name: string;
  count: number;
  pct: number;
  color: string;
}

interface DonutSlice {
  color: string;
  dash: string;
  offset: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, DecimalPipe, DatePipe, HttpClientModule, Navbar,Footer],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  today = new Date();

  stats = {
    totalUsers:   0,
    newUsers:     0,
    deletedUsers: 0,
  };

  monthlyRegistrations: MonthStat[] = [];
  roles:       RoleItem[]  = [];
  donutSlices: DonutSlice[] = [];

  get maxMonthlyCount(): number {
    return Math.max(...this.monthlyRegistrations.map(m => m.count), 1);
  }

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef   // ← ajoute ça
  ) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiBaseUrl}/dashboard/stats`).subscribe({
      next: (data) => {
        console.log('data reçu :', data);

        this.stats = {
          totalUsers:   data.total,
          newUsers:     data.newReg.total,
          deletedUsers: data.deleted.total,
        };

        const lastItem = data.byMonth[data.byMonth.length - 1];
        this.monthlyRegistrations = data.byMonth.map((m: any) => ({
          month:   m.mois,
          count:   Number(m.total),
          current: m.mois_num === lastItem.mois_num && m.annee === lastItem.annee
        }));

        this.roles = data.byRole.map((r: any) => ({
          name:  r.role === 'client'       ? 'Clients'
               : r.role === 'admin'        ? 'Admins'
               : r.role === 'gestionnaire' ? 'Gestionnaires'
               : r.role,
          count: Number(r.total),
          pct:   Number(r.percentage),
          color: r.role === 'client'       ? '#0097A7'
               : r.role === 'admin'        ? '#F4A623'
               : r.role === 'gestionnaire' ? '#1A3C5E'
               : '#B5D4F4'
        }));

        this.buildDonut();
        this.cdr.detectChanges();  // ← force Angular à mettre à jour l'affichage
      },
      error: (err) => {
        console.error('Erreur API :', err);
      }
    });
  }

  private buildDonut(): void {
    const circumference = 2 * Math.PI * 45;
    const total = this.roles.reduce((s, r) => s + r.count, 0);
    let offset = 0;

    this.donutSlices = this.roles.map(role => {
      const pct  = role.count / total;
      const dash = pct * circumference;
      const gap  = circumference - dash;
      const slice: DonutSlice = {
        color:  role.color,
        dash:   `${dash.toFixed(2)} ${gap.toFixed(2)}`,
        offset: (-offset).toFixed(2),
      };
      offset += dash;
      return slice;
    });
  }
}
