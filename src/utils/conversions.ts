/** 1 inch = 25.4 mm */
const MM_PER_INCH = 25.4;

/** Convert millimeters to inches */
export function mmToInches(mm: number): number {
  return mm / MM_PER_INCH;
}

/** Convert inches to millimeters */
export function inchesToMm(inches: number): number {
  return inches * MM_PER_INCH;
}

/** Format mm for display (e.g. "210 mm") */
export function formatMm(value: number): string {
  return `${Math.round(value * 10) / 10} mm`;
}

/** Format inches for display (e.g. "8.27 in") */
export function formatInches(value: number): string {
  return `${Math.round(value * 100) / 100} in`;
}
