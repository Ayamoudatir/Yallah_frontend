export const options = {
  headerShown: false,
};

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
import API from './services/api';

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
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
  
    if (cleanPassword !== cleanConfirm) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
  
    try {
      setLoading(true);
  
      await API.post('/auth/register/', {
        email: cleanEmail,
        password: cleanPassword,
      });
  
      // ✅ REDIRECTION PROPRE
      Alert.alert(
        'Succès',
        'Compte créé avec succès',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/welcome'),
          },
        ]
      );
  
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.response?.data?.error || 'Inscription échouée'
      );
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
        <Image source={require('../assets/images/icons/email.png')} style={styles.inputIcon} />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#d6c2a1"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="none"
          autoComplete="off"
        />
      </View>

      {/* PASSWORD */}
      <View style={[styles.inputBox, { bottom: 290 }]}>
        <Image source={require('../assets/images/icons/password.png')} style={styles.inputIcon} />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Create password"
          placeholderTextColor="#d6c2a1"
          style={styles.input}
          secureTextEntry
          textContentType="oneTimeCode"
          autoComplete="off"
        />
      </View>

      {/* CONFIRM */}
      <View style={[styles.inputBox, { bottom: 220 }]}>
        <Image source={require('../assets/images/icons/password.png')} style={styles.inputIcon} />
        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Re-Type Password"
          placeholderTextColor="#d6c2a1"
          style={styles.input}
          secureTextEntry
          textContentType="oneTimeCode"
          autoComplete="off"
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

  /* ===== INPUTS ===== */
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

  /* ===== SIGN UP ===== */
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

  /* ===== GOOGLE ===== */
  googleButton: {
    position: 'absolute',
    bottom: 85,
    alignSelf: 'center',
    width: 60,
    height: 60,
    backgroundColor: '#f6e1b5',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  googleIcon: {
    width: 32,
    height: 32,
  },
});