import React from 'react';
import { GestureResponderEvent } from 'react-native';
import styled from 'styled-components/native';

interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
}) => {
  return (
    <ButtonContainer onPress={onPress} activeOpacity={0.7} disabled={disabled}>
      <Label>{title}</Label>
    </ButtonContainer>
  );
};

export default Button;

const ButtonContainer = styled.TouchableOpacity<{ disabled: boolean }>`
  background-color: ${({ theme }) => theme.colors.primary};
  opacity: ${({ disabled }) => (disabled ? 0.8 : 1)};

  padding: 14px 24px;
  border-radius: 8px;

  align-items: center;
`;

export const Label = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-size: 16px;
  font-weight: 500;
`;
