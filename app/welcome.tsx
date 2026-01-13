export const options = {
  headerShown: false,
};

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface DayInfo {
  month: string;
  day: number;
  fullDate: string;
  isToday: boolean;
}

export default function WelcomeScreen() {
  const router = useRouter();

  const [userName] = useState('User');
  const [currentDate, setCurrentDate] = useState('');
  const [weekDays, setWeekDays] = useState<DayInfo[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    generateCalendar();
    setTimeout(() => setLoading(false), 500); // fake loading
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

  const logout = () => {
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue {userName} 👋</Text>
      <Text style={styles.date}>{currentDate}</Text>

      <View style={styles.calendar}>
        {weekDays.map((day, index) => (
          <View
            key={index}
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
          </View>
        ))}
      </View>

      <Text style={styles.info}>
        🚧 Les tâches arrivent bientôt (Firebase)
      </Text>

      <Text style={styles.logout} onPress={logout}>
        Se déconnecter
      </Text>
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
    backgroundColor: colors.background,
    paddingTop: 80,
    paddingHorizontal: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
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
    marginBottom: 24,
  },

  calendar: {
    flexDirection: 'row',
    marginBottom: 30,
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
  },

  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
  },

  dayActiveText: {
    color: colors.white,
  },

  info: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 40,
  },

  logout: {
    marginTop: 40,
    fontSize: 14,
    color: colors.secondary,
    textDecorationLine: 'underline',
  },
});