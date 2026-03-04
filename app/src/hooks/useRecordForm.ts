import { useMemo, useRef, useState } from 'react';

export type RecordFormValues = {
  type: '' | 'COMPRA' | 'VENDA';
  date: Date | null;
  description: string;
};

type RecordFormErrors = {
  type?: string;
  date?: string;
  description?: string;
};

type UseRecordFormParams = {
  initialValues?: Partial<RecordFormValues>;
  onSubmit: (values: RecordFormValues) => void;
};

export function useRecordForm({
  initialValues,
  onSubmit,
}: UseRecordFormParams) {
  const initialRef = useRef<RecordFormValues>({
    type: initialValues?.type ?? '',
    date: initialValues?.date ?? null,
    description: initialValues?.description ?? '',
  });

  const [values, setValues] = useState<RecordFormValues>(initialRef.current);
  const [errors, setErrors] = useState<RecordFormErrors>({});

  function setValue<K extends keyof RecordFormValues>(
    field: K,
    value: RecordFormValues[K],
  ) {
    setValues(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const newErrors: RecordFormErrors = {};

    if (!values.type) {
      newErrors.type = 'Selecione o tipo';
    }

    if (!values.date) {
      newErrors.date = 'Selecione a data';
    }

    if (!values.description || values.description.trim().length < 10) {
      newErrors.description = 'Descrição deve ter no mínimo 10 caracteres';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    onSubmit({
      type: values.type as 'COMPRA' | 'VENDA',
      date: values.date as Date,
      description: values.description.trim(),
    });
  }

  function resetForm(nextValues?: Partial<RecordFormValues>) {
    const baseValues: RecordFormValues = {
      ...initialRef.current,
      ...nextValues,
    };

    initialRef.current = nextValues
      ? baseValues
      : { date: null, description: '', type: '' };
    setValues(baseValues);
    setErrors({});
  }

  const disabledSubmit = useMemo(() => {
    return (
      !values.type ||
      !values.date ||
      !values.description ||
      values.description.trim().length < 10
    );
  }, [values]);

  return {
    values,
    errors,
    setValue,
    handleSubmit,
    resetForm,
    disabledSubmit,
  };
}
