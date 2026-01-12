export const options = {
    headerShown: false,
  };
  
  import { useRouter } from 'expo-router';
  import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
  
  export default function SettingsScreen() {
    const router = useRouter();
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
  
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fddd8a',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      color: '#7c4a1d',
      marginBottom: 20,
      fontFamily: 'YallahScript',
    },
    back: {
      fontSize: 20,
      color: '#7c4a1d',
      textDecorationLine: 'underline',
    },
  });