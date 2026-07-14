export class DateToIsoConverter {
  apply = (date: Date): string => {
    return date.toISOString();
  };
}
