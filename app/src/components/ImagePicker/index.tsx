import React, { ReactNode } from 'react';
import {
  Image,
  ImageSourcePropType,
  TouchableOpacityProps,
} from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import MaterialIcons from '@react-native-vector-icons/material-icons';

type RootProps = {
  children: ReactNode;
};

function Root({ children }: RootProps) {
  return <>{children}</>;
}

type PickerProps = TouchableOpacityProps;

function Picker({ ...rest }: PickerProps) {
  return (
    <AddImageButton {...rest}>
      <AddImageText>+</AddImageText>
    </AddImageButton>
  );
}

type PreviewProps = {
  source: ImageSourcePropType;
  onRemove: () => void;
};

function Preview({ source, onRemove }: PreviewProps) {
  const theme = useTheme();

  return (
    <ThumbContainer>
      <StyledImage source={source} />

      <RemoveButton onPress={onRemove} activeOpacity={0.8}>
        <MaterialIcons name="close" size={14} color={theme.colors.white} />
      </RemoveButton>
    </ThumbContainer>
  );
}

export const ImagePicker = Object.assign(Root, {
  Picker,
  Preview,
});

const AddImageButton = styled.TouchableOpacity`
  width: 72px;
  height: 72px;
  border-radius: 16px;
  border: 2px dashed ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const AddImageText = styled.Text`
  font-size: 28px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;

const StyledImage = styled(Image)`
  width: 72px;
  height: 72px;
  border-radius: 16px;
`;

const ThumbContainer = styled.View`
  width: 72px;
  height: 72px;
  border-radius: 16px;
  margin-right: 12px;
  position: relative;
`;

const RemoveButton = styled.TouchableOpacity`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 22px;
  height: 22px;
  border-radius: 11px;
  background-color: ${({ theme }) => theme.colors.error};
  align-items: center;
  justify-content: center;
  elevation: 3;
`;
