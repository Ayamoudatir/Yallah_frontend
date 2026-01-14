import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { auth } from '@/firebase/auth';
import { EXPO_CLIENT_ID, handleGoogleAuthResponse } from '@/firebase/googleAuth';
import { signInWithEmailAndPassword } from 'firebase/auth';

export const options = {
  headerShown: false,
};

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: EXPO_CLIENT_ID,
    androidClientId: EXPO_CLIENT_ID,
    selectAccount: true,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleLogin(response);
    } else if (response?.type === 'error') {
      setGoogleLoading(false);
      Alert.alert('Erreur', 'Connexion Google échouée');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const handleGoogleLogin = async (authResponse: any) => {
    try {
      setGoogleLoading(true);
      const userCredential = await handleGoogleAuthResponse(authResponse);
      await AsyncStorage.setItem('isLoggedIn', userCredential.user.uid);
      router.replace('/welcome');
    } catch (error: any) {
      console.error('Erreur lors de la connexion Google:', error);
      let message = 'Connexion Google échouée';
      if (error.message) {
        message = error.message;
      }
      Alert.alert('Erreur', message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setGoogleLoading(true);
      await promptAsync();
    } catch (error: any) {
      console.error('Erreur lors du lancement de la connexion Google:', error);
      setGoogleLoading(false);
      Alert.alert('Erreur', 'Impossible de lancer la connexion Google');
    }
  };

  const login = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      Alert.alert('Erreur', 'Email et mot de passe sont requis');
      return;
    }

    try {
      setLoading(true);

      const cred = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        cleanPassword
      );

      // On garde le flag local pour la navigation interne
      await AsyncStorage.setItem('isLoggedIn', cred.user.uid);
      router.replace('/welcome');
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      console.error('Code d\'erreur:', error.code);
      console.error('Message d\'erreur:', error.message);
      let message = 'Connexion échouée';

      if (error.code === 'auth/invalid-email') {
        message = 'Email invalide';
      } else if (error.code === 'auth/user-not-found') {
        message = 'Utilisateur introuvable';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Mot de passe incorrect';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Trop de tentatives. Réessayez plus tard';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Erreur de connexion réseau.\n\nVérifiez que :\n• Votre connexion internet fonctionne\n• Vous n\'êtes pas derrière un VPN/Proxy\n• Le simulateur a accès au réseau';
      } else if (error.code === 'auth/invalid-credential') {
        message = 'Email ou mot de passe incorrect';
      } else if (error.message) {
        message = error.message;
      } else if (error.code) {
        message = `Erreur: ${error.code}`;
      }

      Alert.alert('Erreur', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/main-images/inscriptionpage.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* 🔙 RETOUR */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      {/* ===== CARD CONTENT ===== */}
      <View style={styles.cardContent}>
        {/* EMAIL */}
        <View style={styles.inputBox}>
          <Image
            source={require('../assets/images/icons/email.png')}
            style={styles.inputIcon}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#d6c2a1"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            autoComplete="email"
            importantForAutofill="no"
          />
        </View>

        {/* PASSWORD */}
        <View style={styles.inputBox}>
          <Image
            source={require('../assets/images/icons/password.png')}
            style={styles.inputIcon}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#d6c2a1"
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
            autoComplete="password"
            importantForAutofill="no"
          />
        </View>

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={login}
          disabled={loading}
        >
          <Text style={styles.loginText}>{loading ? 'Loading...' : 'Login'}</Text>
        </TouchableOpacity>

        {/* GOOGLE */}
        <TouchableOpacity
          style={[styles.googleButton, (googleLoading || !request) && styles.googleButtonDisabled]}
          onPress={signInWithGoogle}
          disabled={googleLoading || !request}
        >
          <Image
            source={require('../assets/images/icons/gmail.png')}
            style={styles.googleIcon}
          />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },

  backText: {
    fontSize: 28,
    color: '#7c4a1d',
  },

  /* ===== CENTERED CARD CONTENT ===== */
  cardContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 120,
    alignItems: 'center',
  },

  /* ===== INPUTS ===== */
  inputBox: {
    width: '80%',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: '#f6e1b5',
    borderRadius: 30,
    marginBottom: 20,
  },

  inputIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
    tintColor: '#f6e1b5',
  },

  input: {
    flex: 1,
    color: '#f6e1b5',
    fontSize: 16,
    fontFamily: 'YallahScript',
  },

  /* ===== LOGIN BUTTON ===== */
  loginButton: {
    width: '80%',
    height: 60,
    backgroundColor: '#f6e1b5',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  loginText: {
    fontSize: 20,
    color: '#7c4a1d',
    fontFamily: 'YallahScript',
  },

  /* ===== GOOGLE ===== */
  googleButton: {
    marginTop: 24,
    width: 60,
    height: 60,
    backgroundColor: '#f6e1b5',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  googleButtonDisabled: {
    opacity: 0.5,
  },

  googleIcon: {
    width: 32,
    height: 32,
  },
});