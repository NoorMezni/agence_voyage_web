import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.html',
  styleUrls: ['./testimonials.css']
})
export class Testimonials {
  testimonials = [
    {
      name: 'Sonia Mejri',
      initials: 'SM',
      rating: 5,
      destination: 'Voyage à Djerba',
      comment: 'Une expérience magique ! Tout était parfaitement organisé, de l\'hôtel aux excursions. Je recommande vivement TunisiaWanders.'
    },
    {
      name: 'Karim Belhaj',
      initials: 'KB',
      rating: 4,
      destination: 'Circuit Sahara – Tozeur',
      comment: 'Le circuit Sahara était époustouflant. Les guides locaux connaissent leur région et rendent l\'expérience vraiment unique.'
    },
    {
      name: 'Nadia Trabelsi',
      initials: 'NT',
      rating: 5,
      destination: 'Week-end à Sidi Bou Said',
      comment: 'Sidi Bou Said est un vrai coup de cœur. Le service de TunisiaWanders était impeccable du début à la fin.'
    }
  ];
}