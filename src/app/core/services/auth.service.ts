import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Utilisateur, SessionUtilisateur } from '../modeles/utilisateur.modele';
import { RoleUtilisateur } from '../enums';
import { ROUTES_APP } from '../constantes/routes.constantes';

const SESSION_KEY = 'alternia_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  private _session = signal<SessionUtilisateur | null>(this.chargerSession());

  readonly utilisateurCourant = computed(() => this._session()?.utilisateur ?? null);
  readonly estConnecte = computed(() => this._session() !== null);
  readonly roleUtilisateur = computed(() => this._session()?.utilisateur?.role ?? null);

  connexion(email: string, _motDePasse: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isEtablissement = email.includes('@ecole') || email.includes('@lycee') || email.includes('@college') || email.includes('@school');
        const role = isEtablissement ? RoleUtilisateur.ADMIN_ECOLE : RoleUtilisateur.PARENT;

        const utilisateur: Utilisateur = {
          id: crypto.randomUUID(),
          email,
          role,
          nomComplet: isEtablissement ? 'Dr. Konaté Moussa' : 'Aïssata Coulibaly',
          avatar: undefined,
          dateCreation: new Date(),
          dernierAcces: new Date(),
          actif: true,
        };

        const session: SessionUtilisateur = {
          utilisateur,
          token: `mock-token-${Date.now()}`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };

        this.sauvegarderSession(session);
        this._session.set(session);
        resolve(true);
      }, 900);
    });
  }

  deconnexion(): void {
    localStorage.removeItem(SESSION_KEY);
    this._session.set(null);
    this.router.navigate([ROUTES_APP.AUTH.CONNEXION]);
  }

  redirectionSelonRole(): void {
    const role = this.roleUtilisateur();
    if (role === RoleUtilisateur.ADMIN_ECOLE) {
      this.router.navigate([ROUTES_APP.ETABLISSEMENT.TABLEAU_DE_BORD]);
    } else if (role === RoleUtilisateur.PARENT) {
      this.router.navigate([ROUTES_APP.PARENT.TABLEAU_DE_BORD]);
    }
  }

  private chargerSession(): SessionUtilisateur | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session: SessionUtilisateur = JSON.parse(raw);
      if (new Date(session.expiresAt) < new Date()) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  private sauvegarderSession(session: SessionUtilisateur): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}
