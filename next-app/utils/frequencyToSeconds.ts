export function frequencyToSeconds(value: string): number {
    const map: Record<string, number> = {
      daily: 86400,
      weekly: 7 * 86400,
      monthly: 30 * 86400,
    };
  
    return map[value] ?? 0;
  }
  