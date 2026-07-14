import { ValueTransformer } from 'typeorm';

export class NumericTransformer implements ValueTransformer {
  to(value: number | string | null): number | null {
    if (value === null || value === undefined) return null;
    return Number(value);
  }

  from(value: number | string | null): number | null {
    if (value === null || value === undefined) return null;
    return Number(value);
  }
}
