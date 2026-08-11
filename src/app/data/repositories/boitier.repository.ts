import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Boitier } from '../../domain/entites/boitier.entite';
import { BOITIERS_MOCK } from '../mock/boitiers.mock';

@Injectable({ providedIn: 'root' })
export class BoitierRepository {
  obtenirBoitierParEnfant(enfantId: string): Observable<Boitier | undefined> {
    return of(BOITIERS_MOCK.find(b => b.enfantId === enfantId)).pipe(delay(400));
  }

  obtenirBoitiersEtablissement(etablissementId: string): Observable<Boitier[]> {
    return of(BOITIERS_MOCK.filter(b => b.etablissementId === etablissementId)).pipe(delay(600));
  }

  obtenirBoitierParId(id: string): Observable<Boitier | undefined> {
    return of(BOITIERS_MOCK.find(b => b.id === id)).pipe(delay(300));
  }
}
