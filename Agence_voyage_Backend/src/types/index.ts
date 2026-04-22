export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'gestionnaire' | 'client';
  telephone?: string;
  created_at: Date;
}

export interface Destination {
  id: number;
  nom: string;
  pays: string;
  description?: string;
  image_url?: string;
}

export interface Offre {
  id: number;
  titre: string;
  description?: string;
  destination_id: number;
  prix: number;
  duree_jours: number;
  date_depart: Date;
  date_retour: Date;
  places_disponibles: number;
  image_url?: string;
  badge?: 'bestseller' | 'promo';
  promo_percent?: number;
  rating_moyen: number;
  created_by: number;
}

export interface Reservation {
  id: number;
  user_id: number;
  offre_id: number;
  nb_personnes: number;
  prix_total: number;
  statut: 'en_attente' | 'confirmee' | 'annulee';
  date_reservation: Date;
}

export interface Paiement {
  id: number;
  reservation_id: number;
  montant: number;
  methode: 'carte' | 'paypal' | 'virement' | 'especes';
  statut: 'en_attente' | 'reussi' | 'echoue' | 'rembourse';
  transaction_id?: string;
  date_paiement: Date;
}

export interface Avis {
  id: number;
  user_id: number;
  offre_id: number;
  note: number;        // entre 1 et 5
  commentaire?: string;
  created_at: Date;
}

export interface Favori {
  id: number;
  user_id: number;
  offre_id: number;
  created_at: Date;
}