
export const options = {
  headerShown: false,
};

import { useRouter } from 'expo-router';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

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
          style={styles.googleButton}
          activeOpacity={0.7}
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