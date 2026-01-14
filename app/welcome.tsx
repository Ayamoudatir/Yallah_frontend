import { useImages } from '@/contexts/ImageContext';
import { auth } from '@/firebase/auth';
import { firebaseApp } from '@/firebase/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResizeMode, Video } from 'expo-av';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getFirestore, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const options = {
  headerShown: false,
};

interface DayInfo {
  month: string;
  day: number;
  fullDate: string;
  isToday: boolean;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string;
}

const db = getFirestore(firebaseApp);

export default function WelcomeScreen() {
  const router = useRouter();
  const { currentAmbience } = useImages();
  const [currentDate, setCurrentDate] = useState('');
  const [weekDays, setWeekDays] = useState<DayInfo[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const loadProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('@yalah_profile_image');
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'image de profil:', error);
    }
  };

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadSelectedDate = async () => {
    try {
      const savedDate = await AsyncStorage.getItem('@yalah_selected_date');
      // Si une date est sauvegardée, l'utiliser, sinon commencer avec aujourd'hui
      if (savedDate) {
        generateCalendar(savedDate, true);
      } else {
        // Commencer avec aujourd'hui et sauvegarder
        const todayStr = getTodayString();
        await AsyncStorage.setItem('@yalah_selected_date', todayStr);
        generateCalendar(todayStr, true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la date sélectionnée:', error);
      // En cas d'erreur, commencer avec aujourd'hui
      const todayStr = getTodayString();
      generateCalendar(todayStr, true);
    }
  };

  const navigateCalendar = (direction: 'prev' | 'next') => {
    if (weekDays.length === 0) return;
    
    // Utiliser la date au centre du calendrier (index 3) comme référence
    const currentCenterDate = weekDays[3]?.fullDate || weekDays[selectedDay]?.fullDate;
    if (!currentCenterDate) return;
    
    const centerDate = new Date(currentCenterDate + 'T00:00:00');
    const offset = direction === 'prev' ? -7 : 7;
    centerDate.setDate(centerDate.getDate() + offset);
    
    // Générer le calendrier autour de la nouvelle date, en gardant la date sélectionnée
    const currentSelectedDate = weekDays[selectedDay]?.fullDate;
    if (currentSelectedDate) {
      generateCalendar(currentSelectedDate, true);
    } else {
      generateCalendar(centerDate.toISOString().split('T')[0], true);
    }
  };

  useEffect(() => {
    init();
    loadProfileImage();
    
    // Écouter les changements d'image de profil seulement
    const interval = setInterval(() => {
      loadProfileImage();
    }, 1000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Écouter les changements de date depuis d'autres pages (todo, profil)
  useEffect(() => {
    const checkDateChange = async () => {
      try {
        const savedDate = await AsyncStorage.getItem('@yalah_selected_date');
        if (savedDate && weekDays.length > 0) {
          const currentSelectedDate = weekDays[selectedDay]?.fullDate;
          if (savedDate !== currentSelectedDate) {
            // La date a changé depuis une autre page, mettre à jour le calendrier
            generateCalendar(savedDate, true);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la date:', error);
      }
    };

    const interval = setInterval(checkDateChange, 500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay, weekDays]);

  useEffect(() => {
    if (auth.currentUser && weekDays.length > 0 && weekDays[selectedDay]) {
      loadTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay, weekDays]);

  const init = async () => {
    try {
      await loadSelectedDate();
      setTimeout(() => setLoading(false), 500);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      generateCalendar();
      setTimeout(() => setLoading(false), 500);
    }
  };

  const generateCalendar = (selectedDateStr?: string, forceCenter?: boolean) => {
    const baseDate = selectedDateStr ? new Date(selectedDateStr + 'T00:00:00') : new Date();
    const todayStr = getTodayString();
    const days: DayInfo[] = [];

    // Si une date est sélectionnée et qu'on veut la centrer, générer autour d'elle
    // Sinon, générer autour de la date actuellement sélectionnée dans le calendrier
    const centerDate = forceCenter && selectedDateStr 
      ? new Date(selectedDateStr + 'T00:00:00')
      : weekDays.length > 0 && weekDays[selectedDay]
        ? new Date(weekDays[selectedDay].fullDate + 'T00:00:00')
        : baseDate;

    for (let i = -3; i <= 3; i++) {
      const date = new Date(centerDate);
      date.setDate(centerDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      days.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        day: date.getDate(),
        fullDate: dateStr,
        isToday: dateStr === todayStr,
      });
    }

    // Trouver l'index de la date sélectionnée
    // Si on force le centre, la date sélectionnée doit être à l'index 3 (centre)
    let targetDate: string;
    if (forceCenter && selectedDateStr) {
      targetDate = selectedDateStr;
    } else if (weekDays.length > 0 && weekDays[selectedDay]) {
      targetDate = weekDays[selectedDay].fullDate;
    } else {
      targetDate = todayStr;
    }
    
    const selectedIndex = days.findIndex(d => d.fullDate === targetDate);
    // Si la date est trouvée, l'utiliser, sinon utiliser l'index 3 (centre) par défaut
    const finalSelectedIndex = selectedIndex >= 0 ? selectedIndex : 3;

    setWeekDays(days);
    setSelectedDay(finalSelectedIndex);
    
    // Mettre à jour la date affichée avec la date sélectionnée dans les nouveaux jours
    const selectedDayInfo = days[finalSelectedIndex];
    if (selectedDayInfo) {
      const displayDate = new Date(selectedDayInfo.fullDate + 'T00:00:00');
      const selectedDateStr = selectedDayInfo.fullDate;
      
      let dateText = '';
      if (selectedDateStr === todayStr) {
        dateText = "Aujourd'hui";
      } else {
        dateText = displayDate.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
      
      setCurrentDate(dateText);
      
      // Sauvegarder la date sélectionnée pour synchroniser avec todo
      AsyncStorage.setItem('@yalah_selected_date', selectedDateStr).catch(error => {
        console.error('Erreur lors de la sauvegarde de la date:', error);
      });
    }
  };

  const loadTasks = () => {
    if (!auth.currentUser || weekDays.length === 0) return;

    const selectedDate = weekDays[selectedDay]?.fullDate;
    if (!selectedDate) return;

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
      setTasks(tasksData.sort((a, b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0)));
    });

    return () => unsubscribe();
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


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E67E50" />
        <Text>Chargement...</Text>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      {/* VIDEO BACKGROUND - Full screen */}
      <View style={styles.videoBackgroundFull}>
        <Video
          key={currentAmbience.id}
          source={currentAmbience.mascot || require('../assets/images/animations/bee-yallah.mp4')}
          style={styles.videoFull}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay
          isMuted
        />
        {/* OVERLAY avec dégradé jaune de haut en bas */}
        <View style={styles.videoOverlay} />
      </View>

      {/* CONTENT */}
      <View style={styles.contentOverlay}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Today&apos;s Tasks</Text>
          <Text style={styles.date}>{currentDate}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/profil')}
          style={styles.profileButton}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileIcon} />
          ) : (
            <View style={styles.profileIconPlaceholder}>
              <Text style={styles.profileIconText}>
                {auth.currentUser?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* DATE PICKER */}
      <View style={styles.calendarWrapper}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateCalendar('prev')}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarContainer}
          style={styles.calendarScroll}
        >
          {weekDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              onPress={async () => {
                const selectedDate = weekDays[index]?.fullDate;
                if (selectedDate) {
                  setSelectedDay(index);
                  // Mettre à jour la date affichée avec le format français
                  const displayDate = new Date(selectedDate + 'T00:00:00');
                  const todayStr = getTodayString();
                  
                  let dateText = '';
                  if (selectedDate === todayStr) {
                    dateText = "Aujourd'hui";
                  } else {
                    dateText = displayDate.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    });
                  }
                  
                  setCurrentDate(dateText);
                  
                  // Sauvegarder la date sélectionnée pour synchroniser avec todo
                  try {
                    await AsyncStorage.setItem('@yalah_selected_date', selectedDate);
                  } catch (error) {
                    console.error('Erreur lors de la sauvegarde de la date:', error);
                  }
                }
              }}
              style={[
                styles.dayCard,
                index === selectedDay && styles.dayCardActive,
              ]}
            >
              <Text
                style={[
                  styles.dayMonth,
                  index === selectedDay && styles.dayActiveText,
                ]}
              >
                {day.month}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  index === selectedDay && styles.dayActiveText,
                ]}
              >
                {day.day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateCalendar('next')}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* TO DO LIST - Directly under dates */}
      <View style={styles.todoSection}>
        <Text style={styles.sectionTitle}>To Do</Text>
        
        {/* TASKS LIST */}
        <ScrollView style={styles.tasksList} contentContainerStyle={styles.tasksListContent}>
          {tasks.length === 0 ? (
            <Text style={styles.emptyText}>No tasks for this day</Text>
          ) : (
            tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
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
            ))
          )}
        </ScrollView>
      </View>

      {/* BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.navItem, styles.navItemActive]}
          onPress={() => router.push('/welcome')}
        >
          <Image
            source={require('../assets/images/icons/main_icons/cabin.png')}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
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
      </View>
    </View>
  );
}

const colors = {
  background: '#FFF8E7',
  primary: '#E67E50',
  secondary: '#7c4a1d',
  text: '#3b2f2f',
  textLight: '#999',
  cardBg: '#f6e1b5',
  white: '#fff',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  videoBackgroundFull: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },

  videoFull: {
    width: '100%',
    height: '100%',
  },

  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 248, 231, 0.75)',
    zIndex: 1,
  },

  contentOverlay: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 100,
    zIndex: 2,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  header: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  headerLeft: {
    flex: 1,
  },

  profileButton: {
    marginTop: 4,
  },

  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.primary,
  },

  profileIconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },

  profileIconText: {
    fontSize: 18,
    color: colors.white,
    fontWeight: 'bold',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },

  date: {
    fontSize: 16,
    color: colors.textLight,
  },

  calendarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },

  navButtonText: {
    fontSize: 24,
    color: colors.secondary,
    fontWeight: 'bold',
  },

  calendarScroll: {
    flex: 1,
  },

  calendarContainer: {
    paddingVertical: 10,
  },

  dayCard: {
    width: 60,
    height: 80,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  dayCardActive: {
    backgroundColor: colors.primary,
  },

  dayMonth: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 4,
  },

  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
  },

  dayActiveText: {
    color: colors.white,
  },

  todoSection: {
    marginTop: 8,
    marginBottom: 0,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },

  tasksList: {
    maxHeight: 300, // 👈 limite la hauteur pour éviter d'être cachée
  },

  tasksListContent: {
    paddingBottom: 20,
  },

  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 14,
    marginTop: 20,
  },

  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxChecked: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },

  taskText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },

  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },


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
});
