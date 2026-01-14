import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './auth';

// Nécessaire pour expo-auth-session
WebBrowser.maybeCompleteAuthSession();

// Expo Client ID depuis Firebase Console
// Pour Expo, utilisez expoClientId (pas clientId ni webClientId)
// Pour le trouver : Firebase Console > Authentication > Sign-in method > Google > Web SDK configuration
export const EXPO_CLIENT_ID = '1051871657630-mvkstsh3lokrtbi63bt4lj6bhsq3mlsa.apps.googleusercontent.com';

// Fonction helper pour traiter la réponse Google et connecter avec Firebase
export const handleGoogleAuthResponse = async (response: any) => {
  try {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      
      if (!id_token) {
        throw new Error('Aucun token ID reçu');
      }

      // Créer une credential Firebase avec le token Google
      const credential = GoogleAuthProvider.credential(id_token);
      
      // Connecter l'utilisateur avec Firebase
      const userCredential = await signInWithCredential(auth, credential);
      
      return userCredential;
    } else if (response?.type === 'error') {
      throw new Error(response.error?.message || 'Erreur lors de l\'authentification Google');
    } else {
      throw new Error('Authentification Google annulée');
    }
  } catch (error: any) {
    console.error('Erreur lors de la connexion Google:', error);
    throw error;
  }
};

