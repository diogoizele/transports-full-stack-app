import React, { useState } from 'react';
import styled, { css } from 'styled-components/native';
import DatePicker from 'react-native-date-picker';

interface DatePickerFieldProps {
  label?: string;
  error?: string;
  disabled?: boolean;

  value?: Date | null;
  mode?: 'date' | 'time' | 'datetime';
  onChange: (date: Date) => void;

  placeholder?: string;

  minimumDate?: Date;
  maximumDate?: Date;

  locale?: string;
  minuteInterval?: 1 | 5 | 10 | 15 | 30;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  error,
  disabled,
  value,
  mode = 'datetime',
  onChange,
  placeholder = 'Selecionar data',
  minimumDate,
  maximumDate,
  locale = 'pt-BR',
  minuteInterval = 1,
}) => {
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value ?? new Date());
  const [isFocused, setIsFocused] = useState(false);

  const handleOpen = () => {
    if (disabled) return;
    setTempDate(value ?? new Date());
    setIsFocused(true);
    setOpen(true);
  };

  const handleClose = () => {
    setIsFocused(false);
    setOpen(false);
  };

  const handleConfirm = (selectedDate: Date) => {
    onChange(selectedDate);
    handleClose();
  };

  const formatValue = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleString(locale);
  };

  return (
    <Container>
      {label && <Label>{label}</Label>}

      <Selector
        activeOpacity={0.8}
        onPress={handleOpen}
        hasError={!!error}
        isFocused={isFocused}
        isDisabled={!!disabled}
      >
        <SelectedText isPlaceholder={!value}>
          {value ? formatValue(value) : placeholder}
        </SelectedText>
      </Selector>

      {error && <ErrorText>{error}</ErrorText>}

      <DatePicker
        modal
        open={open}
        date={tempDate}
        mode={mode}
        locale={locale}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        minuteInterval={minuteInterval}
        onConfirm={handleConfirm}
        onCancel={handleClose}
      />
    </Container>
  );
};

export default DatePickerField;

/* styled */

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

type SelectorProps = {
  hasError: boolean;
  isFocused: boolean;
  isDisabled: boolean;
};

const Selector = styled.TouchableOpacity<SelectorProps>`
  border-width: 1px;
  border-radius: 8px;
  padding-vertical: 12px;
  padding-horizontal: 16px;

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

const SelectedText = styled.Text<{ isPlaceholder: boolean }>`
  font-size: 16px;
  color: ${({ theme, isPlaceholder }) =>
    isPlaceholder ? '#A0A0A0' : theme.colors.text};
`;

const ErrorText = styled.Text`
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error};
`;
