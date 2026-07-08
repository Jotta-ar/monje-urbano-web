/** Turns a <form>'s FormData into a plain object, collapsing repeated-name fields (checkboxes) into arrays. */
export function formDataToObject(fd: FormData): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const key of new Set(fd.keys())) {
    const values = fd.getAll(key).map(String);
    out[key] = values.length > 1 ? values : values[0];
  }
  return out;
}

/**
 * Como formDataToObject, pero además sube cualquier <input type="file"> al
 * bucket "adjuntos" y guarda la ruta resultante en vez de stringificar el
 * File (que sin esto queda como basura tipo "[object File]"). Los campos de
 * archivo vacíos (nada seleccionado) se omiten del resultado.
 */
export async function formDataToObjectConArchivos(
  fd: FormData,
  carpeta: string
): Promise<Record<string, string | string[]>> {
  const { subirArchivo } = await import("@/lib/storage");
  const out: Record<string, string | string[]> = {};

  for (const key of new Set(fd.keys())) {
    const valores = fd.getAll(key);
    const resueltos = await Promise.all(
      valores.map((v) => (v instanceof File ? subirArchivo(v, carpeta) : Promise.resolve(String(v))))
    );
    const filtrados = resueltos.filter((v): v is string => v !== null);
    if (filtrados.length > 0) out[key] = filtrados.length > 1 ? filtrados : filtrados[0];
  }
  return out;
}
