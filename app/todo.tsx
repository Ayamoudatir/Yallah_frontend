import { TodoThemeProvider, useTodoTheme } from '@/contexts/TodoThemeContext';
import { auth } from '@/firebase/auth';
import { firebaseApp } from '@/firebase/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, getFirestore, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export const options = {
  headerShown: false,
};

interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string;
}

interface TasksByDate {
  [date: string]: Task[];
}

const db = getFirestore(firebaseApp);

function TodoScreenContent() {
  const router = useRouter();
  const { currentAmbience, setAmbience, ambiences } = useTodoTheme();
  const [task, setTask] = useState('');
  const [tasksByDate, setTasksByDate] = useState<TasksByDate>({});
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [themePickerVisible, setThemePickerVisible] = useState(false);
  const [displayDate, setDisplayDate] = useState('');
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadSelectedDate();
    // Ne pas réinitialiser automatiquement la date si l'utilisateur navigue
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Écouter les changements de date sélectionnée depuis welcome
  useEffect(() => {
    const checkDateChange = async () => {
      try {
        const savedDate = await AsyncStorage.getItem('@yalah_selected_date');
        if (savedDate && savedDate !== selectedDate) {
          setSelectedDate(savedDate);
          updateDisplayDate(savedDate);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la date:', error);
      }
    };

    const interval = setInterval(checkDateChange, 500);
    return () => clearInterval(interval);
     
  }, [selectedDate]);

  useEffect(() => {
    if (auth.currentUser && selectedDate) {
      loadAllTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const loadSelectedDate = async () => {
    try {
      const savedDate = await AsyncStorage.getItem('@yalah_selected_date');
      if (savedDate) {
        setSelectedDate(savedDate);
        updateDisplayDate(savedDate);
      } else {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        setSelectedDate(todayStr);
        updateDisplayDate(todayStr);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la date sélectionnée:', error);
    }
  };

  const updateDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (dateStr === todayStr) {
      setDisplayDate("Aujourd'hui");
    } else if (dateStr < todayStr) {
      const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        setDisplayDate("Hier");
      } else {
        setDisplayDate(date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }));
      }
    } else {
      const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        setDisplayDate("Demain");
      } else {
        setDisplayDate(date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }));
      }
    }
  };

  const changeDate = (days: number) => {
    const currentDate = new Date(selectedDate + 'T00:00:00');
    currentDate.setDate(currentDate.getDate() + days);
    const newDateStr = currentDate.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
    updateDisplayDate(newDateStr);
  };


  const loadAllTasks = () => {
    if (!auth.currentUser || !selectedDate) return;

    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', auth.currentUser.uid),
      where('date', '==', selectedDate)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData: Task[] = [];
      
      snapshot.forEach((doc) => {
        tasksData.push({
          id: doc.id,
          ...doc.data(),
        } as Task);
      });

      // Trier les tâches (non complétées en premier)
      tasksData.sort((a, b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0));

      // Convertir en format TasksByDate pour l'affichage
      const tasksByDateMap: TasksByDate = {};
      if (tasksData.length > 0) {
        tasksByDateMap[selectedDate] = tasksData;
      }
      setTasksByDate(tasksByDateMap);
    });

    return () => unsubscribe();
  };

  const isPastDate = (dateStr: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr + 'T00:00:00');
    return date < today;
  };

  const addTask = async () => {
    if (task.trim() === '' || !auth.currentUser) return;
    
    // Vérifier si la date est dans le passé
    if (isPastDate(selectedDate)) {
      Alert.alert('Impossible', 'Vous ne pouvez pas ajouter une tâche dans le passé.');
      return;
    }

    try {
      await addDoc(collection(db, 'tasks'), {
        userId: auth.currentUser.uid,
        text: task.trim(),
        completed: false,
        date: selectedDate,
        createdAt: new Date().toISOString(),
      });
    setTask('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la tâche:', error);
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        completed: !completed,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
    }
  };

  const handleThemeChange = async (ambienceId: string) => {
    // Fermer le modal d'abord
    setThemePickerVisible(false);
    
    // Changer le thème immédiatement
    await setAmbience(ambienceId);
    
    // Animation de transition simple et non-bloquante
    fadeAnim.setValue(0.8);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={{ flex: 1 }}>
    <ImageBackground
        key={currentAmbience.id}
        source={currentAmbience.background}
      style={styles.background}
      resizeMode="cover"
    >
      <Animated.View 
        style={{ flex: 1, opacity: fadeAnim }}
    >
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
        <Text style={styles.title}>My To-Do</Text>
          <TouchableOpacity 
            style={styles.dateSelector}
            onPress={() => setDatePickerVisible(true)}
          >
            <Text style={styles.dateText}>📅 {displayDate}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.themeSelectorButton}
          onPress={() => setThemePickerVisible(true)}
        >
          <Image
            source={currentAmbience.preview}
            style={styles.themeSelectorPreview}
            resizeMode="cover"
          />
          {currentAmbience.id !== 'default' && (
            <View style={styles.themeSelectorBadge} />
          )}
        </TouchableOpacity>
      </View>

      {/* ===== INPUT ===== */}
      <View style={styles.inputRow}>
        <TextInput
          value={task}
          onChangeText={setTask}
          placeholder={
            isPastDate(selectedDate)
              ? `Impossible d'ajouter une tâche dans le passé`
              : `Ajouter une tâche pour ${displayDate || "cette date"}...`
          }
          placeholderTextColor="#7c4a1d"
          style={[
            styles.input,
            isPastDate(selectedDate) && styles.inputDisabled,
          ]}
          onSubmitEditing={addTask}
          editable={!isPastDate(selectedDate)}
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            isPastDate(selectedDate) && styles.addButtonDisabled,
          ]}
          onPress={addTask}
          disabled={isPastDate(selectedDate)}
        >
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* ===== LIST ===== */}
      <FlatList
        data={tasksByDate[selectedDate] || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item: task }) => (
          <TouchableOpacity
            style={styles.taskItem}
            onPress={() => toggleTask(task.id, task.completed)}
            onLongPress={() => deleteTask(task.id)}
          >
            <View style={styles.checkbox}>
              {task.completed && <View style={styles.checkboxChecked} />}
          </View>
            <Text
              style={[
                styles.taskText,
                task.completed && styles.taskTextCompleted,
              ]}
            >
              {task.text}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isPastDate(selectedDate)
              ? `Aucune tâche pour le ${displayDate}`
              : `Aucune tâche pour ${displayDate}. Ajoutez-en une ci-dessus !`}
          </Text>
        }
      />

      {/* MODAL SÉLECTEUR DE DATE */}
      <Modal
        visible={datePickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir une date</Text>
              <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateNavigation}>
              <TouchableOpacity 
                style={styles.dateNavButton}
                onPress={() => changeDate(-1)}
              >
                <Text style={styles.dateNavText}>←</Text>
              </TouchableOpacity>
              
              <View style={styles.dateDisplay}>
                <Text style={styles.dateDisplayText}>{displayDate}</Text>
                <TouchableOpacity 
                  style={styles.todayButton}
                  onPress={() => {
                    const today = new Date();
                    const todayStr = today.toISOString().split('T')[0];
                    setSelectedDate(todayStr);
                    updateDisplayDate(todayStr);
                    setDatePickerVisible(false);
                  }}
                >
                  <Text style={styles.todayButtonText}>Aujourd&apos;hui</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.dateNavButton}
                onPress={() => changeDate(1)}
              >
                <Text style={styles.dateNavText}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL SÉLECTEUR DE THÈME */}
      <Modal
        visible={themePickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setThemePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir un thème</Text>
              <TouchableOpacity onPress={() => setThemePickerVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.themeGrid}>
              {ambiences.map((ambience, index) => (
                <TouchableOpacity
                  key={ambience.id}
                  style={[
                    styles.themeCircle,
                    currentAmbience.id === ambience.id && styles.themeCircleActive,
                    index < ambiences.length - 1 && { marginRight: 16 },
                    index >= ambiences.length - 2 && { marginBottom: 16 },
                  ]}
                  onPress={() => handleThemeChange(ambience.id)}
                >
                  <Image
                    source={ambience.preview}
                    style={styles.themeCircleImage}
                    resizeMode="cover"
                  />
                  {currentAmbience.id === ambience.id && (
                    <View style={styles.themeCircleCheck}>
                      <Text style={styles.themeCircleCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== BARRE DU BAS ===== */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/welcome')}
        >
          <Image
            source={require('../assets/images/icons/main_icons/cabin.png')}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, styles.navItemActive]}
          onPress={() => router.push('/todo')}
        >
          <Image
            source={require('../assets/images/icons/main_icons/notebook.png')}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/profil')}
        >
          <Image
            source={require('../assets/images/icons/profile/user.png')}
            style={styles.navIcon}
          />
        </TouchableOpacity>
      </View>
        </Animated.View>
    </ImageBackground>
    </View>
  );
}

export default function TodoScreen() {
  return (
    <TodoThemeProvider>
      <TodoScreenContent />
    </TodoThemeProvider>
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

  inputDisabled: {
    opacity: 0.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
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

  addButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.5,
  },

  addText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 28,
  },

  /* ===== TASK ITEM ===== */
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#7c4a1d',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxChecked: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#7c4a1d',
  },

  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#3b2f2f',
  },

  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },

  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 40,
  },

  dateSection: {
    marginBottom: 24,
  },

  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  dateHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7c4a1d',
  },

  selectedBadge: {
    backgroundColor: '#E67E50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  selectedBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },

  /* ===== BARRE DU BAS ===== */
  bottomBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 64,
    backgroundColor: 'rgba(255, 248, 231, 0.85)',
    borderRadius: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(230, 126, 80, 0.2)',
    shadowColor: '#E67E50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 2,
    backdropFilter: 'blur(10px)',
  },

  navItem: {
    padding: 8,
  },

  navItemActive: {
    backgroundColor: 'rgba(230, 126, 80, 0.15)',
    borderRadius: 20,
    padding: 12,
  },

  navIcon: {
    width: 28,
    height: 28,
    tintColor: '#7c4a1d',
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  dateSelector: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#7c4a1d',
  },

  dateText: {
    fontSize: 14,
    color: '#7c4a1d',
    fontWeight: '600',
  },

  themeSelectorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#7c4a1d',
    position: 'relative',
  },

  themeSelectorPreview: {
    width: '100%',
    height: '100%',
  },

  themeSelectorBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E67E50',
    borderWidth: 2,
    borderColor: '#fff',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: '#FFF8E7',
    borderRadius: 20,
    width: '85%',
    maxHeight: '70%',
    padding: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3b2f2f',
  },

  closeButton: {
    fontSize: 24,
    color: '#3b2f2f',
    fontWeight: 'bold',
  },

  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  dateNavButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f6e1b5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dateNavText: {
    fontSize: 24,
    color: '#7c4a1d',
    fontWeight: 'bold',
  },

  dateDisplay: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },

  dateDisplayText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b2f2f',
    marginBottom: 12,
  },

  todayButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#E67E50',
    borderRadius: 20,
  },

  todayButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  themeGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingVertical: 20,
  },

  themeCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#f6e1b5',
    position: 'relative',
  },

  themeCircleActive: {
    borderColor: '#E67E50',
    borderWidth: 4,
    transform: [{ scale: 1.1 }],
  },

  themeCircleImage: {
    width: '100%',
    height: '100%',
  },

  themeCircleCheck: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E67E50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  themeCircleCheckText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
