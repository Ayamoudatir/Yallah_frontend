import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface ImageSet {
  id: string;
  name: string;
  background: any;
  preview: any;
  mascot?: any;
}

export const ambiences: ImageSet[] = [
  {
    id: 'default',
    name: 'Par défaut',
    background: require('../assets/images/main-images/todo_page.png'),
    preview: require('../assets/images/main-images/todo_page.png'),
    mascot: require('../assets/images/animations/bee-yallah.mp4'),
  },
  {
    id: 'paysage1',
    name: 'Paysage 1',
    background: require('../assets/images/themes/paysage.jpg'),
    preview: require('../assets/images/themes/paysage.jpg'),
    mascot: require('../assets/images/animations/bee-yallah.mp4'),
  },
  {
    id: 'paysage2',
    name: 'Paysage 2',
    background: require('../assets/images/themes/paysage2.jpg'),
    preview: require('../assets/images/themes/paysage2.jpg'),
    mascot: require('../assets/images/animations/bee-yallah.mp4'),
  },
  {
    id: 'paysage3',
    name: 'Paysage 3',
    background: require('../assets/images/themes/paysage3.jpg'),
    preview: require('../assets/images/themes/paysage3.jpg'),
    mascot: require('../assets/images/animations/bee-yallah.mp4'),
  },
];

interface ImageContextType {
  currentAmbience: ImageSet;
  setAmbience: (ambienceId: string) => Promise<void>;
  ambiences: ImageSet[];
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

const STORAGE_KEY = '@yalah_ambience';

export function ImageProvider({ children }: { children: ReactNode }) {
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
      console.error('Erreur lors du chargement de l\'ambiance:', error);
    }
  };

  const setAmbience = async (ambienceId: string) => {
    try {
      const ambience = ambiences.find(a => a.id === ambienceId);
      if (ambience) {
        setCurrentAmbience(ambience);
        await AsyncStorage.setItem(STORAGE_KEY, ambienceId);
        // Force le re-render de tous les composants qui utilisent le contexte
        setRefreshKey(prev => prev + 1);
        console.log('Thème changé vers:', ambience.name);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'ambiance:', error);
    }
  };

  // Créer un nouvel objet de valeur à chaque changement pour forcer le re-render
  const contextValue = React.useMemo(
    () => ({ currentAmbience, setAmbience, ambiences }),
    [currentAmbience, refreshKey]
  );

  return (
    <ImageContext.Provider value={contextValue}>
      {children}
    </ImageContext.Provider>
  );
}

export function useImages() {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImages must be used within an ImageProvider');
  }
  return context;
}

