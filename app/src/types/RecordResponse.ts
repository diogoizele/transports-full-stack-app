import { Record } from '../../../types/Record';

export interface RecordResponse
  extends Pick<
    Record,
    'id' | 'type' | 'dateTime' | 'description' | 'companyId' | 'userId'
  > {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  images: {
    id: string;
    url: string;
  }[];
}
