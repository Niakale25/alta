import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { StatistiquesUtilisation, NotionDifficile, RapportActivite } from '../../domain/entites/statistiques-utilisation.entite';
import { STATISTIQUES_MOCK, NOTIONS_DIFFICILES_MOCK, RAPPORTS_MOCK } from '../mock/statistiques.mock';

@Injectable({ providedIn: 'root' })
export class StatistiquesRepository {
  obtenirStatistiques(_etablissementId: string): Observable<StatistiquesUtilisation> {
    return of(STATISTIQUES_MOCK).pipe(delay(800));
  }

  obtenirNotionsDifficiles(_etablissementId: string): Observable<NotionDifficile[]> {
    return of(NOTIONS_DIFFICILES_MOCK).pipe(delay(600));
  }

  obtenirRapports(_etablissementId: string): Observable<RapportActivite[]> {
    return of(RAPPORTS_MOCK).pipe(delay(500));
  }
}
