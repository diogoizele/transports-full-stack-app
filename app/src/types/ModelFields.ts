import { Model } from '@nozbe/watermelondb';

export type ModelFields<
  T extends Model,
  TRelations extends keyof T = never,
> = Omit<T, keyof Model | TRelations> & { id: string };
