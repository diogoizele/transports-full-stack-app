import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Q } from '@nozbe/watermelondb';

import { database } from '../database';
import { RecordModel } from '../database/models/RecordModel';
import { useAuthStore } from '../store/authStore';
import { sync } from '../api/sync';

import Button from '../components/Button';

export default function HomeScreen() {
  const { userId, companyId, logout } = useAuthStore();
  const [records, setRecords] = useState<RecordModel[]>([]);

  useEffect(() => {
    if (!companyId) return;

    const collection = database.get<RecordModel>('records');

    const subscription = collection
      .query(
        Q.where('company_id', companyId),
        Q.where('deleted_at', null),
        Q.sortBy('date_time', Q.desc),
      )
      .observe()
      .subscribe(setRecords);

    return () => subscription.unsubscribe();
  }, [companyId]);

  async function handleSync() {
    await sync();
  }

  async function handleCreateDummy() {
    if (!userId || !companyId) return;

    const now = Date.now();

    await database.write(async () => {
      await database.get<RecordModel>('records').create(record => {
        record.type = 'COMPRA';
        record.dateTime = now;
        record.description = 'Registro criado offline';
        record.companyId = companyId;
        record.userId = userId;
        record.createdAt = now;
        record.updatedAt = now;
      });
    });
  }

  return (
    <View style={styles.container}>
      <Button title="Criar Registro Offline" onPress={handleCreateDummy} />
      <Button title="Sincronizar" onPress={handleSync} />
      <Button title="Logout" onPress={logout} />

      <FlatList
        data={records}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isSynced = item.syncStatus === 'synced';
          return (
            <View style={styles.recordContainer}>
              <Text style={styles.type}>{item.type}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.syncStatus}>
                {isSynced ? 'Sincronizado' : 'Pendente'}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  recordContainer: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  type: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  syncStatus: {
    fontSize: 12,
    color: '#666',
  },
});
