import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarRepository } from '../../../data/repositories/avatar.repository';
import { AvatarPedagogique } from '../../../domain/entites/avatar-pedagogique.entite';
import { Matiere, MatiereLabels, MatiereCouleurs, CategorieMatiere } from '../../../core/enums';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-gestion-avatars',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page-content stagger-children">
  <div class="page-header">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">
      <div>
        <h1 class="page-header__title">Avatars pédagogiques</h1>
        <p class="page-header__subtitle">Gérez vos enseignants IA et leurs personnalités</p>
      </div>
      <button class="btn btn-primary btn-sm" (click)="ouvrirModalCreation()" id="btn-creer-avatar">+ Créer un avatar</button>
    </div>
  </div>

  @if (chargement()) {
    <div class="avatars-grid">
      @for (i of [1,2,3,4,5,6]; track i) {
        <div class="skeleton" style="height:240px;border-radius:16px;"></div>
      }
    </div>
  } @else {
    <div class="avatars-grid stagger-children">
      @for (avatar of avatars(); track avatar.id) {
        <div class="avatar-card" [class.avatar-card--inactif]="!avatar.actif">
          <!-- Header with color accent -->
          <div class="avatar-card__header" [style.background]="MatiereCouleurs[avatar.matiere] + '18'">
            <div class="avatar-card__illustration" [style.color]="MatiereCouleurs[avatar.matiere]">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="18" r="10" fill="currentColor" fill-opacity="0.2"/>
                <circle cx="24" cy="18" r="6" fill="currentColor" fill-opacity="0.6"/>
                <path d="M10 42C10 34.268 16.268 28 24 28C31.732 28 38 34.268 38 42" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                <circle cx="36" cy="12" r="4" fill="currentColor" fill-opacity="0.3"/>
                <path d="M36 8V16M32 12H40" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="avatar-card__status">
              <span class="badge" [class.badge-success]="avatar.actif" [class.badge-danger]="!avatar.actif" (click)="basculerStatut(avatar)" style="cursor:pointer;" title="Cliquer pour basculer le statut">
                <span class="dot"></span>
                {{ avatar.actif ? 'Actif' : 'Inactif' }}
              </span>
            </div>
          </div>

          <!-- Body -->
          <div class="avatar-card__body">
            <h3 class="avatar-card__name">{{ avatar.nom }}</h3>
            <span class="badge badge-primary" style="margin-bottom:8px;display:inline-flex;" [style.background]="MatiereCouleurs[avatar.matiere] + '20'" [style.color]="MatiereCouleurs[avatar.matiere]">
              {{ MatiereLabels[avatar.matiere] }}
            </span>
            <p class="avatar-card__desc">{{ avatar.description }}</p>
            <div class="avatar-card__personality">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.2"/>
                <path d="M6 4V6M6 8H6.01" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
              {{ avatar.personnalite }}
            </div>
          </div>

          <!-- Footer -->
          <div class="avatar-card__footer">
            <span class="text-xs text-secondary">{{ avatar.utilisations.toLocaleString('fr-FR') }} sessions</span>
            <div style="display:flex;gap:6px;">
              <button class="btn btn-ghost btn-sm btn-icon" (click)="ouvrirModalEdition(avatar)" [id]="'btn-edit-avatar-' + avatar.id" title="Éditer avatar">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9.5 2.5L11.5 4.5L4.5 11.5H2.5V9.5L9.5 2.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
                </svg>
              </button>
              <button class="btn btn-ghost btn-sm btn-icon" (click)="testerAvatar(avatar)" [id]="'btn-preview-avatar-' + avatar.id" title="Tester l'avatar">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="3" stroke="currentColor" stroke-width="1.3"/>
                  <path d="M1 7C1 7 3 2 7 2C11 2 13 7 13 7C13 7 11 12 7 12C3 12 1 7 1 7Z" stroke="currentColor" stroke-width="1.3"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  }

  <!-- Modal Création / Édition Avatar -->
  @if (modalAvatarOuverte()) {
    <div class="modal-overlay" (click)="fermerModalAvatar()">
      <div class="modal-card animate-scale-in" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="fw-bold text-lg">{{ avatarEnEdition ? 'Modifier l\'avatar' : 'Créer un nouvel avatar' }}</h3>
          <button class="btn btn-ghost btn-sm btn-icon" (click)="fermerModalAvatar()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:14px;padding:20px 0;">
          <div class="form-group">
            <label class="form-label">Nom de l'avatar</label>
            <input type="text" class="form-input" [(ngModel)]="avatarForm.nom" placeholder="Ex: Soundiata"/>
          </div>
          <div class="form-group">
            <label class="form-label">Matière</label>
            <select class="form-input" [(ngModel)]="avatarForm.matiere">
              @for (m of matieresList; track m) {
                <option [value]="m">{{ MatiereLabels[m] }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-input" rows="3" [(ngModel)]="avatarForm.description" placeholder="Description du rôle de l'enseignant IA..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Personnalité</label>
            <input type="text" class="form-input" [(ngModel)]="avatarForm.personnalite" placeholder="Ex: Patient, rigoureux, captivant"/>
          </div>
        </div>
        <div class="modal-footer" style="display:flex;justify-content:flex-end;gap:10px;">
          <button class="btn btn-ghost" (click)="fermerModalAvatar()">Annuler</button>
          <button class="btn btn-primary" (click)="sauvegarderAvatar()">Enregistrer</button>
        </div>
      </div>
    </div>
  }

  <!-- Modal Aperçu / Test Avatar -->
  @if (avatarEnTest()) {
    <div class="modal-overlay" (click)="fermerTest()">
      <div class="modal-card animate-scale-in" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="fw-bold text-lg">Test de l'avatar {{ avatarEnTest()!.nom }}</h3>
          <button class="btn btn-ghost btn-sm btn-icon" (click)="fermerTest()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="modal-body" style="text-align:center;padding:24px 0;">
          <div class="avatar avatar-xl avatar-primary" style="margin:0 auto 16px;font-size:32px;">{{ avatarEnTest()!.nom.charAt(0) }}</div>
          <p class="text-sm text-secondary" style="margin-bottom:16px;">"Bonjour ! Je suis {{ avatarEnTest()!.nom }}. Comment puis-je t'aider en {{ MatiereLabels[avatarEnTest()!.matiere] }} aujourd'hui ?"</p>
          <div class="waveform" style="justify-content:center;height:36px;display:flex;gap:4px;align-items:center;">
            @for (i of [1,2,3,4,5,6,7,8,9,10]; track i) {
              <div style="width:4px;background:var(--color-primaire);border-radius:2px;animation:waveAnim 0.6s ease-in-out infinite alternate;" [style.animation-delay]="(i * 70) + 'ms'" [style.height]="(10 + (i * 3)) + 'px'"></div>
            }
          </div>
        </div>
        <div class="modal-footer" style="display:flex;justify-content:center;">
          <button class="btn btn-primary btn-sm" (click)="fermerTest()">Fermer l'aperçu</button>
        </div>
      </div>
    </div>
  }
</div>
  `,
  styles: [`
    .avatars-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .avatar-card { background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); transition: all var(--transition-base); }
    .avatar-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-3px); }
    .avatar-card--inactif { opacity: 0.65; }
    .avatar-card__header { padding: 24px; display: flex; justify-content: space-between; align-items: flex-start; min-height: 100px; }
    .avatar-card__illustration { display: flex; align-items: center; justify-content: center; }
    .avatar-card__body { padding: 16px 20px; }
    .avatar-card__name { font-family: var(--font-display); font-size: var(--text-lg); font-weight: var(--fw-bold); color: var(--color-text-primary); margin-bottom: 6px; }
    .avatar-card__desc { font-size: var(--text-sm); color: var(--color-text-secondary); line-height: var(--lh-relaxed); margin-bottom: 10px; }
    .avatar-card__personality { display: flex; align-items: center; gap: 5px; font-size: var(--text-xs); color: var(--color-text-tertiary); font-style: italic; }
    .avatar-card__footer { padding: 12px 20px; border-top: 1px solid var(--color-border); background: var(--color-bg-surface-2); display: flex; align-items: center; justify-content: space-between; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal-card { background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: 24px; max-width: 500px; width: 100%; box-shadow: var(--shadow-xl); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: 12px; }
    @keyframes waveAnim { from { height: 6px; } to { height: 32px; } }
  `],
})
export class GestionAvatarsComposant implements OnInit {
  private readonly repo = inject(AvatarRepository);
  private readonly notifService = inject(NotificationService);

  readonly MatiereLabels = MatiereLabels;
  readonly MatiereCouleurs = MatiereCouleurs;
  readonly matieresList = Object.values(Matiere);

  chargement = signal(true);
  avatars = signal<AvatarPedagogique[]>([]);

  modalAvatarOuverte = signal(false);
  avatarEnEdition: AvatarPedagogique | null = null;
  avatarForm = { nom: '', description: '', matiere: Matiere.MATHEMATIQUES, personnalite: '' };

  avatarEnTest = signal<AvatarPedagogique | null>(null);

  ngOnInit(): void {
    this.repo.obtenirTousAvatars().subscribe(a => {
      this.avatars.set(a);
      this.chargement.set(false);
    });
  }

  ouvrirModalCreation(): void {
    this.avatarEnEdition = null;
    this.avatarForm = { nom: '', description: '', matiere: Matiere.MATHEMATIQUES, personnalite: '' };
    this.modalAvatarOuverte.set(true);
  }

  ouvrirModalEdition(avatar: AvatarPedagogique): void {
    this.avatarEnEdition = avatar;
    this.avatarForm = {
      nom: avatar.nom,
      description: avatar.description,
      matiere: avatar.matiere,
      personnalite: avatar.personnalite,
    };
    this.modalAvatarOuverte.set(true);
  }

  fermerModalAvatar(): void {
    this.modalAvatarOuverte.set(false);
  }

  sauvegarderAvatar(): void {
    if (!this.avatarForm.nom || !this.avatarForm.description) {
      this.notifService.erreur('Formulaire incomplet', 'Veuillez saisir un nom et une description.');
      return;
    }

    if (this.avatarEnEdition) {
      this.avatars.update(list => list.map(a => a.id === this.avatarEnEdition!.id ? { ...a, ...this.avatarForm } : a));
      this.notifService.succes('Avatar modifié', `L'avatar ${this.avatarForm.nom} a été mis à jour.`);
    } else {
      const nouvel: AvatarPedagogique = {
        id: 'av-' + Date.now(),
        nom: this.avatarForm.nom,
        description: this.avatarForm.description,
        matiere: this.avatarForm.matiere,
        categorie: CategorieMatiere.SCIENTIFIQUE,
        personnalite: this.avatarForm.personnalite || 'Enthousiaste, pédagogique',
        actif: true,
        dateCreation: new Date(),
        utilisations: 0,
      };
      this.avatars.update(list => [nouvel, ...list]);
      this.notifService.succes('Avatar créé', `L'avatar ${nouvel.nom} a été créé avec succès.`);
    }

    this.fermerModalAvatar();
  }

  basculerStatut(avatar: AvatarPedagogique): void {
    const nouveauStatut = !avatar.actif;
    this.avatars.update(list => list.map(a => a.id === avatar.id ? { ...a, actif: nouveauStatut } : a));
    this.notifService.info('Statut mis à jour', `Avatar "${avatar.nom}" est désormais ${nouveauStatut ? 'Actif' : 'Inactif'}.`);
  }

  testerAvatar(avatar: AvatarPedagogique): void {
    this.avatarEnTest.set(avatar);
    this.notifService.info('Test d\'avatar', `Démonstration vocale de l'avatar ${avatar.nom}`);
  }

  fermerTest(): void {
    this.avatarEnTest.set(null);
  }
}
