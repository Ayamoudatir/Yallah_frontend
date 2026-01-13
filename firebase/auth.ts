import { getAuth } from 'firebase/auth';
import { firebaseApp } from './firebaseConfig';

// Pour l'instant, utilisons getAuth simple pour tester la connexion
// On pourra ajouter la persistance AsyncStorage plus tard
export const auth = getAuth(firebaseApp);
console.log('Firebase Auth initialisé:', auth?.app?.name);
