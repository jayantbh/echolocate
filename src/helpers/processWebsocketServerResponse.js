export function serializeResponse(payload) {
  try {
    return JSON.parse(payload);
  } catch (e) {
    return payload;
  }
}
