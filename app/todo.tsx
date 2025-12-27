import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import API from './services/api';

type Task = {
  id: number;
  title: string;
};

export default function TodoScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState('');

  // 🔹 Charger les tâches
  const fetchTasks = async () => {
    try {
      const response = await API.get('/tasks/');
      setTasks(response.data);
    } catch (e) {
      console.log('GET ERROR', e);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 🔹 Ajouter une tâche
  const addTask = async () => {
    if (text.trim() === '') return;

    try {
      await API.post('/tasks/', {
        title: text,
        completed: false,
      });
      setText('');
      fetchTasks();
    } catch (e) {
      console.log('POST ERROR', e);
    }
  };

  // 🔹 Supprimer une tâche
  const deleteTask = async (id: number) => {
    try {
      await API.delete(`/tasks/${id}/`);
      fetchTasks();
    } catch (e) {
      console.log('DELETE ERROR', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ma Todo List 📝</Text>

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Nouvelle tâche..."
          style={styles.input}
        />

        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.task}>
            <Text style={styles.taskText}>{item.title}</Text>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.delete}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FEF3C7',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#78350f',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#d97706',
    borderRadius: 10,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  task: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  taskText: {
    fontSize: 16,
    color: '#78350f',
  },
  delete: {
    color: '#dc2626',
    fontSize: 18,
    fontWeight: 'bold',
  },
});