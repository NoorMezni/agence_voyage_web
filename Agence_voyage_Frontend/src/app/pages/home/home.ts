import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OffreCard} from '../../components/offre-card/offre-card';
import { WhyChooseUs } from '../../components/why-choose-us/why-choose-us';
import { Testimonials } from '../../components/testimonials/testimonials';
import { NewsletterCta } from '../../components/newsletter-cta/newsletter-cta';
import {Footer} from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    OffreCard,
    WhyChooseUs,
    Testimonials,
    NewsletterCta,
    Footer,
    Navbar
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
