import React, { ReactNode } from 'react';
import { GestureResponderEvent } from 'react-native';
import styled, { css } from 'styled-components/native';

type Variant = 'filled' | 'outlined' | 'text';

interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  variant?: Variant;
  endIcon?: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'filled',
  endIcon,
}) => {
  return (
    <ButtonContainer
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
      variant={variant}
    >
      <Content>
        <Label variant={variant}>{title}</Label>
        {endIcon ? <IconWrapper>{endIcon}</IconWrapper> : null}
      </Content>
    </ButtonContainer>
  );
};

export default Button;

const ButtonContainer = styled.TouchableOpacity<{
  disabled: boolean;
  variant: Variant;
}>`
  padding: 14px 24px;
  border-radius: 8px;
  align-items: center;

  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  ${({ variant, theme }) => {
    switch (variant) {
      case 'outlined':
        return css`
          background-color: transparent;
          border: 1px solid ${theme.colors.primary};
        `;
      case 'text':
        return css`
          background-color: transparent;
        `;
      case 'filled':
      default:
        return css`
          background-color: ${theme.colors.primary};
        `;
    }
  }}
`;

const Content = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const IconWrapper = styled.View`
  margin-left: 8px;
`;

export const Label = styled.Text<{ variant: Variant }>`
  font-size: 16px;
  font-weight: 500;

  ${({ variant, theme }) => {
    switch (variant) {
      case 'outlined':
        return css`
          color: ${theme.colors.primary};
        `;
      case 'text':
        return css`
          color: ${theme.colors.primary};
        `;
      case 'filled':
      default:
        return css`
          color: ${theme.colors.white};
        `;
    }
  }}
`;
