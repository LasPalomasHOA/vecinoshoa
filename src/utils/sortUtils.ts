/**
 * Natural Alphanumeric Comparison for Condos / Properties
 * Handles:
 *  - Letter prefix in alphabetical order (A, B, C, D...)
 *  - Number in ascending numerical order (101, 102, 201... 1001, 1002, 1101...)
 *  - Sub-units / suffixes (A-101-A, PH-1, etc.)
 */
export function compareCondoNames(nameA: string = '', nameB: string = ''): number {
  if (!nameA && !nameB) return 0;
  if (!nameA) return 1;
  if (!nameB) return -1;

  const cleanA = String(nameA).trim().toUpperCase();
  const cleanB = String(nameB).trim().toUpperCase();

  // Extract prefix letter(s), number, and optional suffix
  const regex = /^([A-Z\s]+)?(?:-|\s*)?(\d+)?(.*)$/i;
  const matchA = cleanA.match(regex);
  const matchB = cleanB.match(regex);

  const prefixA = (matchA?.[1] || '').trim();
  const prefixB = (matchB?.[1] || '').trim();
  const numA = matchA?.[2] ? parseInt(matchA[2], 10) : null;
  const numB = matchB?.[2] ? parseInt(matchB[2], 10) : null;
  const restA = (matchA?.[3] || '').trim();
  const restB = (matchB?.[3] || '').trim();

  // 1. Compare Tower / Prefix alphabetically
  if (prefixA !== prefixB) {
    return prefixA.localeCompare(prefixB);
  }

  // 2. Compare Unit number numerically
  if (numA !== null && numB !== null) {
    if (numA !== numB) {
      return numA - numB;
    }
  } else if (numA !== null) {
    return -1;
  } else if (numB !== null) {
    return 1;
  }

  // 3. Compare suffix / remainder naturally
  return restA.localeCompare(restB, undefined, { numeric: true, sensitivity: 'base' });
}

export function sortPropertiesNatural<T extends { nombre: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => compareCondoNames(a.nombre, b.nombre));
}
