import React, { useCallback } from 'react';
import { FlatList } from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import styled from 'styled-components/native';

import { RecordCardItem, RecordItemType } from '../RecordCardItem';
import { theme } from '../../theme/theme';

interface RecordListProps {
  records: RecordItemType[];
  currentUserId: string | null;
  isOnline: boolean;
  isSyncing: boolean;
  hasError: boolean;
  onEdit: (record: RecordItemType) => void;
  onRemove: (record: { id: string; type: string }) => void;
  onSync: () => void;
  onReset: () => void;
}

export const RecordList: React.FC<RecordListProps> = React.memo(
  ({
    records,
    currentUserId,
    hasError,
    isOnline,
    isSyncing,
    onEdit,
    onRemove,
    onReset,
    onSync,
  }) => {
    const keyExtractor = useCallback((item: RecordItemType) => item.id, []);

    const renderItem = useCallback(
      ({ item }: { item: RecordItemType }) => (
        <RecordCardItem
          record={item}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      ),
      [currentUserId, onEdit, onRemove],
    );

    return (
      <ListContainer>
        <RecordsHeaderRow>
          <RecordsTitle>Registros</RecordsTitle>
          <SyncActionsContainer>
            {hasError && isOnline && (
              <SyncStatusTouchable onPress={onReset}>
                <MaterialIcons
                  name="error-outline"
                  size={18}
                  color={theme.colors.error}
                />
                <SyncStatusText>Resetar modificações</SyncStatusText>
              </SyncStatusTouchable>
            )}
            <SyncStatusTouchable onPress={onSync}>
              <MaterialIcons
                name={isOnline ? 'wifi' : 'wifi-off'}
                size={18}
                color={isOnline ? theme.colors.success : theme.colors.warning}
              />
              <SyncStatusText>
                {isSyncing
                  ? 'Sincronizando...'
                  : isOnline
                  ? 'Online'
                  : 'Offline'}
              </SyncStatusText>
            </SyncStatusTouchable>
          </SyncActionsContainer>
        </RecordsHeaderRow>

        <FlatList
          data={records}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyStateContainer>
              <EmptyStateTitle>Nenhum registro encontrado</EmptyStateTitle>
              <EmptyStateSubtitle>
                Toque em "Novo registro" para cadastrar o primeiro lançamento.
              </EmptyStateSubtitle>
            </EmptyStateContainer>
          }
          renderItem={renderItem}
        />
      </ListContainer>
    );
  },
);

const ListContainer = styled.View`
  flex: 1;
  padding: 20px;
  margin-top: 16px;
`;

const RecordsHeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const RecordsTitle = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const EmptyStateContainer = styled.View`
  padding: 32px 0;
  align-items: center;
  justify-content: center;
`;

const EmptyStateTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const EmptyStateSubtitle = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;

const SyncActionsContainer = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const SyncStatusTouchable = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const SyncStatusText = styled.Text`
  margin-left: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.white};
`;
