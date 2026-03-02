import { Record } from '../../../types/Record';

export interface RecordResponse
  extends Pick<Record, 'id' | 'type' | 'dateTime' | 'description'> {
  images: {
    id: string;
    url: string;
  }[];
}
