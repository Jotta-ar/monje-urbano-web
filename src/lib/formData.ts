/** Turns a <form>'s FormData into a plain object, collapsing repeated-name fields (checkboxes) into arrays. */
export function formDataToObject(fd: FormData): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const key of new Set(fd.keys())) {
    const values = fd.getAll(key).map(String);
    out[key] = values.length > 1 ? values : values[0];
  }
  return out;
}
