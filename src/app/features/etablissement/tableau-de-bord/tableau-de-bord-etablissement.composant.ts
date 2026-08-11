import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatistiquesRepository } from '../../../data/repositories/statistiques.repository';
import { ApprenantRepository } from '../../../data/repositories/apprenant.repository';
import { BoitierRepository } from '../../../data/repositories/boitier.repository';
import { StatistiquesUtilisation, NotionDifficile } from '../../../domain/entites/statistiques-utilisation.entite';
import { Apprenant } from '../../../domain/entites/etablissement.entite';
import { Boitier } from '../../../domain/entites/boitier.entite';
import { StatutBoitier, Matiere, MatiereLabels, MatiereCouleurs } from '../../../core/enums';

import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-tableau-de-bord-etablissement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tableau-de-bord-etablissement.composant.html',
  styleUrl: './tableau-de-bord-etablissement.composant.scss',
})
export class TableauDeBordEtablissementComposant implements OnInit {
  private readonly statsRepo = inject(StatistiquesRepository);
  private readonly apprenantRepo = inject(ApprenantRepository);
  private readonly boitierRepo = inject(BoitierRepository);
  private readonly router = inject(Router);
  private readonly notifService = inject(NotificationService);

  readonly MatiereLabels = MatiereLabels;
  readonly MatiereCouleurs = MatiereCouleurs;
  readonly StatutBoitier = StatutBoitier;

  chargement = signal(true);
  stats = signal<StatistiquesUtilisation | null>(null);
  apprenants = signal<Apprenant[]>([]);
  boitiers = signal<Boitier[]>([]);
  periodeActive = signal<'7j' | '30j'>('7j');

  readonly apprenantActifs = computed(() => this.apprenants().filter(a => a.actif).length);
  readonly boitiersEnLigne = computed(() => this.boitiers().filter(b => b.statut === StatutBoitier.EN_LIGNE_CLOUD).length);
  readonly boitiersHorsLigne = computed(() => this.boitiers().filter(b => b.statut === StatutBoitier.HORS_LIGNE_LOCAL).length);
  readonly boitiersDeconnectes = computed(() => this.boitiers().filter(b => b.statut === StatutBoitier.DECONNECTE).length);

  readonly tempsFormatte = computed(() => {
    const minutes = this.stats()?.tempsTotal ?? 0;
    const heures = Math.floor(minutes / 60);
    return `${heures.toLocaleString('fr-FR')}h`;
  });

  ngOnInit(): void {
    Promise.all([
      new Promise<void>(resolve => {
        this.statsRepo.obtenirStatistiques('etab-1').subscribe(s => {
          this.stats.set(s);
          resolve();
        });
      }),
      new Promise<void>(resolve => {
        this.apprenantRepo.obtenirTous('etab-1').subscribe(a => {
          this.apprenants.set(a);
          resolve();
        });
      }),
      new Promise<void>(resolve => {
        this.boitierRepo.obtenirBoitiersEtablissement('etab-1').subscribe(b => {
          this.boitiers.set(b);
          resolve();
        });
      }),
    ]).then(() => this.chargement.set(false));
  }

  formatterMinutes(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h${m > 0 ? m + 'min' : ''}` : `${m}min`;
  }

  getStatutLabel(statut: StatutBoitier): string {
    const labels = {
      [StatutBoitier.EN_LIGNE_CLOUD]: 'En ligne',
      [StatutBoitier.HORS_LIGNE_LOCAL]: 'Hors ligne',
      [StatutBoitier.DECONNECTE]: 'Déconnecté',
    };
    return labels[statut];
  }

  getStatutClass(statut: StatutBoitier): string {
    const classes = {
      [StatutBoitier.EN_LIGNE_CLOUD]: 'online',
      [StatutBoitier.HORS_LIGNE_LOCAL]: 'warning',
      [StatutBoitier.DECONNECTE]: 'danger',
    };
    return classes[statut];
  }

  getBarHeight(value: number, max: number): number {
    return Math.max(4, (value / max) * 100);
  }

  getMaxActivite(): number {
    const data = this.stats()?.activiteJournaliere ?? [0];
    return Math.max(...data);
  }

  getMaxHebdo(): number {
    const data = this.stats()?.activiteHebdomadaire ?? [0];
    return Math.max(...data);
  }

  readonly joursSemaine = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  readonly semainesHebdo = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];

  generateLinePath(data: number[]): string {
    if (!data.length) return '';
    const max = Math.max(...data);
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * 400;
      const y = 180 - (v / max) * 160;
      return `${x},${y}`;
    });
    return 'M' + points.join(' L');
  }

  generateAreaPath(data: number[]): string {
    if (!data.length) return '';
    const max = Math.max(...data);
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * 400;
      const y = 180 - (v / max) * 160;
      return `${x},${y}`;
    });
    return `M0,180 L${points.join(' L')} L400,180 Z`;
  }

  exporterStats(): void {
    const csvContent = "Matière,TotalQuestions,TempsTotalMinutes\n" +
      (this.stats()?.matieresPlusUtilisees.map(m => `"${MatiereLabels[m.matiere]}",${m.totalQuestions},${m.tempsTotal}`).join('\n') || '');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `statistiques_etablissement_mali_${Date.now()}.csv`;
    link.click();

    this.notifService.succes('Exportation réussie', 'Les statistiques de l\'établissement ont été exportées en CSV.');
  }

  genererRapport(): void {
    this.router.navigate(['/etablissement/rapports']);
    this.notifService.info('Redirection', 'Accès à la page de génération de rapports.');
  }

  setPeriode(p: '7j' | '30j'): void {
    this.periodeActive.set(p);
    this.notifService.info('Période mise à jour', `Vue d'activité sur ${p}.`);
  }
}
