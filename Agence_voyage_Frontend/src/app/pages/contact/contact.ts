import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-contact',
    standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar,Footer], 
  
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  form = {
    nom: '',
    email: '',
    sujet: '',
    message: ''
  };

  submitted = false;
  errors: Record<string, string> = {};

  validate(): boolean {
    this.errors = {};
    if (!this.form.nom.trim()) this.errors['nom'] = 'Le nom est requis.';
    if (!this.form.email.trim()) {
      this.errors['email'] = "L'email est requis.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
      this.errors['email'] = "L'adresse email n'est pas valide.";
    }
    if (!this.form.sujet.trim()) this.errors['sujet'] = 'Le sujet est requis.';
    if (!this.form.message.trim()) this.errors['message'] = 'Le message est requis.';
    return Object.keys(this.errors).length === 0;
  }

  onSubmit(): void {
    if (this.validate()) {
      this.submitted = true;
    }
  }

  reset(): void {
    this.form = { nom: '', email: '', sujet: '', message: '' };
    this.submitted = false;
    this.errors = {};
  }
}