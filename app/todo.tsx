import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';

export default function TodoScreen() {
  const [tasks, setTasks] = useState<{ id: string; title: string }[]>([]);
  const [text, setText] = useState('');

  const addTask = () => {
    if (!text.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), title: text }]);
    setText('');
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ma Todo List 📝</Text>

      {/* Input + Add */}
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

      {/* Liste */}
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },

  addButton: {
    marginLeft: 10,
    backgroundColor: '#d97706',
    borderRadius: 10,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addText: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },

  task: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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