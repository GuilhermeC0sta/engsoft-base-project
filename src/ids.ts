const MAX_RANDOM_SUFFIX = 10000;

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * MAX_RANDOM_SUFFIX)}`;
}
