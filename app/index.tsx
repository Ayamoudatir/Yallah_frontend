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
  TouchableOpacity,
  View,
} from 'react-native';

import { EXPO_CLIENT_ID, handleGoogleAuthResponse } from '@/firebase/googleAuth';

export const options = {
  headerShown: false,
};

export default function HomeScreen() {
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: EXPO_CLIENT_ID,
    androidClientId: EXPO_CLIENT_ID,
    selectAccount: true,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleAuth(response);
    } else if (response?.type === 'error') {
      setGoogleLoading(false);
      Alert.alert('Erreur', 'Connexion Google échouée');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const handleGoogleAuth = async (authResponse: any) => {
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

  return (
    <ImageBackground
      source={require('../assets/images/main-images/yallah-image.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* SIGN UP */}
        <TouchableOpacity
          style={styles.signUpButton}
          activeOpacity={0.7}
          onPress={() => router.push('/sign_up')}
        >
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>

        {/* GOOGLE */}
        <TouchableOpacity 
          style={[styles.googleButton, (googleLoading || !request) && styles.googleButtonDisabled]}
          activeOpacity={0.7}
          onPress={signInWithGoogle}
          disabled={googleLoading || !request}
        >
          <Image
            source={require('../assets/images/icons/gmail.png')}
            style={styles.googleIcon}
          />
          <Text style={styles.googleText}>Continuer avec Google</Text>
        </TouchableOpacity>

        {/* LOGIN */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            I already have an account{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  overlay: {
    paddingBottom: 60,
    paddingHorizontal: 30,
    alignItems: 'center',
  },

  signUpButton: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#7c4a1d',
    borderRadius: 40,
    paddingVertical: 14,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },

  signUpText: {
    textAlign: 'center',
    fontSize: 20,
    color: '#7c4a1d',
    fontFamily: 'YallahScript',
  },

  googleButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6d88b',
    borderRadius: 40,
    paddingVertical: 14,
    marginBottom: 18,
  },

  googleButtonDisabled: {
    opacity: 0.5,
  },

  googleIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
  },

  googleText: {
    fontSize: 18,
    color: '#7c4a1d',
    fontFamily: 'YallahScript',
  },

  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  loginText: {
    fontSize: 16,
    color: '#7c4a1d',
    fontFamily: 'YallahScript',
  },

  loginLink: {
    fontSize: 16,
    color: '#7c4a1d',
    fontFamily: 'YallahScript',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});