import {
  parseISO,
  isToday,
  isYesterday,
  isThisWeek,
  format,
  parse,
  isValid,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

function safeParse(dateString: string): Date | null {
  let date = parseISO(dateString);
  if (isValid(date)) return date;

  date = new Date(dateString);
  if (isValid(date)) return date;

  const commonFormats = [
    'dd/MM/yyyy HH:mm:ss',
    'dd/MM/yyyy HH:mm',
    'yyyy-MM-dd HH:mm:ss',
    'yyyy-MM-dd HH:mm',
  ];

  for (const fmt of commonFormats) {
    date = parse(dateString, fmt, new Date());
    if (isValid(date)) return date;
  }

  return null;
}

export function formatFriendlyDate(dateString: string): string {
  const date = safeParse(dateString);

  if (!date) return 'Data inválida';

  if (isToday(date)) {
    return `Hoje às ${format(date, 'HH:mm')}`;
  }

  if (isYesterday(date)) {
    return `Ontem às ${format(date, 'HH:mm')}`;
  }

  if (isThisWeek(date, { locale: ptBR })) {
    return `${format(date, 'EEEE', { locale: ptBR })} às ${format(
      date,
      'HH:mm',
    )}`;
  }

  return `${format(date, 'dd/MM/yyyy')} às ${format(date, 'HH:mm')}`;
}
