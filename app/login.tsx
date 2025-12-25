import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();

  const login = async () => {
    await AsyncStorage.setItem('isLoggedIn', 'true');
    router.replace('/todo'); // 🔥 direction todo
  };

  
  return (
    <ImageBackground
      source={require('../assets/images/page1.jpg')}
      style={styles.background}
    >
      <BlurView intensity={60} tint="light" style={styles.card}>
        <Text style={styles.title}>Login</Text>

        <TextInput placeholder="Email" style={styles.input} />
        <TextInput placeholder="Password" secureTextEntry style={styles.input} />

        <TouchableOpacity style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </BlurView>

      <Image
        source={require('../assets/images/salut1.png')}
        style={styles.character}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    width: '90%',
    maxWidth: 350,
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#d97706',
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  character: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 100,
    height: 100,
  },
});