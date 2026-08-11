import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatistiquesRepository } from '../../../data/repositories/statistiques.repository';
import { NotionDifficile, StatistiquesUtilisation } from '../../../domain/entites/statistiques-utilisation.entite';
import { MatiereLabels, MatiereCouleurs } from '../../../core/enums';

@Component({
  selector: 'app-statistiques-pedagogiques',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="page-content stagger-children">
  <div class="page-header">
    <h1 class="page-header__title">Statistiques pédagogiques</h1>
    <p class="page-header__subtitle">Analyse approfondie des performances et tendances d'apprentissage</p>
  </div>

  @if (chargement()) {
    <div class="skeleton" style="height: 500px; border-radius: 16px;"></div>
  } @else {

    <!-- Notions difficiles -->
    <div class="card" style="margin-bottom: 24px;">
      <div class="card__header">
        <h2 class="card__title">Notions les plus difficiles</h2>
        <span class="badge badge-warning">Points d'attention</span>
      </div>
      <div class="card__body">
        <div class="notions-list">
          @for (notion of notionsDifficiles(); track notion.notion) {
            <div class="notion-card">
              <div class="notion-card__header">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div class="icon-box icon-box-sm icon-box-warning">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 5V7M7 9H7.01" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                      <path d="M7 1L13 12H1L7 1Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div class="fw-semibold text-sm">{{ notion.notion }}</div>
                    <div class="text-xs text-secondary" [style.color]="MatiereCouleurs[notion.matiere]">{{ MatiereLabels[notion.matiere] }}</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div class="fw-bold text-danger">{{ notion.tauxEchec }}% récurrence</div>
                  <div class="text-xs text-secondary">{{ notion.apprenantsConcernes }} demandes enregistrées</div>
                </div>
              </div>
              <div class="progress-bar" style="margin-top: 8px;">
                <div class="progress-bar__fill danger" [style.width.%]="notion.tauxEchec"></div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Pics d'utilisation -->
    @if (stats()) {
      <div class="card">
        <div class="card__header">
          <h2 class="card__title">Pics d'utilisation journaliers</h2>
          <span class="badge badge-innovation">Aujourd'hui</span>
        </div>
        <div class="card__body">
          <div class="pic-chart">
            @for (pic of stats()!.pictUtilisation; track pic.heure) {
              <div class="pic-item">
                <div class="pic-bar-wrapper">
                  <div
                    class="pic-bar"
                    [style.height.%]="(pic.nombreSessions / maxPic()) * 100"
                    [class.pic-bar--peak]="pic.nombreSessions === maxPic()"
                  ></div>
                </div>
                @if (pic.heure % 3 === 0) {
                  <span class="pic-label">{{ pic.heure }}h</span>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  }
</div>
  `,
  styles: [`
    .notions-list { display: flex; flex-direction: column; gap: 16px; }
    .notion-card { padding: 16px; border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .notion-card__header { display: flex; align-items: center; justify-content: space-between; }
    .pic-chart { display: flex; align-items: flex-end; gap: 4px; height: 160px; }
    .pic-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; }
    .pic-bar-wrapper { flex: 1; display: flex; align-items: flex-end; width: 100%; }
    .pic-bar { width: 100%; border-radius: 3px 3px 0 0; background: var(--color-primaire-light); transition: height 0.5s ease; min-height: 4px; }
    .pic-bar--peak { background: var(--color-primaire) !important; }
    .pic-label { font-size: 10px; color: var(--color-text-tertiary); }
  `],
})
export class StatistiquesPedagogiquesComposant implements OnInit {
  private readonly repo = inject(StatistiquesRepository);
  readonly MatiereLabels = MatiereLabels;
  readonly MatiereCouleurs = MatiereCouleurs;

  chargement = signal(true);
  stats = signal<StatistiquesUtilisation | null>(null);
  notionsDifficiles = signal<NotionDifficile[]>([]);

  maxPic = () => {
    const pics = this.stats()?.pictUtilisation ?? [];
    return Math.max(...pics.map(p => p.nombreSessions));
  };

  ngOnInit(): void {
    this.repo.obtenirStatistiques('etab-1').subscribe(s => this.stats.set(s));
    this.repo.obtenirNotionsDifficiles('etab-1').subscribe(n => {
      this.notionsDifficiles.set(n);
      this.chargement.set(false);
    });
  }
}
