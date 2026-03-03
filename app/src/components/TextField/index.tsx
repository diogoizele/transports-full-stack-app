import React, { useState } from 'react';
import { TextInputProps } from 'react-native';
import styled, { css } from 'styled-components/native';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  disabled?: boolean;
  isTextArea?: boolean;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  disabled,
  isTextArea,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Container>
      {label && <Label>{label}</Label>}

      <StyledInput
        {...props}
        multiline={isTextArea}
        textAlignVertical={isTextArea ? 'top' : 'center'}
        editable={!disabled}
        hasError={!!error}
        autoCapitalize="none"
        autoCorrect={false}
        isFocused={isFocused}
        isDisabled={!!disabled}
        isTextArea={!!isTextArea}
        placeholderTextColor="#A0A0A0"
        onFocus={e => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={e => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
      />

      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
};

export default TextField;

const Container = styled.View`
  margin: 8px 0;
`;

const Label = styled.Text`
  font-size: 14px;
  margin-bottom: 4px;
  margin-left: 4px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

type InputProps = {
  hasError: boolean;
  isFocused: boolean;
  isDisabled: boolean;
  isTextArea: boolean;
};

const StyledInput = styled.TextInput<InputProps>`
  border-width: 1px;
  border-radius: 8px;
  padding-vertical: 12px;
  padding-horizontal: 16px;
  font-size: 16px;

  ${({ isTextArea }) =>
    isTextArea &&
    css`
      min-height: 120px;
    `}

  color: ${({ theme, isDisabled }) =>
    isDisabled ? theme.colors.textSecondary : theme.colors.text};

  background-color: ${({ theme, isDisabled }) =>
    isDisabled ? theme.colors.surface : theme.colors.background};

  border-color: ${({ theme, hasError, isFocused }) => {
    if (hasError) return theme.colors.error;
    if (isFocused) return theme.colors.primary;
    return theme.colors.border;
  }};

  ${({ theme, isFocused, hasError }) =>
    isFocused &&
    !hasError &&
    css`
      shadow-color: ${theme.colors.primary};
      shadow-opacity: 0.15;
      shadow-radius: 4px;
      shadow-offset: 0px 0px;
      elevation: 2;
    `}
`;

const ErrorText = styled.Text`
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error};
`;
