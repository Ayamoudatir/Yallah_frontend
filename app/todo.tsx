export const options = {
  headerShown: false,
};

import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Image,
  ImageBackground,
} from 'react-native';

export default function TodoScreen() {
  const router = useRouter();
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState<string[]>([]);

  const addTask = () => {
    if (task.trim() === '') return;
    setTasks([...tasks, task]);
    setTask('');
  };

  return (
    <ImageBackground
      source={require('../assets/images/main-images/todo_page.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>My To-Do</Text>

        <View style={{ width: 28 }} />
      </View>

      {/* ===== INPUT ===== */}
      <View style={styles.inputRow}>
        <TextInput
          value={task}
          onChangeText={setTask}
          placeholder="Add a task..."
          placeholderTextColor="#7c4a1d"
          style={styles.input}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* ===== LIST ===== */}
      <FlatList
        data={tasks}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskText}>{item}</Text>
          </View>
        )}
      />

      {/* ===== BARRE DU BAS ===== */}
      <View style={styles.bottomBar}>
        {/* HOME */}
        <TouchableOpacity onPress={() => router.push('/welcome')}>
          <Image
            source={require('../assets/images/icons/main_icons/cabin.png')}
            style={styles.icon}
          />
        </TouchableOpacity>

        {/* TODO */}
        <TouchableOpacity>
          <Image
            source={require('../assets/images/icons/main_icons/notebook.png')}
            style={styles.icon}
          />
        </TouchableOpacity>

        {/* SETTINGS */}
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Image
            source={require('../assets/images/icons/main_icons/settings.png')}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingHorizontal: 20,
  },

  /* ===== HEADER ===== */
  header: {
    marginTop: 60,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 26,
    color: '#7c4a1d',
    fontFamily: 'YallahScript',
  },

  back: {
    fontSize: 28,
    color: '#7c4a1d',
  },

  /* ===== INPUT ===== */
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    height: 48,
    color: '#3b2f2f',
  },

  addButton: {
    marginLeft: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7c4a1d',
    justifyContent: 'center',
    alignItems: 'center',
  },

  addText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 28,
  },

  /* ===== TASK ITEM ===== */
  taskItem: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },

  taskText: {
    fontSize: 16,
    color: '#3b2f2f',
  },

  /* ===== BARRE DU BAS ===== */
  bottomBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  icon: {
    width: 28,
    height: 28,
    tintColor: '#3b2f2f',
  },
});