export interface DurationResult {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
}

export class SecondsToDurationConverter {
  apply = (totalSeconds: number): DurationResult => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return { hours, minutes, seconds, formatted };
  };
}
