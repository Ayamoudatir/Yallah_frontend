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

  const goToLogin = () => {
    router.push('/login');
  };

  return (
    <ImageBackground
      source={require('../../assets/images/page1.jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Image
          source={require('../../assets/images/Todolist.png')}
          style={styles.image}
        />

        <Text style={styles.title}>Yalah!</Text>

        <Text style={styles.subtitle}>
          Note tes idées. Organise ta journée. Koun zen. 💛
        </Text>

        <TouchableOpacity style={styles.button} onPress={goToLogin}>
          <Text style={styles.buttonText}>
            Commencer ma liste maintenant !
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 240,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#78350f',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#92400e',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 999,
  },
  buttonText: {
    color: '#78350f',
    fontSize: 16,
    fontWeight: 'bold',
  },
});