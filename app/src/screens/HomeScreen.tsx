import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';
import dayjs from 'dayjs';
import MaterialIcons from '@react-native-vector-icons/material-icons';

import Button from '../components/Button';
import TextField from '../components/TextField';
import { useAuthStore } from '../store/authStore';
import Dropdown from '../components/Dropdown';
import DatePicker from '../components/DatePicker';
import { useImagePicker } from '../hooks/useImagePicker';
import { useRecordForm } from '../hooks/useRecordForm';
import { useRecordStore } from '../store/recordStore';
import { useSyncStore } from '../store/syncStore';
import type { RecordDTO } from '../services/recordService';
import { ImagePicker } from '../components/ImagePicker';
import { RecordCardItem, RecordItemType } from '../components/RecordCardItem';
import Toast from 'react-native-toast-message';

export default function HomeScreen() {
  const theme = useTheme();

  const {
    images,
    pickFromGallery,
    takePhoto,
    removeImage,
    clearImages,
    setImages,
  } = useImagePicker();

  const logout = useAuthStore(state => state.logout);
  const fullName = useAuthStore(state => state.fullName);
  const userName = useAuthStore(state => state.username);
  const companyName = useAuthStore(state => state.companyName);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { records, addRecord, updateRecord, removeRecord } = useRecordStore();

  const { isOnline, isSyncing, syncNow } = useSyncStore();

  const {
    values,
    errors,
    setValue,
    handleSubmit: handleFormSubmit,
    resetForm,
    disabledSubmit,
  } = useRecordForm({
    onSubmit: async formValues => {
      if (!formValues.date) return;

      const input = {
        type: formValues.type as 'COMPRA' | 'VENDA',
        dateTime: dayjs(formValues.date).format('YYYY-MM-DD HH:mm:ss'),
        description: formValues.description,
        images: images
          .filter(img => !!img.uri)
          .map(img => ({ id: img.id, path: img.uri! })),
      };

      if (editingId) {
        await updateRecord(editingId, input);
      } else {
        await addRecord(input);
      }

      resetForm({ type: '', date: null, description: '' });
      clearImages();
      setEditingId(null);
      setIsFormOpen(false);
    },
  });

  const handleAddImage = () => {
    Alert.alert('Adicionar imagem', 'Escolha uma opção', [
      { text: 'Galeria', onPress: pickFromGallery },
      { text: 'Câmera', onPress: takePhoto },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleToggleForm = () => {
    resetForm();
    clearImages();
    setEditingId(null);
    setIsFormOpen(prev => !prev);
  };

  const handleManualSync = () => {
    if (!isOnline) {
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Sem conexão com a internet',
        text2: 'Conecte-se a uma rede para sincronizar os dados.',
      });
      return;
    }

    syncNow();
  };

  const handleEditRecord = async (
    record: RecordItemType,
    shouldOpenImgPicker: boolean = false,
  ) => {
    // await syncNow();

    const dto = useRecordStore
      .getState()
      .records.find(({ id }) => id === record.id);

    if (!dto) return;

    resetForm({
      type: dto.type,
      date: dto.dateTime ? dayjs(dto.dateTime).toDate() : null,
      description: dto.description,
    });
    clearImages();
    setImages(dto.images.map(img => ({ uri: img.path, id: img.id })));
    setEditingId(dto.id);
    setIsFormOpen(true);

    if (shouldOpenImgPicker) {
      handleAddImage();
    }
  };

  const handleRemoveRecord = (record: { id: string }) => {
    removeRecord(record.id);
  };

  const mapRecordToCardItem = (record: RecordDTO) => ({
    id: record.id,
    type: record.type,
    date: record.dateTime,
    description: record.description,
    synced: record.synced,
    images: record.images?.map(img => ({ uri: img.path })) ?? [],
  });

  useEffect(() => {
    useSyncStore.getState().syncNow();
    const unsubscribe = useRecordStore.getState().subscribe();

    return unsubscribe;
  }, []);

  return (
    <Container>
      <StatusBar barStyle="light-content" />
      <TopSafeArea edges={['top']} />

      <Header>
        <HeaderInfo>
          <AppName>Transportes S.A.</AppName>
          <UserText>
            {fullName} ({userName})
          </UserText>

          <CompanyText>{companyName}</CompanyText>
        </HeaderInfo>
        <HeaderQuitTouchable onPress={logout}>
          <MaterialIcons
            name="exit-to-app"
            size={24}
            color={theme.colors.white}
          />
        </HeaderQuitTouchable>
      </Header>

      <Content>
        <FormWrapper>
          <Button
            onPress={handleToggleForm}
            variant="text"
            title={isFormOpen ? 'Fechar cadastro' : 'Novo registro'}
            endIcon={
              <MaterialIcons
                name={isFormOpen ? 'expand-less' : 'expand-more'}
                size={24}
                color={theme.colors.primary}
              />
            }
          />

          {isFormOpen && (
            <FormContainer>
              <Dropdown
                label="Tipo"
                value={values.type}
                onChange={({ id }) =>
                  setValue('type', id as 'COMPRA' | 'VENDA')
                }
                options={[
                  { id: 'COMPRA', title: 'Compra' },
                  { id: 'VENDA', title: 'Venda' },
                ]}
              />

              <DatePicker
                label="Data"
                value={values.date}
                mode="datetime"
                onChange={date => setValue('date', date)}
                placeholder="Selecione data e hora"
              />

              <TextField
                isTextArea
                minLength={10}
                maxLength={300}
                label="Descrição"
                value={values.description}
                onChangeText={text => setValue('description', text)}
                placeholder="Digite a descrição"
                error={errors.description}
              />

              <ImagesSection>
                <ImagesLabel>Imagens</ImagesLabel>

                <ImagesRow horizontal showsHorizontalScrollIndicator={false}>
                  <ImagePicker.Picker onPress={handleAddImage} />
                  {images.map(img => (
                    <ImagePicker.Preview
                      key={img.uri}
                      source={{ uri: img.uri }}
                      onRemove={() => removeImage(img.uri!)}
                    />
                  ))}
                </ImagesRow>
              </ImagesSection>
              <Button
                title="Salvar registro"
                onPress={handleFormSubmit}
                disabled={disabledSubmit}
              />
            </FormContainer>
          )}
        </FormWrapper>

        <ListContainer>
          <RecordsHeaderRow>
            <RecordsTitle>Registros</RecordsTitle>
            <SyncStatusTouchable onPress={handleManualSync}>
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
          </RecordsHeaderRow>

          <FlatList
            data={records.map(mapRecordToCardItem)}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyStateContainer>
                <EmptyStateTitle>Nenhum registro encontrado</EmptyStateTitle>
                <EmptyStateSubtitle>
                  Toque em "Novo registro" para cadastrar o primeiro lançamento.
                </EmptyStateSubtitle>
              </EmptyStateContainer>
            }
            renderItem={({ item }) => (
              <RecordCardItem
                record={item}
                onEdit={handleEditRecord}
                onRemove={handleRemoveRecord}
              />
            )}
          />
        </ListContainer>
      </Content>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const TopSafeArea = styled(SafeAreaView)`
  background-color: ${({ theme }) => theme.colors.primary};
`;

const Header = styled.View`
  padding: 20px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const HeaderInfo = styled.View``;

const HeaderQuitTouchable = styled.TouchableOpacity``;

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

const AppName = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.white};
`;

const UserText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
  margin-top: 4px;
`;

const CompanyText = styled.Text`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.9;
`;

const Content = styled.View`
  flex: 1;
`;

const FormWrapper = styled.View`
  padding: 20px;
  padding-bottom: 0;
  gap: 8px;
`;

const FormContainer = styled.View`
  margin-bottom: 16px;
`;

const ImagesSection = styled.View`
  gap: 6px;
`;

const ImagesLabel = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ImagesRow = styled.ScrollView.attrs({
  contentContainerStyle: {
    overflow: 'visible',
  },
})`
  flex-direction: row;
  margin: 8px 0 16px 0;
  overflow: visible;
`;

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
