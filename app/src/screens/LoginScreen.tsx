import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

import { useAuthStore } from '../store/authStore';

import TextField from '../components/TextField';
import Button from '../components/Button';
import Toast from 'react-native-toast-message';
import axios from 'axios';

export default function LoginScreen() {
  const theme = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const disabledButton = [username.trim(), password.trim()].includes('');

  const login = useAuthStore(state => state.login);

  async function handleLogin() {
    setError(null);
    if (!username || !password) {
      setError('Preencha usuário e senha');
      return;
    }

    try {
      await login(username, password);

      Toast.show({
        type: 'success',
        position: 'bottom',
        text1: 'Bem-vindo de volta!',
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Falha ao entrar',
          text2: err.response?.data.message,
        });
      }
    }
  }

  return (
    <Container>
      <StatusBar barStyle="light-content" />
      <MaterialIcons
        name="local-shipping"
        size={64}
        color={theme.colors.white}
      />
      <FormContainer>
        <TextField
          label="Usuário"
          value={username}
          onChangeText={setUsername}
          placeholder="Digite seu usuário"
          error={error && !username ? error : undefined}
        />
        <TextField
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Digite sua senha"
          error={error && !password ? error : undefined}
        />
        <Button
          title="Entrar"
          onPress={handleLogin}
          disabled={disabledButton}
        />
      </FormContainer>
    </Container>
  );
}

const Container = styled(SafeAreaView)`
  flex: 1;
  padding: 24px;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const FormContainer = styled.View`
  width: 100%;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.background};
  gap: 8px;
  border-radius: 8px;
  margin-top: 16px;
`;
