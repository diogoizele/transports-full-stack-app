import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { RecordItemType } from '../components/RecordCardItem';
import { useRecordStore } from '../store/recordStore';
import { useImagePicker } from './useImagePicker';
import { RecordFormValues, useRecordForm } from './useRecordForm';

export const useRecordManager = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { records, addRecord, updateRecord, removeRecord } = useRecordStore();
  const imagePicker = useImagePicker();

  const resetFormState = useCallback(() => {
    setEditingId(null);

    imagePicker.clearImages();
  }, [imagePicker]);

  const handleSubmit = useCallback(
    async (formValues: RecordFormValues) => {
      if (!formValues.date) return;

      const input = {
        type: formValues.type as 'COMPRA' | 'VENDA',
        dateTime: dayjs(formValues.date).format('YYYY-MM-DD HH:mm:ss'),
        description: formValues.description,
        images: imagePicker.images
          .filter(img => !!img.uri)
          .map(img => ({ id: img.id, path: img.uri! })),
      };

      if (editingId) {
        await updateRecord(editingId, input);
      } else {
        await addRecord(input);
      }

      resetFormState();
      setIsFormOpen(false);
    },
    [editingId, imagePicker.images, addRecord, updateRecord, resetFormState],
  );

  const form = useRecordForm({
    onSubmit: handleSubmit,
  });

  const handleAddImage = useCallback(() => {
    Alert.alert('Adicionar imagem', 'Escolha uma opção', [
      { text: 'Galeria', onPress: imagePicker.pickFromGallery },
      { text: 'Câmera', onPress: imagePicker.takePhoto },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }, [imagePicker.pickFromGallery, imagePicker.takePhoto]);

  const handleEditRecord = useCallback(
    async (record: RecordItemType, shouldOpenImgPicker: boolean = false) => {
      const dto = records.find(r => r.id === record.id);
      if (!dto) return;

      form.resetForm({
        type: dto.type,
        date: dto.dateTime ? dayjs(dto.dateTime).toDate() : null,
        description: dto.description,
      });

      imagePicker.setImages(
        dto.images.map(img => ({ uri: img.path, id: img.id })),
      );

      setEditingId(dto.id);
      setIsFormOpen(true);

      if (shouldOpenImgPicker) {
        Alert.alert('Adicionar imagem', 'Escolha uma opção', [
          { text: 'Galeria', onPress: imagePicker.pickFromGallery },
          { text: 'Câmera', onPress: imagePicker.takePhoto },
          { text: 'Cancelar', style: 'cancel' },
        ]);
      }
    },
    [records, form, imagePicker],
  );

  const handleToggleForm = useCallback(() => {
    form.resetForm();
    resetFormState();
    setIsFormOpen(prevState => !prevState);
  }, [form, resetFormState]);

  const mappedRecords = useMemo(
    () =>
      records.map(record => ({
        id: record.id,
        type: record.type,
        date: record.dateTime,
        description: record.description,
        synced: record.synced,
        images: record.images?.map(img => ({ uri: img.path })) ?? [],
        user: record.user,
      })),
    [records],
  );

  const handleRemoveRecord = useCallback(
    async (record: { id: string; type: string }) => {
      const typeLabel = record.type === 'COMPRA' ? 'Compra' : 'Venda';
      Alert.alert(
        `Excluir registro de ${typeLabel}?`,
        'Esta ação não poderá ser desfeita',
        [
          { text: 'Sim, excluir', onPress: () => removeRecord(record.id) },
          { text: 'Cancelar', style: 'cancel' },
        ],
      );
    },
    [removeRecord],
  );

  return {
    records: mappedRecords,
    form: {
      values: form.values,
      errors: form.errors,
      disabledSubmit: form.disabledSubmit,
      isFormOpen,
      setValue: form.setValue,
      handleSubmit: form.handleSubmit,
      handleToggleForm,
    },
    imagePicker: {
      images: imagePicker.images,
      pickFromGallery: imagePicker.pickFromGallery,
      takePhoto: imagePicker.takePhoto,
      removeImage: imagePicker.removeImage,
      handleAddImage,
    },
    handleRemove: handleRemoveRecord,
    handleEdit: handleEditRecord,
  };
};
