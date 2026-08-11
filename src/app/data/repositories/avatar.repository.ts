import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AvatarPedagogique, VoixPedagogique } from '../../domain/entites/avatar-pedagogique.entite';
import { AVATARS_MOCK, VOIX_MOCK } from '../mock/avatars.mock';

@Injectable({ providedIn: 'root' })
export class AvatarRepository {
  obtenirTousAvatars(): Observable<AvatarPedagogique[]> {
    return of(AVATARS_MOCK).pipe(delay(500));
  }

  obtenirAvatarParId(id: string): Observable<AvatarPedagogique | undefined> {
    return of(AVATARS_MOCK.find(a => a.id === id)).pipe(delay(200));
  }

  obtenirToutesVoix(): Observable<VoixPedagogique[]> {
    return of(VOIX_MOCK).pipe(delay(400));
  }
}
