import React, { useState } from 'react';
import { Modal } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import Button from '../Button';
import { formatFriendlyDate } from '../../helpers/date';

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
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = record.images || [];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const handleOpenModal = () => {
    setCurrentIndex(0);
    setModalVisible(true);
  };
  const handleCloseModal = () => setModalVisible(false);

  return (
    <>
      <CardTouchable onPress={handleOpenModal}>
        <Content>
          <HeaderRow>
            <TitleContainer>
              <SyncIndicator synced={record.synced} />
              <RecordType>{record.type}</RecordType>
            </TitleContainer>
            <RecordDate>{formatFriendlyDate(record.date)}</RecordDate>
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
        <ModalBackdrop activeOpacity={1}>
          <ModalContent activeOpacity={1}>
            {images.length > 0 && (
              <CarouselContainer>
                <ModalImage
                  source={{ uri: images[currentIndex]?.uri }}
                  resizeMode="contain"
                />

                {hasPrev && (
                  <NavButton
                    side="left"
                    onPress={() => setCurrentIndex(i => i - 1)}
                  >
                    <MaterialIcons
                      name="chevron-left"
                      size={32}
                      color={theme.colors.white}
                    />
                  </NavButton>
                )}

                {hasNext && (
                  <NavButton
                    side="right"
                    onPress={() => setCurrentIndex(i => i + 1)}
                  >
                    <MaterialIcons
                      name="chevron-right"
                      size={32}
                      color={theme.colors.white}
                    />
                  </NavButton>
                )}

                {images.length > 1 && (
                  <DotsContainer>
                    {images.map((_, idx) => (
                      <Dot key={idx} active={idx === currentIndex} />
                    ))}
                  </DotsContainer>
                )}
              </CarouselContainer>
            )}

            <ModalText>
              <ModalHeader>{record.description}</ModalHeader>
            </ModalText>

            <Button title="Voltar" onPress={handleCloseModal} />
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

const ModalContent = styled.TouchableOpacity`
  width: 90%;
  max-height: 80%;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 16px;
`;

const CarouselContainer = styled.View`
  position: relative;
  width: 100%;
  margin-bottom: 12px;
`;

const ModalImage = styled.Image`
  width: 100%;
  height: 400px;
  border-radius: 8px;
`;

const NavButton = styled.TouchableOpacity<{ side: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ side }) => side}: 8px;
  margin-top: -24px;
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: rgba(0, 0, 0, 0.45);
  justify-content: center;
  align-items: center;
`;

const DotsContainer = styled.View`
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 6px;
`;

const Dot = styled.View<{ active: boolean }>`
  width: ${({ active }) => (active ? '8px' : '6px')};
  height: ${({ active }) => (active ? '8px' : '6px')};
  border-radius: 4px;
  background-color: ${({ active }) =>
    active ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.45)'};
`;

const ModalText = styled.View`
  margin-bottom: 12px;
`;

const ModalHeader = styled.Text`
  font-weight: 700;
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.text};
`;
