import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Destination {
  name: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  badge?: string;
  badgeType?: 'bestseller' | 'promo';
  promoPercent?: number;
}

@Component({
  selector: 'app-offre-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offre-card.html',
  styleUrls: ['./offre-card.scss']
})
export class OffreCard {
  destinations: Destination[] = [
    {
      name: 'Djerba',
      image: 'https://images.unsplash.com/photo-1580502304784-8985b7eb7260?w=600',
      rating: 3.5,
      reviews: 128,
      price: 1290,
      badge: 'BEST SELLER',
      badgeType: 'bestseller'
    },
    {
      name: 'Sidi Bou Said',
      image: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600',
      rating: 4,
      reviews: 89,
      price: 899,
      badge: 'PROMO -20%',
      badgeType: 'promo',
      promoPercent: 20
    },
    {
      name: 'Tozeur',
      image: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=600',
      rating: 3.5,
      reviews: 64,
      price: 1450
    },
    {
      name: 'Hammamet',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
      rating: 4,
      reviews: 102,
      price: 980,
      badge: 'BEST SELLER',
      badgeType: 'bestseller'
    },
    {
      name: 'Tunis Médina',
      image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=600',
      rating: 4.5,
      reviews: 76,
      price: 650,
      badge: 'PROMO -15%',
      badgeType: 'promo',
      promoPercent: 15
    },
    {
      name: 'Paris',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
      rating: 5,
      reviews: 210,
      price: 3200
    }
  ];

  getStars(rating: number): string[] {
    return [1, 2, 3, 4, 5].map(i => {
      if (i <= Math.floor(rating)) return 'full';
      if (i - rating < 1 && i - rating > 0) return 'half';
      return 'empty';
    });
  }
}