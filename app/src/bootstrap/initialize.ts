/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

import { useSyncStore } from '../store/syncStore';
import { useAuthStore } from '../store/authStore';

export function useBootstrap() {
  const [isAppStarting, setIsAppStarting] = useState(true);

  const setOnline = useSyncStore(state => state.setOnline);
  const syncNow = useSyncStore(state => state.syncNow);
  const bootstrap = useAuthStore(state => state.bootstrap);

  useEffect(() => {
    const handleState = (state: NetInfoState) => {
      const online = !!state.isConnected && !!state.isInternetReachable;

      setOnline(online);

      if (online) {
        syncNow();
      }
    };

    // NetInfo.fetch().then(handleState);

    const unsubscribe = NetInfo.addEventListener(handleState);

    return unsubscribe;
  }, []);

  useEffect(() => {
    const init = async () => {
      await bootstrap();
      setIsAppStarting(false);
    };

    init();
  }, []);

  return {
    isReady: !isAppStarting,
  };
}
