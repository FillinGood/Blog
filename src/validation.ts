/**
 * custom validation error class
 *
 * Replaces '{}' with field name in message
 */
export class ValidationError extends Error {
  get name() {
    return this._name;
  }
  constructor(private _name: string, message: string) {
    super(message.replace(/\{\}/g, _name));
  }
}

function assertNotNull(name: string, val: any) {
  if (val === undefined || val === null)
    throw new ValidationError(name, '{} is required');
}

interface ValidationRequired {
  /** ...not empty... */
  notEmpty: ValidationRequiredNotEmpty;
  /** ...and is a string */
  string(name: string, val: any): string;
  /** ...and is a number */
  number(name: string, val: any): number;
}
interface ValidationRequiredNotEmpty {
  /** ...and is a string */
  string(name: string, val: any): string;
  /** ...and is a number */
  number(name: string, val: any): number;
}
interface ValidationNotEmpty {
  /** ...and is a string if present */
  string(name: string, val: any): string | undefined;
  /** ...and is a number if present */
  number(name: string, val: any): number | undefined;
}
interface Validation {
  /** ...value is not undefined... */
  required: ValidationRequired;
  /** ...not empty... */
  notEmpty: ValidationNotEmpty;
  /** ...and is a string if present */
  string(name: string, val: any): string | undefined;
  /** ...and is a number if present */
  number(name: string, val: any): number | undefined;
}

/** Make sure... */
export const validate: Validation = {
  required: {
    string(name: string, val: any) {
      assertNotNull(name, val);
      const v = String(val);
      return v;
    },
    number(name: string, val: any) {
      assertNotNull(name, val);
      const v = +val;
      if (isNaN(v)) throw new ValidationError(name, '{} must be a number');
      return v;
    },
    notEmpty: {
      string(name: string, val: any) {
        assertNotNull(name, val);
        const v = String(val);
        if (v.length === 0) throw new ValidationError(name, '{} must not be empty');
        return v;
      },
      number(name: string, val: any) {
        assertNotNull(name, val);
        const v = +val;
        if (isNaN(v)) throw new ValidationError(name, '{} must be a number');
        if (v === 0) throw new ValidationError(name, '{} must not be a zero');
        return v;
      }
    }
  },
  string(name: string, val: any) {
    if (val === undefined || val === null) return undefined;
    return val as string;
  },
  number(name: string, val: any) {
    if (val === undefined || val === null) return undefined;
    const v = +val;
    if (isNaN(v)) throw new ValidationError(name, '{} must be a number');
    return v;
  },
  notEmpty: {
    string(name: string, val: any) {
      if (val === undefined || val === null) return undefined;
      const v = String(val);
      if (v.length === 0) throw new ValidationError(name, '{} must not be empty');
      return v;
    },
    number(name: string, val: any) {
      if (val === undefined || val === null) return undefined;
      const v = +val;
      if (isNaN(v)) throw new ValidationError(name, '{} must be a number');
      if (v === 0) throw new ValidationError(name, '{} must not be a zero');
      return v;
    }
  }
};
