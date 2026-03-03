import React, { useState } from 'react';
import { Modal, FlatList } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import MaterialIcons from '@react-native-vector-icons/material-icons';

export type RecordItemType = {
  id: string;
  type: 'COMPRA' | 'VENDA';
  date: string;
  description: string;
  synced: boolean;
  images?: { uri: string }[];
};

interface RecordCardItemProps {
  record: RecordItemType;
  onEdit?: (record: RecordItemType) => void;
  onRemove?: (record: RecordItemType) => void;
}

export const RecordCardItem: React.FC<RecordCardItemProps> = ({
  record,
  onEdit,
  onRemove,
}) => {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => setModalVisible(true);
  const handleCloseModal = () => setModalVisible(false);

  return (
    <>
      <CardTouchable onPress={handleOpenModal}>
        <Content>
          <HeaderRow>
            <TitleContainer>
              <SyncIndicator synced={record.synced} theme={theme} />
              <RecordType>{record.type}</RecordType>
            </TitleContainer>
            <RecordDate>{record.date}</RecordDate>
          </HeaderRow>

          <RecordDescription numberOfLines={1}>
            {record.description}
          </RecordDescription>
        </Content>

        <IconsContainer>
          {onEdit && (
            <TouchableAction
              backgroundColor={theme.colors.primary}
              onPress={() => onEdit(record)}
            >
              <MaterialIcons name="edit" size={22} color={theme.colors.white} />
            </TouchableAction>
          )}
          {onRemove && (
            <TouchableAction
              backgroundColor={theme.colors.error}
              onPress={() => onRemove(record)}
            >
              <MaterialIcons
                name="delete"
                size={22}
                color={theme.colors.white}
              />
            </TouchableAction>
          )}
        </IconsContainer>
      </CardTouchable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <ModalBackdrop onPress={handleCloseModal}>
          <ModalContent>
            <FlatList
              data={record.images || []}
              keyExtractor={(item, index) => `${item.uri}-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <ModalImage source={{ uri: item.uri }} resizeMode="contain" />
              )}
            />

            <ModalText>
              <ModalHeader>{record.description}</ModalHeader>
            </ModalText>
          </ModalContent>
        </ModalBackdrop>
      </Modal>
    </>
  );
};

const CardTouchable = styled.TouchableOpacity`
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;

  height: 72px;

  margin-bottom: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  align-items: flex-start;

  overflow: hidden;
`;

const SyncIndicator = styled.View<{ synced: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 8px;

  background-color: ${({ synced, theme }) =>
    synced ? theme.colors.success : theme.colors.warning};
`;

const Content = styled.View`
  flex: 1;

  margin-left: 12px;
  height: 100%;
  padding: 8px 0;
  justify-content: center;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const TitleContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const RecordType = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const RecordDate = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const RecordDescription = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const IconsContainer = styled.View`
  margin-left: 8px;

  height: 100%;
  width: 64px;
`;

const TouchableAction = styled.TouchableOpacity<{ backgroundColor: string }>`
  background-color: ${({ backgroundColor }) => backgroundColor};

  justify-content: center;
  align-items: center;
  flex: 1;
`;

const ModalBackdrop = styled.TouchableOpacity`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.View`
  width: 90%;
  max-height: 70%;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 16px;
`;

const ModalText = styled.View`
  margin-bottom: 12px;
`;

const ModalHeader = styled.Text`
  font-weight: 700;
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.text};
`;

const ModalImage = styled.Image`
  width: 100%;
  height: 200px;
  margin-right: 8px;
`;
