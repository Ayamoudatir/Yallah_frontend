import { getAuth } from 'firebase/auth';
import { firebaseApp } from './firebaseConfig';

// Pour l'instant, utilisons getAuth simple pour tester la connexion
// On pourra ajouter la persistance AsyncStorage plus tard
const auth = getAuth(firebaseApp);

// Vérification de l'initialisation
if (!auth) {
  console.error('❌ Firebase Auth n\'a pas pu être initialisé');
} else {
  console.log('✅ Firebase Auth initialisé:', auth?.app?.name);
  console.log('✅ Auth domain:', auth?.config?.authDomain);
}

export { auth };
