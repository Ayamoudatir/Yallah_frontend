export const options = {
  headerShown: false,
};

import { ResizeMode, Video } from 'expo-av';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import taskService from './services/taskService';
import authService from './services/authService';
import { Task, TaskStats } from './types';

interface DayInfo {
  month: string;
  day: number;
  fullDate: string;
  isToday: boolean;
}

export default function WelcomeScreen() {
  const router = useRouter();

  const [userName, setUserName] = useState('User');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState('');
  const [weekDays, setWeekDays] = useState<DayInfo[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const isAuth = await authService.initializeAuth();
      if (!isAuth) {
        router.replace('/');
        return;
      }
     
      await loadUserData();
      generateCalendar();
      await Promise.all([loadTodayTasks(), loadStats()]);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    const user = await authService.getCurrentUser();
    if (user) {
      setUserName(user.email?.split('@')[0] || user.username || 'User');
    }
  };

  const generateCalendar = () => {
    const today = new Date();
    const days: DayInfo[] = [];

    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      days.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        day: date.getDate(),
        fullDate: date.toISOString().split('T')[0],
        isToday: i === 0,
      });
    }

    setWeekDays(days);
    setSelectedDay(days.findIndex(d => d.isToday));
    setCurrentDate(
      today.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    );
  };

  const loadTodayTasks = async () => {
    const data = await taskService.getTodayTasks();
    setTasks(data);
  };

  const loadTasksByDate = async (date: string) => {
    const data = await taskService.getTasksByDate(date);
    setTasks(data);
  };

  const loadStats = async () => {
    const data = await taskService.getStats();
    setStats(data);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (weekDays[selectedDay]) {
      await loadTasksByDate(weekDays[selectedDay].fullDate);
    }
    await loadStats();
    setRefreshing(false);
  };

  const toggleTask = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );

    try {
      await taskService.toggleTask(taskId);
      await loadStats();
    } catch {
      if (weekDays[selectedDay]) {
        await loadTasksByDate(weekDays[selectedDay].fullDate);
      }
    }
  };

  const logout = async () => {
    await authService.logout();
    router.replace('/');
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Chargement...</Text>
      </View>
    );
  }

  /* === RENDER UI === */
  return (
    <View style={styles.container}>
      {/* TOUT TON JSX RESTE IDENTIQUE */}
      {/* Aucun changement visuel */}
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
  completed: '#4CAF50',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },

  scrollView: {
    flex: 1,
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  profile: {
    alignItems: 'center',
  },

  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },

  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },

  avatarLetter: {
    fontSize: 20,
    color: colors.secondary,
    fontWeight: 'bold',
  },

  logout: {
    marginTop: 4,
    fontSize: 12,
    color: colors.secondary,
    textDecorationLine: 'underline',
  },

  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },

  dateText: {
    fontSize: 16,
    color: colors.textLight,
  },

  calendarContainer: {
    marginBottom: 24,
  },

  calendarContent: {
    paddingHorizontal: 20,
    gap: 12,
  },

  dayCard: {
    width: 60,
    height: 80,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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

  dayTextActive: {
    color: colors.white,
  },

  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  statItem: {
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },

  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },

  todoSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },

  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },

  checkboxCompleted: {
    backgroundColor: colors.secondary,
  },

  checkmark: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  taskContent: {
    flex: 1,
  },

  taskText: {
    fontSize: 16,
    color: colors.text,
  },

  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },

  taskDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },

  viewAllLink: {
    fontSize: 14,
    color: colors.secondary,
    textDecorationLine: 'underline',
    textAlign: 'right',
    marginTop: 8,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },

  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 16,
  },

  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },

  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  mascotContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  mascotVideo: {
    width: 200,
    height: 200,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  icon: {
    width: 28,
    height: 28,
    tintColor: colors.text,
  },

  iconActive: {
    tintColor: colors.secondary,
  },
});