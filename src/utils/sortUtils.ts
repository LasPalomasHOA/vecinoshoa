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

/**
 * Checks if a condo name falls within a given range (e.g. "A-101" to "A-108", or "101" to "108")
 */
export function isCondoInRange(condoName: string = '', fromStr: string = '', toStr: string = ''): boolean {
  const cleanCondo = String(condoName || '').trim().toUpperCase();
  const cleanFrom = String(fromStr || '').trim().toUpperCase();
  const cleanTo = String(toStr || '').trim().toUpperCase();

  if (!cleanFrom && !cleanTo) return true;

  const regex = /^([A-Z\s]+)?(?:-|\s*)?(\d+)?(.*)$/i;
  const matchCondo = cleanCondo.match(regex);
  const condoPrefix = (matchCondo?.[1] || '').trim();
  const condoNum = matchCondo?.[2] ? parseInt(matchCondo[2], 10) : null;

  const matchFrom = cleanFrom ? cleanFrom.match(regex) : null;
  const fromPrefix = (matchFrom?.[1] || '').trim();
  const fromNum = matchFrom?.[2] ? parseInt(matchFrom[2], 10) : null;

  const matchTo = cleanTo ? cleanTo.match(regex) : null;
  const toPrefix = (matchTo?.[1] || '').trim();
  const toNum = matchTo?.[2] ? parseInt(matchTo[2], 10) : null;

  // Case 1: Purely numerical range (e.g. 101 to 108) across all towers or within a tower
  if (cleanFrom && !fromPrefix && fromNum !== null && cleanTo && !toPrefix && toNum !== null) {
    if (condoNum === null) return false;
    return condoNum >= fromNum && condoNum <= toNum;
  }
  if (cleanFrom && !fromPrefix && fromNum !== null && !cleanTo) {
    if (condoNum === null) return false;
    return condoNum >= fromNum;
  }
  if (cleanTo && !toPrefix && toNum !== null && !cleanFrom) {
    if (condoNum === null) return false;
    return condoNum <= toNum;
  }

  // Case 2: Same prefix specified in both bounds (e.g. "A-101" to "A-108")
  if (fromPrefix && toPrefix && fromPrefix === toPrefix) {
    if (condoPrefix !== fromPrefix) return false;
    if (fromNum !== null && toNum !== null && condoNum !== null) {
      const minNum = Math.min(fromNum, toNum);
      const maxNum = Math.max(fromNum, toNum);
      return condoNum >= minNum && condoNum <= maxNum;
    }
  }

  // Case 3: Standard natural order range comparison
  if (cleanFrom) {
    if (fromPrefix && condoPrefix !== fromPrefix) return false;
    if (compareCondoNames(cleanCondo, cleanFrom) < 0) return false;
  }
  if (cleanTo) {
    if (toPrefix && condoPrefix !== toPrefix) return false;
    if (compareCondoNames(cleanCondo, cleanTo) > 0) return false;
  }

  return true;
}

/**
 * Parses queries like "A-101 al A-108", "A-101 - A-108", "del A-101 al A-108"
 */
export function parseCondoRangeString(query: string = ''): { from: string; to: string } | null {
  const clean = String(query || '').trim();
  if (!clean) return null;

  const rangeRegex = /^(?:del\s+)?([A-Za-z]?\s*-?\s*\d+[A-Za-z]?)\s*(?:-|al|a|hasta|to)\s*([A-Za-z]?\s*-?\s*\d+[A-Za-z]?)$/i;
  const match = clean.match(rangeRegex);
  if (match) {
    return {
      from: match[1].trim().toUpperCase(),
      to: match[2].trim().toUpperCase()
    };
  }
  return null;
}
