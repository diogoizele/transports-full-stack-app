import React, { useState } from 'react';
import { TextInputProps } from 'react-native';
import styled, { css } from 'styled-components/native';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  disabled?: boolean;
  isTextArea?: boolean;
  minLength?: number;
  maxLength?: number;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  disabled,
  isTextArea,
  minLength = 0,
  maxLength,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(() => {
    if (typeof props.value === 'string') return props.value.length;
    if (typeof props.defaultValue === 'string')
      return props.defaultValue.length;
    return 0;
  });

  const belowMin = minLength > 0 && charCount < minLength;
  const atMax = maxLength !== undefined && charCount >= maxLength;
  const showCounter = isTextArea && (maxLength !== undefined || minLength > 0);

  const counterStatus: 'below' | 'at-max' | 'normal' = belowMin
    ? 'below'
    : atMax
    ? 'at-max'
    : 'normal';

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
        maxLength={maxLength}
        onChangeText={text => {
          setCharCount(text.length);
          props.onChangeText?.(text);
        }}
        onFocus={e => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={e => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
      />

      {showCounter && (
        <CounterRow>
          {belowMin && (
            <MinHint>faltam {minLength - charCount} para o mínimo</MinHint>
          )}
          {atMax && <MinHint isAtMax>limite atingido</MinHint>}
          <CharCount status={counterStatus}>
            {charCount}
            {maxLength !== undefined && `/${maxLength}`}
          </CharCount>
        </CounterRow>
      )}

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

const CounterRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  padding-horizontal: 4px;
`;

const MinHint = styled.Text<{ isAtMax?: boolean }>`
  font-size: 11px;
  color: ${({ theme, isAtMax }) =>
    isAtMax ? theme.colors.error : theme.colors.textSecondary};
`;

type CharCountStatus = 'below' | 'at-max' | 'normal';

const CharCount = styled.Text<{ status: CharCountStatus }>`
  font-size: 12px;
  margin-left: auto;
  color: ${({ theme, status }) => {
    if (status === 'below') return theme.colors.error;
    if (status === 'at-max') return theme.colors.error;
    return theme.colors.textSecondary;
  }};
`;

const ErrorText = styled.Text`
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error};
`;
