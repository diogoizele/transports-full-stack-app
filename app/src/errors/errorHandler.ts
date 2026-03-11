import { isAxiosError } from 'axios';
import errorsMapper from './map.json';

export function handleError(error: unknown) {
  if (isAxiosError(error)) {
    const cause = error.response?.data.error;

    if (!cause) {
      return errorsMapper.default;
    }

    return (errorsMapper as Record<string, any>)[cause];
  } else {
    return errorsMapper.default;
  }
}
