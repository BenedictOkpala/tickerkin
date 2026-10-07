export function parsePositiveDecimal(value: unknown): number | null {
 if (typeof value !== "string" || !/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(value)) return null;
 const parsed = Number(value);
 return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
