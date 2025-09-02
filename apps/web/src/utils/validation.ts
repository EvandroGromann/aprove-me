export function isUuidV4(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function isEmail(value: string): boolean {
  // Simples mas suficiente para validação client-side
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isIsoDate(value: string): boolean {
  const d = new Date(value);
  return !isNaN(d.getTime());
}

export function nonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function maxLen(value: string, max: number): boolean {
  return value.length <= max;
}

export function positiveNumber(value: number): boolean {
  return typeof value === 'number' && isFinite(value) && value > 0;
}
