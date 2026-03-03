import React, { useState } from 'react';
import { Modal, FlatList, TouchableOpacity, View } from 'react-native';
import styled, { css } from 'styled-components/native';

export type DropdownOption = {
  id: string;
  title: string;
};

interface DropdownProps {
  label?: string;
  error?: string;
  disabled?: boolean;
  value?: string; // id selecionado
  options: DropdownOption[];
  placeholder?: string;
  onChange: (option: DropdownOption) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  error,
  disabled,
  value,
  options,
  placeholder = 'Selecionar...',
  onChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const selectedOption = options.find(o => o.id === value);

  const handleOpen = () => {
    if (disabled) return;
    setIsFocused(true);
    setVisible(true);
  };

  const handleClose = () => {
    setIsFocused(false);
    setVisible(false);
  };

  const handleSelect = (option: DropdownOption) => {
    onChange(option);
    handleClose();
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
        <SelectedText isPlaceholder={!selectedOption}>
          {selectedOption?.title ?? placeholder}
        </SelectedText>
      </Selector>

      {error && <ErrorText>{error}</ErrorText>}

      <Modal visible={visible} transparent animationType="fade">
        <Overlay activeOpacity={1} onPress={handleClose}>
          <ModalContent>
            <FlatList
              data={options}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <OptionButton onPress={() => handleSelect(item)}>
                  <OptionText>{item.title}</OptionText>
                </OptionButton>
              )}
              ItemSeparatorComponent={() => <Separator />}
            />
          </ModalContent>
        </Overlay>
      </Modal>
    </Container>
  );
};

export default Dropdown;

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

const Selector = styled(TouchableOpacity)<SelectorProps>`
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

const Overlay = styled(TouchableOpacity)`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.3);
  justify-content: center;
  padding: 24px;
`;

const ModalContent = styled(View)`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  padding-vertical: 8px;
`;

const OptionButton = styled(TouchableOpacity)`
  padding-vertical: 14px;
  padding-horizontal: 16px;
`;

const OptionText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

const Separator = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`;
