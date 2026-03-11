import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';
import MaterialIcons from '@react-native-vector-icons/material-icons';

import Button from '../components/Button';
import TextField from '../components/TextField';
import { useAuthStore } from '../store/authStore';
import Dropdown from '../components/Dropdown';
import DatePicker from '../components/DatePicker';
import { useSyncStore } from '../store/syncStore';
import { ImagePicker } from '../components/ImagePicker';
import { useSyncManager } from '../hooks/useSyncManager';
import { RecordList } from '../components/RecordList';
import { useRecordManager } from '../hooks/useRecordManager';

export default function HomeScreen() {
  const theme = useTheme();

  const { form, imagePicker, records, ...recordManager } = useRecordManager();
  const syncManager = useSyncManager();

  const logout = useAuthStore(state => state.logout);
  const fullName = useAuthStore(state => state.fullName);
  const userName = useAuthStore(state => state.username);
  const userId = useAuthStore(state => state.userId);
  const companyName = useAuthStore(state => state.companyName);

  const { isOnline, isSyncing, lastError } = useSyncStore();

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
            onPress={form.handleToggleForm}
            variant="text"
            title={form.isFormOpen ? 'Fechar cadastro' : 'Novo registro'}
            endIcon={
              <MaterialIcons
                name={form.isFormOpen ? 'expand-less' : 'expand-more'}
                size={24}
                color={theme.colors.primary}
              />
            }
          />

          {form.isFormOpen && (
            <FormContainer>
              <Dropdown
                label="Tipo"
                value={form.values.type}
                onChange={({ id }) =>
                  form.setValue('type', id as 'COMPRA' | 'VENDA')
                }
                options={[
                  { id: 'COMPRA', title: 'Compra' },
                  { id: 'VENDA', title: 'Venda' },
                ]}
              />

              <DatePicker
                label="Data"
                value={form.values.date}
                mode="datetime"
                onChange={date => form.setValue('date', date)}
                placeholder="Selecione data e hora"
              />

              <TextField
                isTextArea
                minLength={10}
                maxLength={300}
                label="Descrição"
                value={form.values.description}
                onChangeText={text => form.setValue('description', text)}
                placeholder="Digite a descrição"
                error={form.errors.description}
              />

              <ImagesSection>
                <ImagesLabel>Imagens</ImagesLabel>

                <ImagesRow horizontal showsHorizontalScrollIndicator={false}>
                  <ImagePicker.Picker onPress={imagePicker.handleAddImage} />
                  {imagePicker.images.map(img => (
                    <ImagePicker.Preview
                      key={img.uri}
                      source={{ uri: img.uri }}
                      onRemove={() => imagePicker.removeImage(img.uri!)}
                    />
                  ))}
                </ImagesRow>
              </ImagesSection>
              <Button
                title="Salvar registro"
                onPress={form.handleSubmit}
                disabled={form.disabledSubmit}
              />
            </FormContainer>
          )}
        </FormWrapper>

        <RecordList
          records={records}
          currentUserId={userId}
          hasError={lastError !== null}
          isOnline={isOnline}
          isSyncing={isSyncing}
          onEdit={recordManager.handleEdit}
          onRemove={recordManager.handleRemove}
          onSync={syncManager.triggerManualSync}
          onReset={syncManager.resetAndSync}
        />
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
