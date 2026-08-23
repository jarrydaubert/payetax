const ISO_DATE_PREFIX_PATTERN = /^(\d{4}-\d{2}-\d{2})(?:T.+)?$/;

function parseIsoContentDate(value: string | undefined): number | null {
  const datePrefix = value?.match(ISO_DATE_PREFIX_PATTERN)?.[1];
  if (!(value && datePrefix)) return null;

  const calendarTimestamp = Date.parse(`${datePrefix}T00:00:00.000Z`);
  if (
    Number.isNaN(calendarTimestamp) ||
    new Date(calendarTimestamp).toISOString().slice(0, 10) !== datePrefix
  ) {
    return null;
  }

  const timestamp = value === datePrefix ? calendarTimestamp : Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function getLatestContentDate(values: Iterable<string | undefined>): string | undefined {
  let latestTimestamp: number | null = null;

  for (const value of values) {
    const timestamp = parseIsoContentDate(value);
    if (timestamp === null || (latestTimestamp !== null && timestamp <= latestTimestamp)) continue;
    latestTimestamp = timestamp;
  }

  return latestTimestamp === null
    ? undefined
    : new Date(latestTimestamp).toISOString().slice(0, 10);
}
