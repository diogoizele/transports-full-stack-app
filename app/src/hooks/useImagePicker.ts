import { useState } from 'react';
import {
  launchCamera,
  launchImageLibrary,
  Asset,
  ImageLibraryOptions,
  CameraOptions,
} from 'react-native-image-picker';

export function useImagePicker() {
  const [images, setImages] = useState<Asset[]>([]);

  const handleResult = (assets?: Asset[]) => {
    if (!assets?.length) return;
    setImages(prev => [...prev, ...assets]);
  };

  const pickFromGallery = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 0, // múltiplas
      quality: 0.8,
    };

    const result = await launchImageLibrary(options);
    if (!result.didCancel && !result.errorCode) {
      handleResult(result.assets);
    }
  };

  const takePhoto = async () => {
    const options: CameraOptions = {
      mediaType: 'photo',
      saveToPhotos: true,
      quality: 0.8,
    };

    const result = await launchCamera(options);
    if (!result.didCancel && !result.errorCode) {
      handleResult(result.assets);
    }
  };

  const removeImage = (uri: string) => {
    setImages(prev => prev.filter(img => img.uri !== uri));
  };

  const clearImages = () => {
    setImages([]);
  };

  return {
    images,
    pickFromGallery,
    takePhoto,
    removeImage,
    clearImages,
    setImages,
  };
}
