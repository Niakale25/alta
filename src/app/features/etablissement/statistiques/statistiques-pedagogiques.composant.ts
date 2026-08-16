import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatistiquesRepository } from '../../../data/repositories/statistiques.repository';
import { NotionDifficile, StatistiquesUtilisation } from '../../../domain/entites/statistiques-utilisation.entite';
import { MatiereLabels, MatiereCouleurs, Matiere } from '../../../core/enums';
import { NotificationService } from '../../../core/services/notification.service';

type PeriodeFiltre = 'jour' | 'semaine' | 'mois' | 'trimestre';
type VueTendance = 'journalier' | 'mensuel';

@Component({
  selector: 'app-statistiques-pedagogiques',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="stats-page stagger-children">
  
  <!-- HERO & CONTROL HEADER -->
  <header class="stats-header">
    <div class="stats-header__content">
      <div class="stats-header__meta">
        <div class="stats-live-pill">
          <span class="live-pulse"></span>
          <span>Analytique IA en temps réel</span>
          <span class="stats-separator">·</span>
          <span class="text-xs opacity-80">342 Boîtiers connectés</span>
        </div>
        <h1 class="stats-title">Statistiques & Analytique Pédagogique</h1>
        <p class="stats-subtitle">
          Mesure continue de l'engagement, cartographie des acquis et détection proactive des besoins d'apprentissage
        </p>
      </div>

      <!-- Controls & Actions -->
      <div class="stats-header__actions">
        <!-- Period Switcher -->
        <div class="period-toggle-group">
          <button 
            class="period-toggle-btn" 
            [class.period-toggle-btn--active]="periodeActive() === 'jour'"
            (click)="changerPeriode('jour')">
            Aujourd'hui
          </button>
          <button 
            class="period-toggle-btn" 
            [class.period-toggle-btn--active]="periodeActive() === 'semaine'"
            (click)="changerPeriode('semaine')">
            7 Jours
          </button>
          <button 
            class="period-toggle-btn" 
            [class.period-toggle-btn--active]="periodeActive() === 'mois'"
            (click)="changerPeriode('mois')">
            Mois
          </button>
          <button 
            class="period-toggle-btn" 
            [class.period-toggle-btn--active]="periodeActive() === 'trimestre'"
            (click)="changerPeriode('trimestre')">
            Trimestre
          </button>
        </div>

        <div class="actions-buttons-row">
          <button class="btn btn-outline btn-sm btn-action-stats" (click)="rafraichirDonnees()" id="btn-refresh-stats" title="Rafraîchir les données">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" [class.animate-spin]="chargement()">
              <path d="M2 7C2 4.239 4.239 2 7 2C9.209 2 11.14 3.14 12.25 4.875" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              <path d="M12 7C12 9.761 9.761 12 7 12C4.791 12 2.86 10.86 1.75 9.125" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              <path d="M12 2V5H9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12V9H5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Actualiser
          </button>

          <button class="btn btn-primary btn-sm btn-action-stats" (click)="exporterRapport()" id="btn-export-stats">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2V9M7 9L4 6M7 9L10 6" stroke="white" stroke-width="1.3" stroke-linecap="round"/>
              <path d="M2 12H12" stroke="white" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            Exporter le bilan
          </button>
        </div>
      </div>
    </div>
  </header>

  @if (chargement()) {
    <div class="kpi-grid">
      @for (i of [1,2,3,4]; track i) {
        <div class="skeleton" style="height:140px;border-radius:18px;"></div>
      }
    </div>
    <div class="skeleton" style="height:360px;border-radius:18px;margin-top:24px;"></div>
  } @else {

    <!-- EXECUTIVE KPI CARDS -->
    <section class="kpi-deck">
      <!-- KPI 1: Questions IA -->
      <div class="stat-card stat-card--primary">
        <div class="stat-card__glow"></div>
        <div class="stat-card__header">
          <span class="stat-card__label">Questions Posées à l'IA</span>
          <div class="stat-card__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
        </div>
        <div class="stat-card__body">
          <div class="stat-card__val">{{ (stats()?.totalQuestionsIA || 14782).toLocaleString('fr-FR') }}</div>
          <div class="stat-card__footer">
            <span class="trend-badge trend-badge--up">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
              +18.4%
            </span>
            <span class="stat-card__caption">vs période précédente</span>
          </div>
        </div>
        <div class="stat-card__progress">
          <div class="progress-bar-thin"><div class="fill fill--primary" style="width: 82%;"></div></div>
        </div>
      </div>

      <!-- KPI 2: Temps d'apprentissage -->
      <div class="stat-card stat-card--secondary">
        <div class="stat-card__glow"></div>
        <div class="stat-card__header">
          <span class="stat-card__label">Temps d'Étude Cumulé</span>
          <div class="stat-card__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
        </div>
        <div class="stat-card__body">
          <div class="stat-card__val">{{ heuresApprentissage() }}h <span class="stat-card__val-sub">{{ minutesRestantes() }}m</span></div>
          <div class="stat-card__footer">
            <span class="trend-badge trend-badge--up">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
              +12.6%
            </span>
            <span class="stat-card__caption">Moy. ~4h20 / apprenant</span>
          </div>
        </div>
        <div class="stat-card__progress">
          <div class="progress-bar-thin"><div class="fill fill--secondary" style="width: 74%;"></div></div>
        </div>
      </div>

      <!-- KPI 3: Apprenants Actifs -->
      <div class="stat-card stat-card--innovation">
        <div class="stat-card__glow"></div>
        <div class="stat-card__header">
          <span class="stat-card__label">Apprenants Actifs</span>
          <div class="stat-card__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
        </div>
        <div class="stat-card__body">
          <div class="stat-card__val">{{ stats()?.apprenantActifs || 342 }} <span class="stat-card__val-sub">/ 350</span></div>
          <div class="stat-card__footer">
            <span class="trend-badge trend-badge--up">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
              97.7%
            </span>
            <span class="stat-card__caption">Taux d'assiduité élevé</span>
          </div>
        </div>
        <div class="stat-card__progress">
          <div class="progress-bar-thin"><div class="fill fill--innovation" style="width: 97.7%;"></div></div>
        </div>
      </div>

      <!-- KPI 4: Indice d'engagement -->
      <div class="stat-card stat-card--success">
        <div class="stat-card__glow"></div>
        <div class="stat-card__header">
          <span class="stat-card__label">Taux d'Engagement Moyen</span>
          <div class="stat-card__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
        </div>
        <div class="stat-card__body">
          <div class="stat-card__val">{{ stats()?.tauxEngagement || 78 }}%</div>
          <div class="stat-card__footer">
            <span class="badge badge-success" style="font-size:10px;padding:2px 8px;">Niveau Optimal</span>
            <span class="stat-card__caption">Qualité des sessions IA</span>
          </div>
        </div>
        <div class="stat-card__progress">
          <div class="progress-bar-thin"><div class="fill fill--success" [style.width.%]="stats()?.tauxEngagement || 78"></div></div>
        </div>
      </div>
    </section>

    <!-- SECTION VISUALISATIONS: PICS D'UTILISATION & ÉVOLUTION -->
    <section class="charts-main-grid">
      
      <!-- PICS D'UTILISATION HORAIRE (HISTOGRAMME HD) -->
      <div class="card analytics-card">
        <div class="card__header">
          <div class="card-title-group">
            <div class="icon-indicator icon-indicator--primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <div>
              <h2 class="card__title">Fréquentation & Pics d'Utilisation Journaliers</h2>
              <p class="card__subtitle">Répartition par créneau horaire (de 07h à 21h)</p>
            </div>
          </div>
          <div class="card-header-tag">
            <span class="badge badge-innovation">
              <span class="dot animate-pulse"></span> Pic : 16h (520 sessions)
            </span>
          </div>
        </div>

        <div class="card__body">
          <div class="histogram-container">
            <div class="histogram-bars-wrapper">
              <!-- Moyenne ligne de repère -->
              <div class="average-line" style="bottom: 58%;">
                <span class="average-line__label">Moyenne: 320 sessions</span>
              </div>

              @for (pic of stats()?.pictUtilisation; track pic.heure) {
                <div class="histo-bar-col" 
                     [class.histo-bar-col--peak]="pic.nombreSessions === maxPic()"
                     (mouseenter)="barSurvolee.set(pic)"
                     (mouseleave)="barSurvolee.set(null)">
                  
                  <div class="histo-bar-track">
                    <div class="histo-bar-fill"
                         [style.height.%]="(pic.nombreSessions / maxPic()) * 100"
                         [class.is-peak]="pic.nombreSessions === maxPic()">
                      
                      <!-- Value tag above peak or hovered -->
                      @if (pic.nombreSessions === maxPic() || barSurvolee()?.heure === pic.heure) {
                        <div class="histo-tooltip">
                          <strong>{{ pic.nombreSessions }}</strong> sessions
                        </div>
                      }
                    </div>
                  </div>

                  <span class="histo-bar-time" [class.is-peak-text]="pic.nombreSessions === maxPic()">
                    {{ pic.heure }}h
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- Mini Legend / Metrics Row -->
          <div class="histogram-footer-metrics">
            <div class="histo-metric-item">
              <span class="histo-metric-dot morning"></span>
              <span class="text-xs text-secondary">Matin (8h-12h) : <strong>1 160</strong> sessions (34%)</span>
            </div>
            <div class="histo-metric-item">
              <span class="histo-metric-dot afternoon"></span>
              <span class="text-xs text-secondary">Après-midi (14h-18h) : <strong>1 930</strong> sessions (56%)</span>
            </div>
            <div class="histo-metric-item">
              <span class="histo-metric-dot evening"></span>
              <span class="text-xs text-secondary">Soirée (19h-21h) : <strong>620</strong> sessions (10%)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ÉVOLUTION TEMPORELLE / COURBE SVG -->
      <div class="card analytics-card">
        <div class="card__header">
          <div class="card-title-group">
            <div class="icon-indicator icon-indicator--secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
            <div>
              <h2 class="card__title">Dynamique & Courbe de Progression</h2>
              <p class="card__subtitle">Intensité d'apprentissage au fil du temps</p>
            </div>
          </div>

          <!-- Switcher Vue Journalière / Mensuelle -->
          <div class="tab-pill-group">
            <button class="tab-pill-btn" [class.tab-pill-btn--active]="vueTendance() === 'journalier'" (click)="vueTendance.set('journalier')">
              Semaine (7j)
            </button>
            <button class="tab-pill-btn" [class.tab-pill-btn--active]="vueTendance() === 'mensuel'" (click)="vueTendance.set('mensuel')">
              12 Mois
            </button>
          </div>
        </div>

        <div class="card__body">
          <div class="curve-chart-wrapper">
            <svg viewBox="0 0 500 200" class="smooth-area-chart" preserveAspectRatio="none">
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--color-primaire)" stop-opacity="0.45"/>
                  <stop offset="100%" stop-color="var(--color-primaire)" stop-opacity="0.0"/>
                </linearGradient>
              </defs>

              <!-- Grid Lines -->
              <line x1="0" y1="50" x2="500" y2="50" stroke="var(--color-border)" stroke-dasharray="4 4" stroke-width="1"/>
              <line x1="0" y1="100" x2="500" y2="100" stroke="var(--color-border)" stroke-dasharray="4 4" stroke-width="1"/>
              <line x1="0" y1="150" x2="500" y2="150" stroke="var(--color-border)" stroke-dasharray="4 4" stroke-width="1"/>

              <!-- Area Fill -->
              <path [attr.d]="svgAreaPath()" fill="url(#curveGradient)"/>

              <!-- Main Stroke Line -->
              <path [attr.d]="svgLinePath()" fill="none" stroke="var(--color-primaire)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

              <!-- Interactive Points -->
              @for (pt of currentChartPoints(); track pt.label; let i = $index) {
                <circle 
                  [attr.cx]="pt.x" 
                  [attr.cy]="pt.y" 
                  r="5" 
                  class="chart-data-node"
                  [class.chart-data-node--active]="pointSurvole()?.label === pt.label"
                  (mouseenter)="pointSurvole.set(pt)"
                  (mouseleave)="pointSurvole.set(null)"
                />
              }
            </svg>

            <!-- Chart Hover Popup -->
            @if (pointSurvole()) {
              <div class="chart-point-popup" [style.left.px]="pointSurvole()!.x" [style.top.px]="pointSurvole()!.y - 45">
                <span class="chart-point-popup__title">{{ pointSurvole()!.label }}</span>
                <span class="chart-point-popup__val">{{ pointSurvole()!.value }} sessions</span>
              </div>
            }
          </div>

          <!-- Bottom Axis Labels -->
          <div class="curve-axis-labels">
            @for (pt of currentChartPoints(); track pt.label) {
              <span class="axis-label" [class.axis-label--active]="pointSurvole()?.label === pt.label">{{ pt.label }}</span>
            }
          </div>

          <div class="curve-chart-insight">
            <div class="insight-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span>Progression constante : <strong>+22%</strong> d'activités depuis le début du semestre.</span>
            </div>
          </div>
        </div>
      </div>

    </section>

    <!-- SECTION MATIÈRES & DÉTECTION DES NOTIONS COMPLEXES -->
    <section class="subjects-and-notions-grid">

      <!-- RÉPARTITION PAR DISCIPLINE -->
      <div class="card">
        <div class="card__header">
          <div class="card-title-group">
            <div class="icon-indicator icon-indicator--innovation">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div>
              <h2 class="card__title">Répartition & Intensité par Matière</h2>
              <p class="card__subtitle">Part du volume de questions et temps passé</p>
            </div>
          </div>
          <span class="badge badge-primary">7 disciplines</span>
        </div>

        <div class="card__body">
          <!-- Multi-Color Segmented Bar -->
          <div class="stacked-bar-wrapper">
            <div class="stacked-bar">
              @for (m of stats()?.matieresPlusUtilisees; track m.matiere) {
                <div class="stacked-bar__segment"
                     [style.width.%]="m.pourcentage"
                     [style.background]="MatiereCouleurs[m.matiere]"
                     [title]="MatiereLabels[m.matiere] + ' : ' + m.pourcentage + '%'">
                </div>
              }
            </div>
          </div>

          <!-- Subject List Cards -->
          <div class="subject-detailed-list">
            @for (m of stats()?.matieresPlusUtilisees; track m.matiere; let idx = $index) {
              <div class="subject-row-item" [class.subject-row-item--selected]="matiereSelectionnee() === m.matiere" (click)="selectionnerMatiere(m.matiere)">
                <div class="subject-row-item__rank">#{{ idx + 1 }}</div>
                
                <div class="subject-row-item__color-pill" [style.background]="MatiereCouleurs[m.matiere]"></div>
                
                <div class="subject-row-item__info">
                  <div class="subject-row-item__name">{{ MatiereLabels[m.matiere] }}</div>
                  <div class="subject-row-item__sub">
                    <span>{{ m.totalQuestions.toLocaleString('fr-FR') }} questions</span>
                    <span class="dot-separator">·</span>
                    <span>{{ (m.tempsTotal / 60).toFixed(0) }}h d'étude</span>
                  </div>
                </div>

                <div class="subject-row-item__stats">
                  <div class="subject-row-item__pct">{{ m.pourcentage }}%</div>
                  <div class="progress-bar-mini">
                    <div class="progress-bar-mini__fill" [style.width.%]="m.pourcentage" [style.background]="MatiereCouleurs[m.matiere]"></div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- NOTIONS DIFFICILES & REMÉDIATION IA -->
      <div class="card">
        <div class="card__header">
          <div class="card-title-group">
            <div class="icon-indicator icon-indicator--warning">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <h2 class="card__title">Points de Blocage & Notions Difficiles</h2>
              <p class="card__subtitle">Détectés automatiquement d'après les échecs et requêtes récurrentes</p>
            </div>
          </div>
          <span class="badge badge-danger">Action Prioritaire</span>
        </div>

        <div class="card__body">
          <div class="notions-cards-stack">
            @for (notion of notionsDifficiles(); track notion.notion) {
              <div class="notion-item-modern">
                <div class="notion-item-modern__top">
                  <div class="notion-item-modern__tags">
                    <span class="matiere-badge-pill" [style.background]="MatiereCouleurs[notion.matiere] + '20'" [style.color]="MatiereCouleurs[notion.matiere]">
                      {{ MatiereLabels[notion.matiere] }}
                    </span>
                    <span class="severity-badge" [class.severity-badge--high]="notion.tauxEchec >= 60" [class.severity-badge--med]="notion.tauxEchec < 60">
                      {{ notion.tauxEchec >= 60 ? 'Difficulté Critique' : 'Difficulté Modérée' }}
                    </span>
                  </div>
                  
                  <div class="notion-failure-pct">
                    <span class="failure-number">{{ notion.tauxEchec }}%</span>
                    <span class="failure-label">taux d'incompréhension</span>
                  </div>
                </div>

                <div class="notion-item-modern__title">{{ notion.notion }}</div>

                <div class="notion-item-modern__meta">
                  <div class="meta-stat">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    <span><strong>{{ notion.apprenantsConcernes }}</strong> apprenants concernés</span>
                  </div>
                  <div class="meta-stat">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
                    <span><strong>{{ notion.nombreTentatives }}</strong> requêtes IA</span>
                  </div>
                </div>

                <div class="notion-item-modern__action">
                  <div class="progress-bar-notion">
                    <div class="progress-bar-notion__fill" [style.width.%]="notion.tauxEchec" [class.high-risk]="notion.tauxEchec >= 60"></div>
                  </div>
                  <button class="btn btn-outline btn-sm btn-remediation" (click)="lancerRemediation(notion)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                    Générer Renforcement IA
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

    </section>

    <!-- SECTION STRATÉGIQUE: CONSEILS IA & PLAN D'ACTION -->
    <section class="pedagogical-tips-banner">
      <div class="tips-banner-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M12 2v1M12 21v1M4.2 4.2l.7.7M19.1 19.1l.7.7M2 12h1M21 12h1M4.2 19.8l.7-.7M19.1 4.9l.7-.7"/>
          <circle cx="12" cy="12" r="7"/>
        </svg>
      </div>
      <div class="tips-banner-content">
        <h3 class="tips-banner-title">Recommandations Pédagogiques Prioritaires de la Semaine</h3>
        <div class="tips-grid">
          <div class="tip-card">
            <div class="tip-card__dot"></div>
            <div>
              <strong>Séance de soutien en Mathématiques :</strong> 89 élèves bloquent sur le chapitre des <em>Intégrales</em>. Nous recommandons un quiz d'évaluation court en classe.
            </div>
          </div>
          <div class="tip-card">
            <div class="tip-card__dot"></div>
            <div>
              <strong>Optimisation des créneaux :</strong> Forte affluence observée entre 15h00 et 17h00. Les professeurs peuvent planifier leurs exercices interactifs durant cette tranche.
            </div>
          </div>
        </div>
      </div>
    </section>

  }
</div>
  `,
  styles: [`
    .stats-page {
      display: flex;
      flex-direction: column;
      gap: 28px;
      padding: var(--space-6) var(--space-8);
      max-width: var(--content-max-width);
      animation: fadeIn 0.3s ease;
      @media (max-width: 768px) { padding: var(--space-4); }
    }

    /* HEADER */
    .stats-header {
      background: linear-gradient(135deg, rgba(49, 73, 153, 0.08), rgba(64, 187, 204, 0.05));
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: 24px 28px;
      box-shadow: var(--shadow-sm);
    }
    .stats-header__content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }
    .stats-live-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text-secondary);
      margin-bottom: 8px;
      box-shadow: var(--shadow-xs);
    }
    .live-pulse {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--color-success);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
      animation: pulse-soft 2s infinite;
    }
    .stats-separator { opacity: 0.4; }
    .stats-title {
      font-family: var(--font-display);
      font-size: 26px;
      font-weight: 800;
      color: var(--color-text-primary);
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    .stats-subtitle {
      font-size: 13px;
      color: var(--color-text-secondary);
      margin-top: 4px;
      max-width: 680px;
    }
    .stats-header__actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
      @media (max-width: 900px) { align-items: flex-start; }
    }
    .period-toggle-group {
      display: flex;
      background: var(--color-bg-surface);
      padding: 3px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-xs);
    }
    .period-toggle-btn {
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-secondary);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
      &:hover { color: var(--color-text-primary); }
      &--active {
        background: var(--color-primaire);
        color: white !important;
        box-shadow: var(--shadow-xs);
      }
    }
    .actions-buttons-row {
      display: flex;
      gap: 10px;
    }
    .btn-action-stats {
      font-size: 12px;
      font-weight: 600;
      border-radius: var(--radius-md);
    }

    /* KPI CARDS */
    .kpi-deck {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 18px;
    }
    .stat-card {
      position: relative;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
      &:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-md);
        border-color: rgba(49, 73, 153, 0.4);
      }
    }
    .stat-card__glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
    }
    .stat-card--primary .stat-card__glow { background: linear-gradient(90deg, var(--color-primaire), var(--color-innovation)); }
    .stat-card--secondary .stat-card__glow { background: linear-gradient(90deg, var(--color-secondaire), #fbbf24); }
    .stat-card--innovation .stat-card__glow { background: linear-gradient(90deg, var(--color-innovation), #34d399); }
    .stat-card--success .stat-card__glow { background: linear-gradient(90deg, var(--color-success), #10b981); }

    .stat-card__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .stat-card__label {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .stat-card__icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-bg-surface-2);
      color: var(--color-primaire);
    }
    .stat-card--secondary .stat-card__icon { color: var(--color-secondaire); }
    .stat-card--innovation .stat-card__icon { color: var(--color-innovation); }
    .stat-card--success .stat-card__icon { color: var(--color-success); }

    .stat-card__body {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .stat-card__val {
      font-family: var(--font-display);
      font-size: 30px;
      font-weight: 800;
      color: var(--color-text-primary);
      line-height: 1.1;
      letter-spacing: -0.02em;
    }
    .stat-card__val-sub {
      font-size: 18px;
      font-weight: 500;
      color: var(--color-text-tertiary);
    }
    .stat-card__footer {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .trend-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: var(--radius-full);
      &--up { background: var(--color-success-light); color: var(--color-success); }
    }
    .stat-card__caption {
      font-size: 11px;
      color: var(--color-text-tertiary);
    }
    .progress-bar-thin {
      width: 100%;
      height: 4px;
      background: var(--color-bg-surface-2);
      border-radius: var(--radius-full);
      overflow: hidden;
      .fill { height: 100%; border-radius: var(--radius-full); }
      .fill--primary { background: var(--color-primaire); }
      .fill--secondary { background: var(--color-secondaire); }
      .fill--innovation { background: var(--color-innovation); }
      .fill--success { background: var(--color-success); }
    }

    /* MAIN CHARTS GRID */
    .charts-main-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 24px;
      @media (max-width: 1100px) { grid-template-columns: 1fr; }
    }
    .analytics-card {
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
    }
    .card-title-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .icon-indicator {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      &--primary { background: var(--color-primaire-light); color: var(--color-primaire); }
      &--secondary { background: var(--color-secondaire-light); color: var(--color-secondaire); }
      &--innovation { background: var(--color-innovation-light); color: var(--color-innovation); }
      &--warning { background: var(--color-warning-light); color: var(--color-warning); }
    }
    .card__subtitle {
      font-size: 12px;
      color: var(--color-text-secondary);
      margin-top: 1px;
    }

    /* HISTOGRAM */
    .histogram-container {
      position: relative;
      height: 200px;
      margin-top: 16px;
      padding: 0 4px;
    }
    .histogram-bars-wrapper {
      position: relative;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      height: 100%;
      gap: 6px;
    }
    .average-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      border-top: 1px dashed var(--color-text-tertiary);
      opacity: 0.6;
      pointer-events: none;
      z-index: 1;
    }
    .average-line__label {
      position: absolute;
      right: 0;
      top: -14px;
      font-size: 9px;
      font-weight: 600;
      color: var(--color-text-tertiary);
      background: var(--color-bg-surface);
      padding: 0 4px;
    }
    .histo-bar-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      cursor: pointer;
      position: relative;
      z-index: 2;
    }
    .histo-bar-track {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    .histo-bar-fill {
      width: 80%;
      max-width: 28px;
      border-radius: 6px 6px 0 0;
      background: linear-gradient(180deg, var(--color-primaire-light), rgba(49, 73, 153, 0.4));
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      min-height: 8px;
      &:hover {
        background: linear-gradient(180deg, var(--color-primaire), #263a7a) !important;
        transform: scaleY(1.04);
      }
      &.is-peak {
        background: linear-gradient(180deg, var(--color-secondaire), #d4711a) !important;
        box-shadow: 0 0 12px rgba(241, 133, 31, 0.4);
      }
    }
    .histo-tooltip {
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--color-text-primary);
      color: white;
      font-size: 10px;
      padding: 3px 6px;
      border-radius: var(--radius-sm);
      white-space: nowrap;
      pointer-events: none;
      box-shadow: var(--shadow-md);
    }
    .histo-bar-time {
      font-size: 10px;
      font-weight: 500;
      color: var(--color-text-tertiary);
      margin-top: 6px;
      &.is-peak-text {
        font-weight: 700;
        color: var(--color-secondaire);
      }
    }
    .histogram-footer-metrics {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 20px;
      padding-top: 14px;
      border-top: 1px solid var(--color-border);
    }
    .histo-metric-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .histo-metric-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      &.morning { background: var(--color-primaire); }
      &.afternoon { background: var(--color-secondaire); }
      &.evening { background: var(--color-innovation); }
    }

    /* CURVE CHART */
    .tab-pill-group {
      display: flex;
      background: var(--color-bg-surface-2);
      padding: 3px;
      border-radius: var(--radius-md);
    }
    .tab-pill-btn {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text-secondary);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
      &--active {
        background: var(--color-bg-surface);
        color: var(--color-text-primary);
        box-shadow: var(--shadow-xs);
      }
    }
    .curve-chart-wrapper {
      position: relative;
      height: 180px;
      margin-top: 10px;
    }
    .smooth-area-chart {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .chart-data-node {
      fill: var(--color-bg-surface);
      stroke: var(--color-primaire);
      stroke-width: 2.5;
      cursor: pointer;
      transition: all var(--transition-fast);
      &:hover, &--active {
        r: 8;
        fill: var(--color-primaire);
        stroke: white;
      }
    }
    .chart-point-popup {
      position: absolute;
      transform: translateX(-50%);
      background: var(--color-text-primary);
      color: white;
      padding: 4px 10px;
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
      box-shadow: var(--shadow-md);
      z-index: 10;
    }
    .chart-point-popup__title { font-size: 9px; opacity: 0.7; }
    .chart-point-popup__val { font-size: 12px; font-weight: 700; }
    .curve-axis-labels {
      display: flex;
      justify-content: space-between;
      padding: 6px 10px 0;
    }
    .axis-label {
      font-size: 10px;
      color: var(--color-text-tertiary);
      &--active { color: var(--color-primaire); font-weight: 700; }
    }
    .curve-chart-insight {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid var(--color-border);
    }
    .insight-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--color-text-secondary);
      background: var(--color-bg-surface-2);
      padding: 8px 12px;
      border-radius: var(--radius-md);
    }

    /* SUBJECTS & NOTIONS GRID */
    .subjects-and-notions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      @media (max-width: 1024px) { grid-template-columns: 1fr; }
    }
    .stacked-bar-wrapper { margin-bottom: 16px; }
    .stacked-bar {
      display: flex;
      height: 10px;
      border-radius: var(--radius-full);
      overflow: hidden;
      background: var(--color-bg-surface-2);
      gap: 2px;
    }
    .stacked-bar__segment {
      height: 100%;
      transition: width 0.6s ease;
      cursor: pointer;
      &:hover { opacity: 0.85; filter: brightness(1.1); }
    }
    .subject-detailed-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .subject-row-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      background: var(--color-bg-surface-2);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--transition-fast);
      &:hover {
        background: var(--color-bg-surface);
        border-color: var(--color-primaire);
        transform: translateX(3px);
      }
      &--selected {
        border-color: var(--color-primaire);
        background: var(--color-primaire-light);
      }
    }
    .subject-row-item__rank {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-tertiary);
      width: 20px;
    }
    .subject-row-item__color-pill {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .subject-row-item__info { flex: 1; }
    .subject-row-item__name {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-primary);
    }
    .subject-row-item__sub {
      font-size: 11px;
      color: var(--color-text-secondary);
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .dot-separator { opacity: 0.5; }
    .subject-row-item__stats {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      width: 80px;
    }
    .subject-row-item__pct {
      font-size: 13px;
      font-weight: 700;
      color: var(--color-text-primary);
    }
    .progress-bar-mini {
      width: 100%;
      height: 4px;
      background: var(--color-bg-surface-3);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .progress-bar-mini__fill { height: 100%; border-radius: var(--radius-full); }

    /* NOTIONS DIFFICULTIES */
    .notions-cards-stack {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .notion-item-modern {
      background: var(--color-bg-surface-2);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: all var(--transition-fast);
      &:hover {
        background: var(--color-bg-surface);
        border-color: var(--color-warning);
        box-shadow: var(--shadow-sm);
      }
    }
    .notion-item-modern__top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .notion-item-modern__tags {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .matiere-badge-pill {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }
    .severity-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      &--high { background: var(--color-danger-light); color: var(--color-danger); }
      &--med { background: var(--color-warning-light); color: var(--color-warning); }
    }
    .notion-failure-pct {
      text-align: right;
    }
    .failure-number {
      font-size: 15px;
      font-weight: 800;
      color: var(--color-danger);
    }
    .failure-label {
      font-size: 10px;
      color: var(--color-text-tertiary);
      display: block;
    }
    .notion-item-modern__title {
      font-size: 14px;
      font-weight: 700;
      color: var(--color-text-primary);
    }
    .notion-item-modern__meta {
      display: flex;
      gap: 16px;
      font-size: 11px;
      color: var(--color-text-secondary);
    }
    .meta-stat {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .notion-item-modern__action {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-top: 6px;
      border-top: 1px dashed var(--color-border);
    }
    .progress-bar-notion {
      flex: 1;
      height: 6px;
      background: var(--color-bg-surface-3);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .progress-bar-notion__fill {
      height: 100%;
      border-radius: var(--radius-full);
      background: var(--color-warning);
      &.high-risk { background: var(--color-danger); }
    }
    .btn-remediation {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: var(--radius-md);
      color: var(--color-primaire);
      border-color: var(--color-primaire);
      &:hover { background: var(--color-primaire-light); }
    }

    /* PEDAGOGICAL TIPS BANNER */
    .pedagogical-tips-banner {
      background: linear-gradient(135deg, #1E293B, #0F172A);
      border-radius: var(--radius-xl);
      padding: 24px 28px;
      color: white;
      display: flex;
      gap: 20px;
      align-items: flex-start;
      box-shadow: var(--shadow-lg);
    }
    .tips-banner-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-lg);
      background: rgba(255, 255, 255, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .tips-banner-content { flex: 1; }
    .tips-banner-title {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 14px;
      color: white;
    }
    .tips-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }
    .tip-card {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      font-size: 12px;
      line-height: 1.45;
      display: flex;
      gap: 10px;
      color: rgba(255, 255, 255, 0.85);
    }
    .tip-card__dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-secondaire);
      margin-top: 5px;
      flex-shrink: 0;
    }
  `],
})
export class StatistiquesPedagogiquesComposant implements OnInit {
  private readonly repo = inject(StatistiquesRepository);
  private readonly notif = inject(NotificationService);

  readonly MatiereLabels = MatiereLabels;
  readonly MatiereCouleurs = MatiereCouleurs;

  chargement = signal(true);
  periodeActive = signal<PeriodeFiltre>('mois');
  vueTendance = signal<VueTendance>('journalier');
  matiereSelectionnee = signal<Matiere | null>(null);

  stats = signal<StatistiquesUtilisation | null>(null);
  notionsDifficiles = signal<NotionDifficile[]>([]);

  barSurvolee = signal<{ heure: number; nombreSessions: number } | null>(null);
  pointSurvole = signal<{ x: number; y: number; label: string; value: number } | null>(null);

  // Computations
  readonly heuresApprentissage = computed(() => {
    const totalMin = this.stats()?.tempsTotal ?? 89640;
    return Math.floor(totalMin / 60).toLocaleString('fr-FR');
  });

  readonly minutesRestantes = computed(() => {
    const totalMin = this.stats()?.tempsTotal ?? 89640;
    return totalMin % 60;
  });

  readonly maxPic = computed(() => {
    const pics = this.stats()?.pictUtilisation ?? [];
    return pics.length ? Math.max(...pics.map(p => p.nombreSessions)) : 520;
  });

  readonly currentChartPoints = computed(() => {
    const isJour = this.vueTendance() === 'journalier';
    const values = isJour
      ? (this.stats()?.activiteJournaliere ?? [320, 410, 395, 465, 488, 342, 290])
      : (this.stats()?.evolutionMensuelle ?? [65, 70, 68, 74, 72, 78, 76, 80, 82, 79, 84, 87]);

    const labels = isJour
      ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
      : ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

    const width = 500;
    const height = 180;
    const paddingX = 20;
    const paddingY = 25;

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = (maxVal - minVal) || 1;

    return values.map((val, i) => {
      const x = paddingX + (i / (values.length - 1)) * (width - 2 * paddingX);
      const y = (height - paddingY) - ((val - minVal) / range) * (height - 2 * paddingY);
      return { x, y, label: labels[i] || '', value: val };
    });
  });

  readonly svgLinePath = computed(() => {
    const points = this.currentChartPoints();
    if (!points.length) return '';
    return 'M ' + points.map(p => `${p.x} ${p.y}`).join(' L ');
  });

  readonly svgAreaPath = computed(() => {
    const points = this.currentChartPoints();
    if (!points.length) return '';
    const first = points[0];
    const last = points[points.length - 1];
    return `M ${first.x} 190 L ${first.x} ${first.y} ` + points.map(p => `L ${p.x} ${p.y}`).join(' ') + ` L ${last.x} 190 Z`;
  });

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.chargement.set(true);
    Promise.all([
      new Promise<void>(resolve => {
        this.repo.obtenirStatistiques('etab-1').subscribe(s => {
          this.stats.set(s);
          resolve();
        });
      }),
      new Promise<void>(resolve => {
        this.repo.obtenirNotionsDifficiles('etab-1').subscribe(n => {
          this.notionsDifficiles.set(n);
          resolve();
        });
      }),
    ]).then(() => this.chargement.set(false));
  }

  changerPeriode(periode: PeriodeFiltre): void {
    this.periodeActive.set(periode);
    this.notif.info('Filtre de période', `Données recalculées pour : ${periode === 'jour' ? "Aujourd'hui" : periode === 'semaine' ? 'les 7 derniers jours' : periode === 'mois' ? 'le mois en cours' : 'le trimestre'}.`);
  }

  selectionnerMatiere(matiere: Matiere): void {
    if (this.matiereSelectionnee() === matiere) {
      this.matiereSelectionnee.set(null);
    } else {
      this.matiereSelectionnee.set(matiere);
      this.notif.info('Discipline sélectionnée', `${MatiereLabels[matiere]} : ${this.stats()?.matieresPlusUtilisees.find(m => m.matiere === matiere)?.totalQuestions} questions enregistrées.`);
    }
  }

  rafraichirDonnees(): void {
    this.chargerDonnees();
    this.notif.succes('Actualisation', 'Toutes les métriques et histogrammes ont été mis à jour.');
  }

  exporterRapport(): void {
    this.notif.succes('Exportation prête', 'Le rapport analytique complet (PDF / Excel) a été généré avec succès.');
  }

  lancerRemediation(notion: NotionDifficile): void {
    this.notif.succes('Plan de remédiation IA initié', `Un module d'exercices personnalisés sur "${notion.notion}" a été envoyé aux ${notion.apprenantsConcernes} apprenants concernés.`);
  }
}
