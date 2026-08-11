import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Apprenant } from '../../domain/entites/etablissement.entite';
import { APPRENANTS_MOCK } from '../mock/apprenants.mock';

@Injectable({ providedIn: 'root' })
export class ApprenantRepository {
  private _apprenants = signal<Apprenant[]>(APPRENANTS_MOCK);

  obtenirTous(etablissementId: string): Observable<Apprenant[]> {
    return of(this._apprenants().filter(a => a.etablissementId === etablissementId)).pipe(delay(600));
  }

  obtenirParId(id: string): Observable<Apprenant | undefined> {
    return of(this._apprenants().find(a => a.id === id)).pipe(delay(300));
  }

  rechercher(terme: string): Observable<Apprenant[]> {
    const termeNorm = terme.toLowerCase();
    const resultats = this._apprenants().filter(a =>
      a.nomComplet.toLowerCase().includes(termeNorm) ||
      a.classe.toLowerCase().includes(termeNorm)
    );
    return of(resultats).pipe(delay(200));
  }

  obtenirActifs(): Observable<Apprenant[]> {
    return of(this._apprenants().filter(a => a.actif)).pipe(delay(400));
  }
}
