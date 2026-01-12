// app/services/authService.ts
import API from './api';

class AuthService {
  /**
   * Vérifie si l'utilisateur a une session active
   */
  async initializeAuth(): Promise<boolean> {
    try {
      const res = await API.get('/auth/check-session/');
      return res.data.authenticated === true;
    } catch {
      return false;
    }
  }

  /**
   * Connexion (SESSION DJANGO)
   */
  async login(email: string, password: string): Promise<void> {
    await API.post('/auth/login/', {
      email,
      password,
    });
    // 🔥 Rien à stocker, cookie géré automatiquement
  }

  /**
   * Inscription
   */
  async register(email: string, password: string): Promise<void> {
    await API.post('/auth/register/', {
      email,
      password,
    });
  }

  /**
   * Récupérer l'utilisateur connecté
   */
  async getCurrentUser(): Promise<any> {
    try {
      const res = await API.get('/auth/user/');
      return res.data;
    } catch {
      return null;
    }
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      await API.post('/auth/logout/');
    } catch {}
  }
}

export default new AuthService();