export const options = {
  headerShown: false,
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();

  const login = async () => {
    await AsyncStorage.setItem('isLoggedIn', 'true');
    router.replace('/welcome');
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
            placeholder="Email"
            placeholderTextColor="#d6c2a1"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="none"
            autoComplete="off"
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
            placeholder="Password"
            placeholderTextColor="#d6c2a1"
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="none"
            autoComplete="off"
            importantForAutofill="no"
          />
        </View>

        {/* LOGIN BUTTON */}
        <TouchableOpacity style={styles.loginButton} onPress={login}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        {/* GOOGLE */}
        <TouchableOpacity style={styles.googleButton}>
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

  googleIcon: {
    width: 32,
    height: 32,
  },
});