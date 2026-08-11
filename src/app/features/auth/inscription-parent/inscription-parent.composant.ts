import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ROUTES_APP } from '../../../core/constantes/routes.constantes';

@Component({
  selector: 'app-inscription-parent',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="auth-page">
  <div class="auth-branding auth-branding--parent">
    <div class="auth-branding__inner">
      <div class="auth-logo">
        <div class="auth-logo__icon">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="white" fill-opacity="0.15"/>
            <path d="M8 26L18 10L28 26H8Z" fill="white" fill-opacity="0.9"/>
            <circle cx="18" cy="20" r="4" fill="#40BBCC"/>
          </svg>
        </div>
        <span class="auth-logo__name">Alternia</span>
      </div>
      <div class="auth-hero">
        <h2 class="auth-hero__title">Accompagnez vos enfants <em>au quotidien</em></h2>
        <p class="auth-hero__desc">Suivez en temps réel la progression scolaire de vos enfants et configurez leur boîtier d'apprentissage.</p>
      </div>
      <div class="auth-check-list">
        <div class="auth-check-item"><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span> Suivi de progression en temps réel</div>
        <div class="auth-check-item"><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span> Alertes et recommandations personnalisées</div>
        <div class="auth-check-item"><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span> Gestion du boîtier à distance</div>
        <div class="auth-check-item"><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span> Historique complet des sessions</div>
      </div>
    </div>
    <div class="auth-orb auth-orb--1"></div>
    <div class="auth-orb auth-orb--2"></div>
  </div>

  <div class="auth-form-panel">
    <div class="auth-form-container">
      @if (!succes()) {
        <div class="auth-step animate-fade-in">
          <div class="auth-form-header">
            <div class="profile-badge profile-badge--parent">Inscription Parent</div>
            <h1 class="auth-form-title">Créer votre compte</h1>
            <p class="auth-form-subtitle">Connectez-vous à l'apprentissage de vos enfants</p>
          </div>
          <form [formGroup]="formulaire" (ngSubmit)="sInscrire()" class="auth-form-body">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="nom-parent">Nom</label>
                <input id="nom-parent" type="text" class="form-input" formControlName="nom" placeholder="Coulibaly"/>
              </div>
              <div class="form-group">
                <label class="form-label" for="prenom-parent">Prénom</label>
                <input id="prenom-parent" type="text" class="form-input" formControlName="prenom" placeholder="Aïssata"/>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="email-parent">Email</label>
              <input id="email-parent" type="email" class="form-input" formControlName="email" placeholder="marie@gmail.com"/>
            </div>
            <div class="form-group">
              <label class="form-label" for="code-boitier">Code du boîtier</label>
              <input id="code-boitier" type="text" class="form-input" formControlName="codeBoitier" placeholder="ALT-HOME-XXXX"/>
              <span class="form-hint">Ce code se trouve sur l'étiquette de votre boîtier Alternia</span>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="mdp-parent">Mot de passe</label>
                <input id="mdp-parent" type="password" class="form-input" formControlName="motDePasse" placeholder="Min. 8 caractères"/>
              </div>
              <div class="form-group">
                <label class="form-label" for="conf-mdp-parent">Confirmation</label>
                <input id="conf-mdp-parent" type="password" class="form-input" formControlName="confirmationMotDePasse" placeholder="Retapez le mot de passe"/>
              </div>
            </div>
            <button id="btn-creer-compte-parent" type="submit" class="btn btn-secondary btn-lg btn-full" [disabled]="chargement()">
              @if (chargement()) { Création en cours… } @else { Créer mon compte parent }
            </button>
          </form>
          <p class="text-secondary text-sm" style="text-align: center">
            Déjà un compte ? <a [routerLink]="routes.AUTH.CONNEXION">Se connecter</a>
          </p>
        </div>
      } @else {
        <div class="auth-step auth-success animate-scale-in" style="text-align:center;align-items:center">
          <div style="margin-bottom:16px"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="16 9 10 15 7 12"/></svg></div>
          <h2 class="auth-form-title">Compte créé avec succès !</h2>
          <p class="auth-form-subtitle">Votre boîtier est maintenant associé à votre compte.</p>
          <a [routerLink]="routes.AUTH.CONNEXION" class="btn btn-secondary btn-lg btn-full" id="link-retour-connexion-parent">
            Aller à la connexion
          </a>
        </div>
      }
    </div>
  </div>
</div>
  `,
  styleUrl: '../inscription-etablissement/inscription-etablissement.composant.scss',
})
export class InscriptionParentComposant {
  private readonly fb = inject(FormBuilder);
  readonly routes = ROUTES_APP;
  chargement = signal(false);
  succes = signal(false);

  formulaire = this.fb.group({
    nom: ['', [Validators.required]],
    prenom: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    codeBoitier: ['', [Validators.required, Validators.pattern(/^ALT-[A-Z]+-\d{4}$/)]],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
    confirmationMotDePasse: ['', [Validators.required]],
  });

  async sInscrire(): Promise<void> {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }
    this.chargement.set(true);
    await new Promise(r => setTimeout(r, 1200));
    this.chargement.set(false);
    this.succes.set(true);
  }
}
