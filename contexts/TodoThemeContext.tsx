import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ambiences, ImageSet } from './ImageContext';

interface TodoThemeContextType {
  currentAmbience: ImageSet;
  setAmbience: (ambienceId: string) => Promise<void>;
  ambiences: ImageSet[];
}

const TodoThemeContext = createContext<TodoThemeContextType | undefined>(undefined);

const STORAGE_KEY = '@yalah_todo_ambience';

export function TodoThemeProvider({ children }: { children: ReactNode }) {
  const [currentAmbience, setCurrentAmbience] = useState<ImageSet>(ambiences[0]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadSavedAmbience();
  }, []);

  const loadSavedAmbience = async () => {
    try {
      const savedId = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedId) {
        const ambience = ambiences.find(a => a.id === savedId);
        if (ambience) {
          setCurrentAmbience(ambience);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'ambiance todo:', error);
    }
  };

  const setAmbience = async (ambienceId: string) => {
    try {
      const ambience = ambiences.find(a => a.id === ambienceId);
      if (ambience) {
        setCurrentAmbience(ambience);
        await AsyncStorage.setItem(STORAGE_KEY, ambienceId);
        setRefreshKey(prev => prev + 1);
        console.log('Thème todo changé vers:', ambience.name);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'ambiance todo:', error);
    }
  };

  const contextValue = React.useMemo(
    () => ({ currentAmbience, setAmbience, ambiences }),
    [currentAmbience, refreshKey]
  );

  return (
    <TodoThemeContext.Provider value={contextValue}>
      {children}
    </TodoThemeContext.Provider>
  );
}

export function useTodoTheme() {
  const context = useContext(TodoThemeContext);
  if (context === undefined) {
    throw new Error('useTodoTheme must be used within a TodoThemeProvider');
  }
  return context;
}

