import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Alerte } from '../../domain/entites/alerte.entite';
import { ALERTES_MOCK } from '../mock/alertes.mock';

@Injectable({ providedIn: 'root' })
export class AlerteRepository {
  obtenirAlertesParent(parentId: string): Observable<Alerte[]> {
    return of(ALERTES_MOCK.filter(a => a.parentId === parentId)).pipe(delay(400));
  }

  marquerCommeLue(alerteId: string): Observable<boolean> {
    const alerte = ALERTES_MOCK.find(a => a.id === alerteId);
    if (alerte) alerte.lue = true;
    return of(true).pipe(delay(200));
  }
}
