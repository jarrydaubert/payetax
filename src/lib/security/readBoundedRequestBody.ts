/** Returns null on overflow; read failures propagate to the route's existing 400 handler. */
export async function readBoundedRequestBody(
  request: Request,
  maxBytes: number,
): Promise<string | null> {
  if (!request.body) return '';

  const reader = request.body.getReader();
  const buffer = new Uint8Array(maxBytes);
  let size = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value.byteLength > maxBytes - size) {
        // A stalled or failed cancellation must not delay the 413 response.
        reader.cancel().catch(() => {});
        return null;
      }

      buffer.set(value, size);
      size += value.byteLength;
    }

    return new TextDecoder().decode(buffer.subarray(0, size));
  } finally {
    reader.releaseLock();
  }
}
