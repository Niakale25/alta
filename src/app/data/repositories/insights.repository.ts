import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  QuestionFrequente,
  TendanceMatiere,
  NotionRenforcer,
  IndiceEngagement,
  TelemetrieSysteme,
} from '../../domain/entites/insights.entite';
import {
  QUESTIONS_FREQUENTES_MOCK,
  TENDANCES_MATIERES_MOCK,
  NOTIONS_RENFORCER_MOCK,
  INDICE_ENGAGEMENT_MOCK,
  TELEMETRIE_SYSTEME_MOCK,
} from '../mock/insights.mock';

@Injectable({ providedIn: 'root' })
export class InsightsRepository {
  obtenirQuestionsFrequentes(): Observable<QuestionFrequente[]> {
    return of(QUESTIONS_FREQUENTES_MOCK).pipe(delay(400));
  }

  obtenirTendancesMatieres(): Observable<TendanceMatiere[]> {
    return of(TENDANCES_MATIERES_MOCK).pipe(delay(350));
  }

  obtenirNotionsRenforcer(): Observable<NotionRenforcer[]> {
    return of(NOTIONS_RENFORCER_MOCK).pipe(delay(450));
  }

  obtenirIndiceEngagement(): Observable<IndiceEngagement> {
    return of(INDICE_ENGAGEMENT_MOCK).pipe(delay(300));
  }

  obtenirTelemetrieSysteme(): Observable<TelemetrieSysteme> {
    return of(TELEMETRIE_SYSTEME_MOCK).pipe(delay(200));
  }
}
