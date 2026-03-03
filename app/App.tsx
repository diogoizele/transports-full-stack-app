import React from 'react';
import { StatusBar } from 'react-native';
import { ThemeProvider } from 'styled-components/native';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import RootNavigator from './src/navigation';
import { database } from './src/database';
import { theme } from './src/theme/theme';
import { Bootstrap } from './src/components/Bootstrap';
import { useBootstrap } from './src/bootstrap/initialize';

export default function App() {
  const { isReady } = useBootstrap();

  console.log('[APP] - rerender');

  return (
    <ThemeProvider theme={theme}>
      <DatabaseProvider database={database}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" />
          {isReady ? <RootNavigator /> : <Bootstrap />}
          <Toast />
        </SafeAreaProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
}
