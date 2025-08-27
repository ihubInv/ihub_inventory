import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { tabStateManager, statePersistence } from '../utils/statePersistence';

interface AppStateContextType {
  isTabVisible: boolean;
  clearAllPersistedState: () => void;
  getPersistedStateKeys: () => { localStorage: string[]; sessionStorage: string[] };
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [isTabVisible, setIsTabVisible] = React.useState(true);

  useEffect(() => {
    // Listen for tab visibility changes
    const removeListener = tabStateManager.addListener(() => {
      setIsTabVisible(tabStateManager.isTabVisible());
    });

    // Handle page unload - save critical state
    const handleBeforeUnload = () => {
      // Save any critical state that needs to be preserved
      console.log('Page unloading, saving critical state...');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      removeListener();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const clearAllPersistedState = () => {
    statePersistence.clearAllState();
  };

  const getPersistedStateKeys = () => {
    return statePersistence.getAllKeys();
  };

  const value: AppStateContextType = {
    isTabVisible,
    clearAllPersistedState,
    getPersistedStateKeys,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};
