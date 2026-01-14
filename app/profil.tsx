import { useImages } from '@/contexts/ImageContext';
import { auth } from '@/firebase/auth';
import { firebaseApp } from '@/firebase/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResizeMode, Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { collection, getDocs, getFirestore, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export const options = {
  headerShown: false,
};

const db = getFirestore(firebaseApp);
const PROFILE_IMAGE_KEY = '@yalah_profile_image';
const SELECTED_DATE_KEY = '@yalah_selected_date';

export default function ProfilScreen() {
  const router = useRouter();
  const { currentAmbience } = useImages();
  const [userEmail, setUserEmail] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [completedTasksThisWeek, setCompletedTasksThisWeek] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasksByDate, setTasksByDate] = useState<Record<string, { completed: number; pending: number }>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const unsubscribeTasksRef = useRef<(() => void) | null>(null);

  // Helpers pour éviter les décalages de date (UTC)
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTodayString = () => formatLocalDate(new Date());

  useEffect(() => {
    loadUserData();
    loadWeeklyStats();
    loadAllTasks();
    loadSelectedDate();
  }, []);

  const loadSelectedDate = async () => {
    try {
      const savedDate = await AsyncStorage.getItem(SELECTED_DATE_KEY);
      setSelectedDate(savedDate);
      // Si une date est sélectionnée, ouvrir le calendrier sur ce mois
      if (savedDate) {
        const date = new Date(savedDate + 'T00:00:00');
        setCurrentMonth(date);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la date sélectionnée:', error);
    }
  };

  useEffect(() => {
    // Nettoyer l'abonnement précédent
    if (unsubscribeTasksRef.current) {
      unsubscribeTasksRef.current();
      unsubscribeTasksRef.current = null;
    }

    if (calendarVisible) {
      loadAllTasks();
    }

    // Nettoyage au démontage
    return () => {
      if (unsubscribeTasksRef.current) {
        unsubscribeTasksRef.current();
        unsubscribeTasksRef.current = null;
      }
    };
  }, [calendarVisible]);

  const loadUserData = async () => {
    if (auth.currentUser) {
      setUserEmail(auth.currentUser.email || '');
      const savedImage = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
      if (savedImage) {
        setProfileImage(savedImage);
      }
    }
    setLoading(false);
  };

  const loadWeeklyStats = async () => {
    if (!auth.currentUser) return;

    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('userId', '==', auth.currentUser.uid),
        where('completed', '==', true)
      );

      const snapshot = await getDocs(q);
      let completedCount = 0;

      snapshot.forEach((doc) => {
        const task = doc.data();
        if (task.date) {
          const taskDate = new Date(task.date + 'T00:00:00');
          if (taskDate >= startOfWeek && taskDate < endOfWeek && task.completed) {
            completedCount++;
          }
        }
      });

      setCompletedTasksThisWeek(completedCount);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const loadAllTasks = () => {
    if (!auth.currentUser) return;

    // Nettoyer l'abonnement précédent
    if (unsubscribeTasksRef.current) {
      unsubscribeTasksRef.current();
      unsubscribeTasksRef.current = null;
    }

    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('userId', '==', auth.currentUser.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasksByDateMap: Record<string, { completed: number; pending: number }> = {};

        snapshot.forEach((doc) => {
          const task = doc.data();
          if (task.date) {
            const dateKey = task.date;
            if (!tasksByDateMap[dateKey]) {
              tasksByDateMap[dateKey] = { completed: 0, pending: 0 };
            }
            if (task.completed) {
              tasksByDateMap[dateKey].completed++;
            } else {
              tasksByDateMap[dateKey].pending++;
            }
          }
        });

        setTasksByDate(tasksByDateMap);
      },
      (error) => {
        console.error('Erreur lors du chargement des tâches:', error);
      }
    );

    unsubscribeTasksRef.current = unsubscribe;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de l\'accès à vos photos pour changer votre image de profil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      await AsyncStorage.setItem(PROFILE_IMAGE_KEY, imageUri);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!auth) {
                Alert.alert('Erreur', 'Firebase Auth n\'est pas initialisé');
                return;
              }
              
              // On garde les données locales (image de profil, date sélectionnée, thèmes, etc.)
              // pour que l'état visuel de l'app reste sauvegardé même après déconnexion.
              await signOut(auth);
              await AsyncStorage.removeItem('isLoggedIn');
              router.replace('/');
            } catch (error: any) {
              console.error('Erreur lors de la déconnexion:', error);
              let message = 'Impossible de se déconnecter';
              
              if (error.code === 'auth/network-request-failed') {
                message = 'Erreur de connexion réseau. Vérifiez votre connexion internet.';
              } else if (error.message) {
                message = error.message;
              } else if (error.code) {
                message = `Erreur: ${error.code}`;
              }
              
              Alert.alert('Erreur', message);
            }
          },
        },
      ]
    );
  };

  const getEncouragementMessage = () => {
    if (completedTasksThisWeek === 0) {
      return 'Commencez votre semaine en douceur ! 🌱';
    } else if (completedTasksThisWeek < 5) {
      return `Bravo ! ${completedTasksThisWeek} tâche${completedTasksThisWeek > 1 ? 's' : ''} complétée${completedTasksThisWeek > 1 ? 's' : ''} cette semaine ! 💪`;
    } else if (completedTasksThisWeek < 10) {
      return `Excellent travail ! ${completedTasksThisWeek} tâches complétées cette semaine ! ⭐`;
    } else {
      return `Incroyable ! ${completedTasksThisWeek} tâches complétées cette semaine ! Vous êtes sur le feu ! 🔥`;
    }
  };

  const handleDateSelect = async (dateKey: string) => {
    try {
      await AsyncStorage.setItem(SELECTED_DATE_KEY, dateKey);
      setSelectedDate(dateKey);
      setCalendarVisible(false);
      Alert.alert(
        'Date sélectionnée',
        `La date ${new Date(dateKey + 'T00:00:00').toLocaleDateString('fr-FR')} a été sélectionnée. Le dashboard et la liste des tâches seront mis à jour.`,
        [
          {
            text: 'Voir le dashboard',
            onPress: () => {
              router.push('/welcome');
            },
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la date:', error);
    }
  };

  const resetToToday = async () => {
    try {
      await AsyncStorage.removeItem(SELECTED_DATE_KEY);
      setSelectedDate(null);
      setCalendarVisible(false);
      Alert.alert(
        'Date réinitialisée',
        'La date a été réinitialisée à aujourd\'hui.',
        [
          {
            text: 'Voir le dashboard',
            onPress: () => {
              router.push('/welcome');
            },
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la réinitialisation de la date:', error);
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Dimanche, 1 = Lundi, etc.

    const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const todayStr = getTodayString();

    const days = [];
    
    // Jours du mois précédent (pour remplir la première semaine)
    if (startingDayOfWeek > 0) {
      const prevMonth = new Date(year, month, 0);
      const daysInPrevMonth = prevMonth.getDate();
      // Commencer à partir du dernier jour du mois précédent et remonter
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const date = new Date(year, month - 1, day);
        days.push({ date, isCurrentMonth: false });
      }
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Jours du mois suivant pour compléter la grille (6 semaines = 42 jours)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }

    const getDateKey = (date: Date) => formatLocalDate(date);

    const getDateStatus = (date: Date) => {
      const dateKey = getDateKey(date);
      const tasks = tasksByDate[dateKey];
      if (!tasks) return null;
      if (tasks.pending > 0 && tasks.completed > 0) return 'mixed';
      if (tasks.pending > 0) return 'pending';
      if (tasks.completed > 0) return 'completed';
      return null;
    };

    return (
      <View>
        {/* En-têtes des jours */}
        <View style={styles.calendarHeader}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.weekDayHeader}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Grille du calendrier */}
        <View style={styles.calendarGrid}>
          {days.map((dayInfo, index) => {
            const dateKey = getDateKey(dayInfo.date);
            const isToday = dateKey === todayStr;
            const isSelected = dateKey === selectedDate;
            const status = dayInfo.isCurrentMonth ? getDateStatus(dayInfo.date) : null;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  !dayInfo.isCurrentMonth && styles.calendarDayOtherMonth,
                  isToday && styles.calendarDayToday,
                  isSelected && styles.calendarDaySelected,
                ]}
                onPress={() => {
                  if (dayInfo.isCurrentMonth) {
                    const dateKey = getDateKey(dayInfo.date);
                    handleDateSelect(dateKey);
                  }
                }}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    !dayInfo.isCurrentMonth && styles.calendarDayTextOtherMonth,
                    isToday && styles.calendarDayTextToday,
                    isSelected && styles.calendarDayTextSelected,
                  ]}
                >
                  {dayInfo.date.getDate()}
                </Text>
                {status && (
                  <View
                    style={[
                      styles.dateIndicator,
                      status === 'pending' && styles.dateIndicatorPending,
                      status === 'completed' && styles.dateIndicatorCompleted,
                      status === 'mixed' && styles.dateIndicatorMixed,
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Navigation */}
        <View style={styles.calendarNavigation}>
          <TouchableOpacity
            onPress={() => {
              const newDate = new Date(currentMonth);
              newDate.setMonth(newDate.getMonth() - 1);
              setCurrentMonth(newDate);
            }}
            style={styles.navButton}
          >
            <Text style={styles.navButtonText}>‹ Précédent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setCurrentMonth(new Date());
              resetToToday();
            }}
            style={styles.navButton}
          >
            <Text style={styles.navButtonText}>Aujourd&apos;hui</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const newDate = new Date(currentMonth);
              newDate.setMonth(newDate.getMonth() + 1);
              setCurrentMonth(newDate);
            }}
            style={styles.navButton}
          >
            <Text style={styles.navButtonText}>Suivant ›</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
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
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Profil</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* PROFILE IMAGE SECTION */}
          <View style={styles.profileImageSection}>
            <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Image
                    source={require('../assets/images/icons/profile/user.png')}
                    style={styles.profileIconLarge}
                  />
                </View>
              )}
              <View style={styles.editBadge}>
                <Image
                  source={require('../assets/images/icons/profile/user.png')}
                  style={styles.editIcon}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.profileName}>{userEmail.split('@')[0] || 'Utilisateur'}</Text>
            <Text style={styles.profileEmail}>{userEmail}</Text>
          </View>

          {/* SECTION CALENDRIER */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                await loadSelectedDate();
                setCalendarVisible(true);
              }}
            >
              <View style={styles.menuItemLeft}>
                <Image
                  source={require('../assets/images/icons/profile/calendar.png')}
                  style={styles.menuIcon}
                />
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemTitle}>Calendrier</Text>
                  <Text style={styles.menuItemSubtitle}>Consultez vos tâches par date</Text>
                </View>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* SECTION STATISTIQUES */}
          <View style={styles.section}>
            <View style={styles.statsCard}>
              <Text style={styles.statsNumber}>{completedTasksThisWeek}</Text>
              <Text style={styles.statsLabel}>Tâches complétées cette semaine</Text>
              <Text style={styles.encouragement}>{getEncouragementMessage()}</Text>
            </View>
          </View>

          {/* SECTION DÉCONNEXION */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>

          {/* BOTTOM SPACING */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* MODAL CALENDRIER */}
        <Modal
          visible={calendarVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setCalendarVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity
                  onPress={() => setCalendarVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.calendarContainer}>
                {renderCalendar()}
              </View>

              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
                  <Text style={styles.legendText}>Tâches non complétées</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#51CF66' }]} />
                  <Text style={styles.legendText}>Tâches complétées</Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* BOTTOM NAVIGATION BAR */}
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
            style={styles.navItem}
            onPress={() => router.push('/todo')}
          >
            <Image
              source={require('../assets/images/icons/main_icons/notebook.png')}
              style={styles.navIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, styles.navItemActive]}
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
    zIndex: 2,
  },

  scrollView: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  contentContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 4,
  },

  backButton: {
    fontSize: 28,
    color: '#7c4a1d',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b2f2f',
    fontFamily: 'YallahScript',
  },

  section: {
    marginBottom: 24,
  },

  profileImageSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingVertical: 20,
  },

  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#E67E50',
  },

  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f6e1b5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E67E50',
  },

  profileIconLarge: {
    width: 50,
    height: 50,
    tintColor: '#E67E50',
  },

  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E67E50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },

  editIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
  },

  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3b2f2f',
    marginBottom: 4,
  },

  profileEmail: {
    fontSize: 14,
    color: '#999',
  },

  accountInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },

  accountLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },

  accountValue: {
    fontSize: 16,
    color: '#3b2f2f',
    fontWeight: '500',
  },

  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },

  statsNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#E67E50',
    marginBottom: 8,
  },

  statsLabel: {
    fontSize: 16,
    color: '#999',
    marginBottom: 12,
  },

  encouragement: {
    fontSize: 16,
    color: '#3b2f2f',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },

  logoutButton: {
    backgroundColor: '#E67E50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },

  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  menuIcon: {
    width: 24,
    height: 24,
    tintColor: '#E67E50',
    marginRight: 16,
  },

  menuItemTextContainer: {
    flex: 1,
  },

  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b2f2f',
    marginBottom: 4,
  },

  menuItemSubtitle: {
    fontSize: 12,
    color: '#999',
  },

  menuItemArrow: {
    fontSize: 20,
    color: '#999',
    marginLeft: 12,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textTransform: 'capitalize',
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    fontSize: 20,
    color: colors.text,
    fontWeight: 'bold',
  },

  calendarContainer: {
    marginBottom: 20,
  },

  calendarHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },

  weekDayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },

  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 4,
  },

  calendarDayOtherMonth: {
    opacity: 0.3,
  },

  calendarDayToday: {
    backgroundColor: colors.cardBg,
    borderRadius: 8,
  },

  calendarDaySelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
  },

  calendarDayTextSelected: {
    fontWeight: 'bold',
    color: colors.primary,
  },

  calendarDayText: {
    fontSize: 14,
    color: colors.text,
  },

  calendarDayTextOtherMonth: {
    color: colors.textLight,
  },

  calendarDayTextToday: {
    fontWeight: 'bold',
    color: colors.primary,
  },

  dateIndicator: {
    position: 'absolute',
    bottom: 2,
    left: '50%',
    transform: [{ translateX: -4 }],
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  dateIndicatorPending: {
    backgroundColor: '#FF6B6B',
  },

  dateIndicatorCompleted: {
    backgroundColor: '#51CF66',
  },

  dateIndicatorMixed: {
    backgroundColor: '#FFA500',
  },

  calendarNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.cardBg,
  },

  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.cardBg,
  },

  navButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },

  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.cardBg,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },

  legendText: {
    fontSize: 12,
    color: colors.text,
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

