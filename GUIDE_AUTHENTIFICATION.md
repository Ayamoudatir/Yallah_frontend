# 📚 GUIDE COMPLET : Authentification Google avec Firebase dans React Native

## 🏗️ ARCHITECTURE GÉNÉRALE

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION REACT NATIVE                 │
│                      (Expo Router)                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   PAGES (index, login, sign_up)       │
        │   - Utilisent expo-auth-session      │
        │   - Appellent handleGoogleAuthResponse│
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   firebase/googleAuth.ts              │
        │   - Reçoit id_token de Google        │
        │   - Crée credential Firebase          │
        │   - Appelle signInWithCredential()    │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   firebase/auth.ts                    │
        │   - Instance Firebase Auth            │
        │   - Utilise firebaseApp               │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   firebase/firebaseConfig.ts          │
        │   - Configuration Firebase            │
        │   - initializeApp()                   │
        └───────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   FIREBASE    │
                    │   (Cloud)     │
                    └───────────────┘
```

---

## 📁 STRUCTURE DES FICHIERS

### 1. **firebase/firebaseConfig.ts** - Configuration Firebase
```typescript
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  // ... autres configs
};

export const firebaseApp = initializeApp(firebaseConfig);
```

**Rôle** : Initialise Firebase avec la configuration du projet
- `initializeApp()` : Crée l'instance Firebase
- `firebaseApp` : Instance exportée utilisée partout

---

### 2. **firebase/auth.ts** - Instance Firebase Auth
```typescript
import { getAuth } from 'firebase/auth';
import { firebaseApp } from './firebaseConfig';

export const auth = getAuth(firebaseApp);
```

**Rôle** : Crée l'instance d'authentification Firebase
- `getAuth(firebaseApp)` : Obtient l'objet `auth` pour gérer l'authentification
- `auth` : Utilisé pour `signInWithCredential()`, `signOut()`, etc.

---

### 3. **firebase/googleAuth.ts** - Intégration Google OAuth
```typescript
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './auth';

export const EXPO_CLIENT_ID = '...'; // ID client OAuth depuis Google Cloud Console

export const handleGoogleAuthResponse = async (response: any) => {
  // 1. Extraire id_token de la réponse Google
  const { id_token } = response.params;
  
  // 2. Créer une credential Firebase avec le token Google
  const credential = GoogleAuthProvider.credential(id_token);
  
  // 3. Connecter l'utilisateur avec Firebase
  const userCredential = await signInWithCredential(auth, credential);
  
  return userCredential;
};
```

**Rôle** : Bridge entre Google OAuth et Firebase Auth
- Reçoit le `id_token` de Google
- Le convertit en credential Firebase
- Connecte l'utilisateur à Firebase

---

### 4. **app/index.tsx** - Page d'accueil
```typescript
import * as Google from 'expo-auth-session/providers/google';
import { EXPO_CLIENT_ID, handleGoogleAuthResponse } from '@/firebase/googleAuth';

// Hook pour l'authentification Google
const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
  iosClientId: EXPO_CLIENT_ID,
  androidClientId: EXPO_CLIENT_ID,
  selectAccount: true,
});

// Quand l'utilisateur clique sur le bouton Google
const signInWithGoogle = async () => {
  await promptAsync(); // Ouvre le navigateur Google
};

// Quand Google répond
useEffect(() => {
  if (response?.type === 'success') {
    handleGoogleAuth(response); // Appelle notre fonction helper
  }
}, [response]);
```

**Rôle** : Page d'accueil avec bouton Google
- Utilise `expo-auth-session/providers/google`
- Ouvre le flux OAuth Google
- Traite la réponse

---

### 5. **app/login.tsx** - Page de connexion
```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/auth';

const login = async () => {
  // Connexion email/password classique
  const cred = await signInWithEmailAndPassword(auth, email, password);
  
  // Sauvegarder l'UID dans AsyncStorage
  await AsyncStorage.setItem('isLoggedIn', cred.user.uid);
  
  // Rediriger vers welcome
  router.replace('/welcome');
};
```

**Rôle** : Connexion email/password + Google
- `signInWithEmailAndPassword()` : Connexion Firebase classique
- Même flux Google que `index.tsx`

---

### 6. **app/sign_up.tsx** - Page d'inscription
```typescript
import { createUserWithEmailAndPassword } from 'firebase/auth';

const signUp = async () => {
  // Créer un compte Firebase
  await createUserWithEmailAndPassword(auth, email, password);
  
  // Rediriger vers welcome
  router.replace('/welcome');
};
```

**Rôle** : Création de compte + Google
- `createUserWithEmailAndPassword()` : Crée un compte Firebase
- Même flux Google que `index.tsx` et `login.tsx`

---

## 🔄 FLUX D'AUTHENTIFICATION GOOGLE

### Étape par étape :

```
1. UTILISATEUR CLIQUE SUR "Continuer avec Google"
   │
   ▼
2. promptAsync() OUVRE LE NAVIGATEUR GOOGLE
   │
   ▼
3. GOOGLE DEMANDE LES PERMISSIONS
   │
   ▼
4. GOOGLE RETOURNE id_token
   │
   ▼
5. response.type === 'success' avec id_token
   │
   ▼
6. handleGoogleAuthResponse() EST APPELÉE
   │
   ▼
7. GoogleAuthProvider.credential(id_token)
   │   → Crée une credential Firebase
   │
   ▼
8. signInWithCredential(auth, credential)
   │   → Connecte l'utilisateur à Firebase
   │
   ▼
9. userCredential.user.uid EST OBTENU
   │
   ▼
10. AsyncStorage.setItem('isLoggedIn', uid)
    │   → Sauvegarde locale
    │
    ▼
11. router.replace('/welcome')
    │   → Redirection vers la page principale
```

---

## 📦 DÉPENDANCES ET IMPORTS

### Packages npm installés :
```json
{
  "firebase": "^12.7.0",                    // SDK Firebase
  "expo-auth-session": "~7.0.10",          // OAuth pour Expo
  "expo-web-browser": "~15.0.10",          // Navigateur pour OAuth
  "@react-native-async-storage/async-storage": "2.2.0"  // Stockage local
}
```

### Imports importants :

#### Dans les pages (index, login, sign_up) :
```typescript
// Pour Google OAuth
import * as Google from 'expo-auth-session/providers/google';

// Pour Firebase Auth
import { auth } from '@/firebase/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Pour notre helper Google
import { EXPO_CLIENT_ID, handleGoogleAuthResponse } from '@/firebase/googleAuth';

// Pour la navigation
import { useRouter } from 'expo-router';

// Pour le stockage local
import AsyncStorage from '@react-native-async-storage/async-storage';
```

#### Dans firebase/googleAuth.ts :
```typescript
// Pour créer la credential Firebase
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

// Pour fermer le navigateur après OAuth
import * as WebBrowser from 'expo-web-browser';
```

---

## 🎯 CONCEPTS REACT NATIVE IMPORTANTS

### 1. **Hooks React**
```typescript
// useState : Gérer l'état local
const [email, setEmail] = useState('');
const [loading, setLoading] = useState(false);

// useEffect : Effets de bord (appels API, abonnements)
useEffect(() => {
  if (response?.type === 'success') {
    handleGoogleAuth(response);
  }
}, [response]); // Se déclenche quand response change
```

### 2. **expo-auth-session/providers/google**
```typescript
// Hook personnalisé qui retourne 3 valeurs
const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
  iosClientId: EXPO_CLIENT_ID,
  androidClientId: EXPO_CLIENT_ID,
  selectAccount: true,
});

// request : État de la requête (null si pas prêt)
// response : Réponse de Google (null, success, ou error)
// promptAsync : Fonction pour ouvrir le navigateur Google
```

### 3. **Firebase Auth**
```typescript
// Connexion email/password
signInWithEmailAndPassword(auth, email, password)

// Connexion avec credential Google
signInWithCredential(auth, credential)

// Création de compte
createUserWithEmailAndPassword(auth, email, password)

// Déconnexion
signOut(auth)

// Utilisateur actuel
auth.currentUser // null si déconnecté, User si connecté
```

### 4. **AsyncStorage** (Stockage local)
```typescript
// Sauvegarder
await AsyncStorage.setItem('isLoggedIn', uid);

// Charger
const uid = await AsyncStorage.getItem('isLoggedIn');

// Supprimer
await AsyncStorage.removeItem('isLoggedIn');
```

### 5. **Expo Router** (Navigation)
```typescript
const router = useRouter();

// Navigation
router.push('/welcome');      // Ajoute à la pile
router.replace('/welcome');  // Remplace la page actuelle
router.back();               // Retour en arrière
```

---

## 🔐 SÉCURITÉ ET CONFIGURATION

### Configuration Google Cloud Console :

1. **Créer un OAuth Client ID** :
   - Type : "Application Web"
   - URI de redirection : `https://auth.expo.io`
   - Obtenir le Client ID (ex: `1051871657630-xxx.apps.googleusercontent.com`)

2. **Configurer Firebase** :
   - Firebase Console > Authentication > Sign-in method
   - Activer "Google"
   - Utiliser le même Client ID

3. **Écran de consentement OAuth** :
   - Mode "Testing" pour développement
   - Mode "Production" pour production
   - Ajouter les utilisateurs de test si en mode Testing

---

## 🐛 GESTION D'ERREURS

### Erreurs Firebase courantes :
```typescript
try {
  await signInWithEmailAndPassword(auth, email, password);
} catch (error: any) {
  if (error.code === 'auth/invalid-email') {
    // Email invalide
  } else if (error.code === 'auth/user-not-found') {
    // Utilisateur introuvable
  } else if (error.code === 'auth/wrong-password') {
    // Mot de passe incorrect
  } else if (error.code === 'auth/network-request-failed') {
    // Problème réseau
  }
}
```

### Erreurs Google OAuth :
```typescript
if (response?.type === 'error') {
  // Erreur OAuth (ex: utilisateur a annulé)
  Alert.alert('Erreur', 'Connexion Google échouée');
}
```

---

## 📝 RÉSUMÉ DES CONNEXIONS

```
index.tsx / login.tsx / sign_up.tsx
    │
    ├─→ Importe Google.useIdTokenAuthRequest
    │   └─→ Ouvre le navigateur Google OAuth
    │
    ├─→ Importe handleGoogleAuthResponse
    │   └─→ Traite la réponse Google
    │       └─→ Utilise GoogleAuthProvider.credential()
    │           └─→ Utilise signInWithCredential()
    │               └─→ Utilise auth (de firebase/auth.ts)
    │                   └─→ Utilise firebaseApp (de firebaseConfig.ts)
    │
    └─→ Importe auth
        └─→ Pour signInWithEmailAndPassword() / createUserWithEmailAndPassword()
            └─→ Utilise firebaseApp
```

---

## ✅ POINTS CLÉS À RETENIR

1. **Firebase Config** → Initialise Firebase
2. **Firebase Auth** → Instance d'authentification
3. **expo-auth-session** → Ouvre le flux Google OAuth
4. **GoogleAuthProvider.credential()** → Convertit id_token en credential Firebase
5. **signInWithCredential()** → Connecte l'utilisateur à Firebase
6. **AsyncStorage** → Sauvegarde locale de l'état de connexion
7. **Expo Router** → Navigation entre les pages

---

## 🎓 QUESTIONS POSSIBLES AU CONTRÔLE

### Q1 : Comment fonctionne l'authentification Google ?
**R** : 
1. L'utilisateur clique sur le bouton Google
2. `promptAsync()` ouvre le navigateur Google
3. Google retourne un `id_token`
4. On convertit ce token en credential Firebase avec `GoogleAuthProvider.credential()`
5. On connecte l'utilisateur avec `signInWithCredential()`

### Q2 : Quelle est la différence entre `signInWithEmailAndPassword` et `signInWithCredential` ?
**R** :
- `signInWithEmailAndPassword` : Connexion directe avec email/password
- `signInWithCredential` : Connexion avec une credential (Google, Facebook, etc.)

### Q3 : Pourquoi utiliser `expo-auth-session` ?
**R** : C'est le package Expo pour gérer OAuth dans React Native. Il gère automatiquement :
- L'ouverture du navigateur
- La réception de la réponse
- La fermeture du navigateur

### Q4 : À quoi sert `AsyncStorage` ?
**R** : Stockage local persistant pour sauvegarder :
- L'état de connexion (`isLoggedIn`)
- L'image de profil
- La date sélectionnée
- Les préférences utilisateur

### Q5 : Comment les pages communiquent entre elles ?
**R** : Via `AsyncStorage` pour partager des données (ex: date sélectionnée) et `Expo Router` pour la navigation.

---

## 🚀 BONNE CHANCE POUR TON CONTRÔLE ! 🎯

