import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
@Injectable({
  providedIn: 'root'
})
export class KeycloakService {

  constructor() { }

  private _keycloak: Keycloak | undefined;

  get keycloak(): Keycloak {
    if (!this._keycloak) {
      this._keycloak = new Keycloak({
        url: 'http://localhost:8080',
        realm: 'SmartExpense',
        clientId: 'smartexpense-web'
      });
    }

    return this._keycloak;
  }

  async init() {
    try {
      await this.keycloak.init({
        onLoad: 'login-required',
        checkLoginIframe: false
      });
    } catch (error) {
      console.error('Failed to initialize Keycloak', error);
    }
  }

  getToken(): string | undefined {
    return this.keycloak.token;
  }

  getUsername(): string | undefined {
    return this.keycloak.tokenParsed?.['preferred_username'];
  }

  isLoggedIn(): boolean {
    return !!this.keycloak.authenticated;
  }

  login(): Promise<void> {
    return this.keycloak.login();
  }

  logout(): Promise<void> {
    return this.keycloak.logout();
  }
}
