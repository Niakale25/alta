import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarRepository } from '../../../data/repositories/avatar.repository';
import { VoixPedagogique } from '../../../domain/entites/avatar-pedagogique.entite';
import { Matiere, MatiereLabels, MatiereCouleurs } from '../../../core/enums';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-studio-vocal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page-content stagger-children">
  <div class="page-header">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">
      <div>
        <h1 class="page-header__title">Studio vocal</h1>
        <p class="page-header__subtitle">Gérez les voix pédagogiques et leurs associations</p>
      </div>
      <div style="display:flex;gap:10px;">
        <button class="btn btn-outline btn-sm" (click)="ouvrirModalClonage()" id="btn-cloner-voix">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="4" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
            <path d="M4 4V3C4 1.895 4.895 1 6 1H11C12.105 1 13 1.895 13 3V8C13 9.105 12.105 10 11 10H10" stroke="currentColor" stroke-width="1.3"/>
          </svg>
          Cloner une voix
        </button>
        <button class="btn btn-primary btn-sm" (click)="ouvrirModalAjoutVoix()" id="btn-ajouter-voix">+ Nouvelle voix</button>
      </div>
    </div>
  </div>

  <!-- Lecteur actif -->
  @if (voixEnLecture()) {
    <div class="lecteur-actif">
      <div class="lecteur-actif__info">
        <div class="icon-box icon-box-innovation">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <polygon points="5,3 15,9 5,15" fill="currentColor"/>
          </svg>
        </div>
        <div>
          <div class="fw-semibold">{{ voixEnLecture()?.nom }}</div>
          <div class="text-xs text-secondary">Lecture en cours…</div>
        </div>
      </div>
      <div class="lecteur-controls">
        <div class="waveform">
          @for (i of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]; track i) {
            <div class="wave-bar" [style.animation-delay]="(i * 60) + 'ms'"></div>
          }
        </div>
        <button class="btn btn-ghost btn-sm btn-icon" (click)="arreterLecture()" id="btn-arreter-lecture">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="3" y="3" width="4" height="10" rx="1" fill="currentColor"/>
            <rect x="9" y="3" width="4" height="10" rx="1" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  }

  @if (chargement()) {
    <div class="skeleton" style="height:400px;border-radius:16px;"></div>
  } @else {
    <div class="voix-grid stagger-children">
      @for (voix of voixList(); track voix.id) {
        <div class="voix-card">
          <div class="voix-card__header">
            <div class="icon-box" [class.icon-box-primary]="voix.genre === 'masculin'" [class.icon-box-innovation]="voix.genre === 'feminin'" [class.icon-box-secondaire]="voix.genre === 'neutre'">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="6" y="2" width="6" height="9" rx="3" stroke="currentColor" stroke-width="1.5"/>
                <path d="M3 9C3 12.314 5.686 15 9 15C12.314 15 15 12.314 15 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M9 15V17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="voix-card__meta">
              <div class="fw-semibold">{{ voix.nom }}</div>
              <div class="text-xs text-secondary">{{ voix.langue }} · {{ voix.genre | titlecase }}</div>
            </div>
          </div>

          @if (voix.matiereAssociee) {
            <div class="voix-matiere-badge"
              [style.background]="MatiereCouleurs[voix.matiereAssociee] + '20'"
              [style.color]="MatiereCouleurs[voix.matiereAssociee]">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style="display:inline-block;vertical-align:middle;margin-right:4px;">
                <path d="M2 3H8V14H2V3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M8 3H14V14H8V3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
              {{ MatiereLabels[voix.matiereAssociee] }}
            </div>
          }

          <p class="text-sm text-secondary" style="margin: 8px 0 16px;">{{ voix.description }}</p>

          <div style="display:flex;gap:8px;">
            <button class="btn btn-outline btn-sm" style="flex:1;" (click)="lireVoix(voix)" [id]="'btn-lire-' + voix.id">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <polygon points="3,2 12,7 3,12" fill="currentColor"/>
              </svg>
              Tester
            </button>
            <button class="btn btn-ghost btn-sm btn-icon" (click)="ouvrirModalAssociation(voix)" [id]="'btn-associer-' + voix.id" title="Associer à une matière">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7H11M8 4L11 7L8 10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      }
    </div>
  }

  <!-- Modal Clonage / Nouvelle Voix -->
  @if (modalVoixOuverte()) {
    <div class="modal-overlay" (click)="fermerModalVoix()">
      <div class="modal-card animate-scale-in" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="fw-bold text-lg">{{ estModeClonage ? 'Cloner une voix par IA' : 'Ajouter une nouvelle voix' }}</h3>
          <button class="btn btn-ghost btn-sm btn-icon" (click)="fermerModalVoix()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:14px;padding:20px 0;">
          <div class="form-group">
            <label class="form-label">Nom de la voix</label>
            <input type="text" class="form-input" [(ngModel)]="voixForm.nom" placeholder="Ex: Oumar / Fatou"/>
          </div>
          <div class="form-group">
            <label class="form-label">Genre</label>
            <select class="form-input" [(ngModel)]="voixForm.genre">
              <option value="feminin">Féminin</option>
              <option value="masculin">Masculin</option>
              <option value="neutre">Neutre</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <input type="text" class="form-input" [(ngModel)]="voixForm.description" placeholder="Voix dynamique et expressive..."/>
          </div>
          @if (estModeClonage) {
            <div class="form-group">
              <label class="form-label">Fichier audio modèle (.wav / .mp3)</label>
              <input type="file" class="form-input" accept="audio/*"/>
              <span class="text-xs text-secondary">Échantillon sonore minimum 30 secondes.</span>
            </div>
          }
        </div>
        <div class="modal-footer" style="display:flex;justify-content:flex-end;gap:10px;">
          <button class="btn btn-ghost" (click)="fermerModalVoix()">Annuler</button>
          <button class="btn btn-primary" (click)="sauvegarderVoix()">{{ estModeClonage ? 'Lancer le clonage' : 'Créer la voix' }}</button>
        </div>
      </div>
    </div>
  }

  <!-- Modal Association Matière -->
  @if (voixEnAssociation()) {
    <div class="modal-overlay" (click)="fermerModalAssociation()">
      <div class="modal-card animate-scale-in" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="fw-bold text-lg">Associer la voix {{ voixEnAssociation()!.nom }}</h3>
          <button class="btn btn-ghost btn-sm btn-icon" (click)="fermerModalAssociation()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="modal-body" style="padding:20px 0;">
          <div class="form-group">
            <label class="form-label">Matière attribuée</label>
            <select class="form-input" [(ngModel)]="matiereAssociation">
              @for (m of matieresList; track m) {
                <option [value]="m">{{ MatiereLabels[m] }}</option>
              }
            </select>
          </div>
        </div>
        <div class="modal-footer" style="display:flex;justify-content:flex-end;gap:10px;">
          <button class="btn btn-ghost" (click)="fermerModalAssociation()">Annuler</button>
          <button class="btn btn-primary" (click)="enregistrerAssociation()">Associer</button>
        </div>
      </div>
    </div>
  }
</div>
  `,
  styles: [`
    .lecteur-actif { background: var(--color-innovation-light); border: 1.5px solid var(--color-innovation); border-radius: var(--radius-lg); padding: 16px 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; animation: slideInUp 0.3s ease; }
    .lecteur-actif__info { display: flex; align-items: center; gap: 12px; }
    .lecteur-controls { display: flex; align-items: center; gap: 12px; }
    .waveform { display: flex; align-items: center; gap: 3px; height: 32px; }
    .wave-bar { width: 3px; background: var(--color-innovation); border-radius: 2px; animation: waveAnim 0.8s ease-in-out infinite alternate; }
    @keyframes waveAnim { from { height: 4px; } to { height: 28px; } }
    .voix-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px; }
    .voix-card { background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow-sm); transition: all var(--transition-base); }
    .voix-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
    .voix-card__header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .voix-card__meta { flex: 1; }
    .voix-matiere-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: var(--fw-semibold); margin-bottom: 8px; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal-card { background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: 24px; max-width: 480px; width: 100%; box-shadow: var(--shadow-xl); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: 12px; }
  `],
})
export class StudioVocalComposant implements OnInit {
  private readonly repo = inject(AvatarRepository);
  private readonly notifService = inject(NotificationService);

  readonly MatiereLabels = MatiereLabels;
  readonly MatiereCouleurs = MatiereCouleurs;
  readonly matieresList = Object.values(Matiere);

  chargement = signal(true);
  voixList = signal<VoixPedagogique[]>([]);
  voixEnLecture = signal<VoixPedagogique | null>(null);

  modalVoixOuverte = signal(false);
  estModeClonage = false;
  voixForm = { nom: '', description: '', genre: 'feminin' as 'feminin' | 'masculin' | 'neutre' };

  voixEnAssociation = signal<VoixPedagogique | null>(null);
  matiereAssociation: Matiere = Matiere.MATHEMATIQUES;

  ngOnInit(): void {
    this.repo.obtenirToutesVoix().subscribe(v => {
      this.voixList.set(v);
      this.chargement.set(false);
    });
  }

  lireVoix(voix: VoixPedagogique): void {
    this.voixEnLecture.set(voix);
    this.notifService.info('Studio vocal', `Lecture de la voix de ${voix.nom} en cours…`);
    setTimeout(() => {
      if (this.voixEnLecture()?.id === voix.id) {
        this.voixEnLecture.set(null);
      }
    }, 5000);
  }

  arreterLecture(): void {
    this.voixEnLecture.set(null);
  }

  ouvrirModalClonage(): void {
    this.estModeClonage = true;
    this.voixForm = { nom: '', description: '', genre: 'feminin' };
    this.modalVoixOuverte.set(true);
  }

  ouvrirModalAjoutVoix(): void {
    this.estModeClonage = false;
    this.voixForm = { nom: '', description: '', genre: 'feminin' };
    this.modalVoixOuverte.set(true);
  }

  fermerModalVoix(): void {
    this.modalVoixOuverte.set(false);
  }

  sauvegarderVoix(): void {
    if (!this.voixForm.nom) {
      this.notifService.erreur('Champ obligatoire', 'Veuillez renseigner le nom de la voix.');
      return;
    }

    const nouvelleVoix: VoixPedagogique = {
      id: 'vx-' + Date.now(),
      nom: this.voixForm.nom,
      description: this.voixForm.description || 'Nouvelle voix générée par IA',
      langue: 'fr-FR',
      genre: this.voixForm.genre,
      accent: 'Africain francophone',
      actif: true,
      dateCreation: new Date(),
    };

    this.voixList.update(list => [nouvelleVoix, ...list]);
    this.fermerModalVoix();

    if (this.estModeClonage) {
      this.notifService.succes('Clonage vocal terminé', `La voix ${nouvelleVoix.nom} a été clonée et ajoutée au catalogue.`);
    } else {
      this.notifService.succes('Voix ajoutée', `La voix ${nouvelleVoix.nom} a été ajoutée.`);
    }
  }

  ouvrirModalAssociation(voix: VoixPedagogique): void {
    this.voixEnAssociation.set(voix);
    this.matiereAssociation = voix.matiereAssociee ?? Matiere.MATHEMATIQUES;
  }

  fermerModalAssociation(): void {
    this.voixEnAssociation.set(null);
  }

  enregistrerAssociation(): void {
    const v = this.voixEnAssociation();
    if (!v) return;

    this.voixList.update(list => list.map(item => item.id === v.id ? { ...item, matiereAssociee: this.matiereAssociation } : item));
    this.notifService.succes('Association réussie', `La voix ${v.nom} est attribuée à la matière ${MatiereLabels[this.matiereAssociation]}.`);
    this.fermerModalAssociation();
  }
}
