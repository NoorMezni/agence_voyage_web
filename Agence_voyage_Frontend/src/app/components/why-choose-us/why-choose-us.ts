import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-why-choose-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './why-choose-us.html',
  styleUrls: ['./why-choose-us.css']
})
export class WhyChooseUs {
  features = [
    {
      title: 'Expertise locale',
      description: 'Notre équipe tunisienne connaît chaque recoin du pays pour des expériences authentiques.',
      icon: 'assets/icons/trophy.svg',
      bgColor: '#fff3e0'
    },
    {
      title: 'Voyages sécurisés',
      description: 'Tous nos circuits sont vérifiés et assurés. Partez sereinement avec une couverture complète.',
      icon: 'assets/icons/shield.svg',
      bgColor: '#e8f4fd'
    },
    {
      title: 'Meilleur prix garanti',
      description: 'Nous comparons pour vous et garantissons le tarif le plus compétitif du marché.',
      icon: 'assets/icons/price.svg',
      bgColor: '#eafaf1'
    },
    {
      title: 'Support 24h/24',
      description: 'Notre équipe est disponible à toute heure pour répondre à vos questions et urgences.',
      icon: 'assets/icons/support.svg',
      bgColor: '#fdf2f8'
    },
    {
      title: 'Voyages sur mesure',
      description: 'Chaque itinéraire est personnalisé selon vos envies, budget et dates de voyage.',
      icon: 'assets/icons/plane.svg',
      bgColor: '#fef9e7'
    },
    {
      title: '+1000 clients satisfaits',
      description: 'Des milliers de voyageurs nous font confiance chaque année. Rejoignez la famille !',
      icon: 'assets/icons/star.svg',
      bgColor: '#f0f3f8'
    }
  ];
}