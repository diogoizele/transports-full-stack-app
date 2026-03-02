import { ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

export const Bootstrap = () => {
  const theme = useTheme();

  return (
    <LoaderContainer>
      <StatusBar barStyle="light-content" />
      <ActivityIndicator color={theme.colors.white} size="large" />
    </LoaderContainer>
  );
};

const LoaderContainer = styled(SafeAreaView)`
  flex: 1;
  align-items: center;
  justify-content: center;

  background-color: ${({ theme }) => theme.colors.primary};
`;
