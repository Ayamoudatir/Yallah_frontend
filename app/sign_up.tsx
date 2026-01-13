import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { createUserWithEmailAndPassword } from 'firebase/auth';

export const options = {
  headerShown: false,
};

export default function SignUpScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanConfirm = confirm.trim();

    if (!cleanEmail || !cleanPassword || !cleanConfirm) {
      Alert.alert('Erreur', 'Tous les champs sont requis');
      return;
    }

    if (cleanPassword.length < 6) {
      Alert.alert(
        'Erreur',
        'Le mot de passe doit contenir au moins 6 caractères'
      );
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);

      if (!auth) {
        Alert.alert('Erreur', 'Firebase Auth n\'est pas initialisé');
        setLoading(false);
        return;
      }

      console.log('Tentative de création de compte avec:', cleanEmail);
      await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        cleanPassword
      );

      Alert.alert('Succès', 'Compte créé avec succès', [
        {
          text: 'OK',
          onPress: () => router.replace('/welcome'),
        },
      ]);
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      let message = 'Inscription échouée';

      if (error.code === 'auth/email-already-in-use') {
        message = 'Cet email est déjà utilisé';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Email invalide';
      } else if (error.code === 'auth/weak-password') {
        message = 'Mot de passe trop faible';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Erreur de connexion. Vérifiez votre réseau';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'L\'inscription par email/mot de passe n\'est pas activée';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Trop de tentatives. Réessayez plus tard';
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
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      {/* EMAIL */}
      <View style={[styles.inputBox, { bottom: 360 }]}>
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
  keyboardType="email-address"
  textContentType="oneTimeCode"
  autoComplete="off"
  importantForAutofill="no"
/>
      </View>

      {/* PASSWORD */}
      <View style={[styles.inputBox, { bottom: 290 }]}>
        <Image
          source={require('../assets/images/icons/password.png')}
          style={styles.inputIcon}
        />
     <TextInput
  value={password}
  onChangeText={setPassword}
  placeholder="Create password"
  placeholderTextColor="#d6c2a1"
  style={styles.input}
  secureTextEntry
  textContentType="oneTimeCode"
  autoComplete="off"
  importantForAutofill="no"
/>
      </View>

      {/* CONFIRM PASSWORD */}
      <View style={[styles.inputBox, { bottom: 220 }]}>
        <Image
          source={require('../assets/images/icons/password.png')}
          style={styles.inputIcon}
        />
      <TextInput
  value={confirm}
  onChangeText={setConfirm}
  placeholder="Confirm password"
  placeholderTextColor="#d6c2a1"
  style={styles.input}
  secureTextEntry
  textContentType="oneTimeCode"
  autoComplete="off"
  importantForAutofill="no"
/>
      </View>

      <TouchableOpacity
        style={styles.signUpButton}
        onPress={signUp}
        disabled={loading}
      >
        <Text style={styles.signUpText}>
          {loading ? 'Loading...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>
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

  inputBox: {
    position: 'absolute',
    left: 40,
    right: 40,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: '#f6e1b5',
    borderRadius: 30,
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
    backgroundColor: 'transparent',
  },

  signUpButton: {
    position: 'absolute',
    bottom: 150,
    left: 40,
    right: 40,
    height: 60,
    backgroundColor: '#f6e1b5',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  signUpText: {
    fontSize: 20,
    color: '#7c4a1d',
    fontFamily: 'YallahScript',
  },
});