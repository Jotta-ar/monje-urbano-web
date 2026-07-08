import { supabase } from "@/lib/supabase";

/**
 * Sube un archivo al bucket privado "adjuntos" y devuelve la RUTA guardada
 * (no una URL pública — el bucket es privado, porque algunos de estos
 * archivos son sensibles). Para mostrárselo al admin hace falta generar una
 * URL firmada del lado del servidor con la service_role key.
 */
export async function subirArchivo(file: File, carpeta: string): Promise<string | null> {
  if (!supabase || !file || file.size === 0) return null;
  const ext = file.name.split(".").pop() || "bin";
  const path = `${carpeta}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("adjuntos").upload(path, file);
  if (error) {
    console.error("subirArchivo falló:", error);
    return null;
  }
  return path;
}
