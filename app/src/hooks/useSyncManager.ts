import Toast from 'react-native-toast-message';

import { useSyncStore } from '../store/syncStore';
import { useCallback, useEffect } from 'react';
import { useRecordStore } from '../store/recordStore';

export const useSyncManager = () => {
  const { isOnline, isSyncing, lastError, syncNow, resetLocalData } =
    useSyncStore();
  const { subscribe } = useRecordStore();

  const triggerManualSync = useCallback(async () => {
    if (!isOnline) {
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Sem conexão com a internet',
        text2: 'Conecte-se a uma rede para sincronizar os dados.',
      });
    }
    try {
      await syncNow();
    } catch (err: any) {
      if ('message' in err) {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Erro ao sincronizar!',
          text2: err.message,
        });
      }
    }
  }, [isOnline, syncNow]);

  const resetAndSync = async () => {
    try {
      await resetLocalData();
      await syncNow();
    } catch (err: any) {
      if ('message' in err) {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Erro ao resetar dados.',
        });
      }
    }
  };

  useEffect(() => {
    syncNow();
    const unsubscribe = subscribe();

    return unsubscribe;
  }, [syncNow, subscribe]);

  useEffect(() => {
    if (lastError) {
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Erro ao sincronizar!',
        text2: lastError,
      });
    }
  }, [lastError]);

  return {
    isOnline,
    isSyncing,
    hasError: !!lastError,
    triggerManualSync,
    resetAndSync,
  };
};
