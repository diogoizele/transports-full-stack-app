export const toTimestamp = (date: string) => new Date(date).getTime();

export const dateResolver = (date?: string | Date) => {
  if (!date) return null;

  return date instanceof Date ? date.getTime() : new Date(date).getTime();
};
