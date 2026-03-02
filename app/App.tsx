import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { ThemeProvider } from 'styled-components/native';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import RootNavigator from './src/navigation';
import { database } from './src/database';
import { useAuthStore } from './src/store/authStore';
import { theme } from './src/theme/theme';
import { Bootstrap } from './src/components/Bootstrap';

export default function App() {
  const bootstrap = useAuthStore(state => state.bootstrap);
  const [isAppStarting, setIsAppStarting] = useState(true);

  useEffect(() => {
    async function init() {
      await bootstrap();
      setIsAppStarting(false);
    }

    init();
  }, [bootstrap]);

  return (
    <ThemeProvider theme={theme}>
      <DatabaseProvider database={database}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" />
          {isAppStarting ? <Bootstrap /> : <RootNavigator />}
          <Toast />
        </SafeAreaProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
}
