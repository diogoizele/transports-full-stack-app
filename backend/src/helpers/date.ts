export const toTimestamp = (date: string) => new Date(date).getTime();

export const dateResolver = (date?: string | Date) => {
  if (!date) return null;

  if (date instanceof Date) {
    return date.getTime();
  }

  return Date.parse(date.replace(" ", "T") + "Z");
};

export const toMySQLDateTime = (date: string | Date): string => {
  const d = new Date(date);

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
