import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#111" },
  title: { fontSize: 18, marginBottom: 4, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 10, marginBottom: 20, color: "#555" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, marginBottom: 6, fontFamily: "Helvetica-Bold" },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 160, color: "#555" },
  value: { flex: 1 },
});

const SERVICIO_LABELS: Record<string, string> = {
  manifiesto: "Manifiesto Personalizado",
  manifiesto_descarga_gratuita: "Descarga gratuita del Manifiesto",
  cartografia: "Cartografía del Síntoma",
  magia_sanadora: "Magia Sanadora",
  ritual_matutino: "Ritual Matutino Personalizado",
};

function etiqueta(campo: string): string {
  return campo
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

function formatearValor(valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") return "—";
  if (Array.isArray(valor)) return valor.join(", ");
  return String(valor);
}

function fecha(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short" });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PedidoPdfDocument({ pedido }: { pedido: any }) {
  const datos = (pedido.datos ?? {}) as Record<string, unknown>;
  const camposDatos = Object.entries(datos).filter(([k]) => k !== "archivo");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Monje Urbano Libre — Pedido</Text>
        <Text style={styles.subtitle}>ID: {pedido.id}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicio</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Servicio</Text>
            <Text style={styles.value}>{SERVICIO_LABELS[pedido.servicio] ?? pedido.servicio}</Text>
          </View>
          {pedido.modalidad && (
            <View style={styles.row}>
              <Text style={styles.label}>Modalidad</Text>
              <Text style={styles.value}>{pedido.modalidad}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>¿Es regalo?</Text>
            <Text style={styles.value}>{pedido.es_regalo ? "Sí" : "No"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Estado</Text>
            <Text style={styles.value}>{pedido.estado}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Monto</Text>
            <Text style={styles.value}>
              {pedido.monto ? `${pedido.monto} ${pedido.moneda}` : "A confirmar"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Creado</Text>
            <Text style={styles.value}>{fecha(pedido.creado_en)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {pedido.es_regalo ? "Comprador (quien pagó el regalo)" : "Cliente"}
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>
              {formatearValor(pedido.comprador_nombre)} {formatearValor(pedido.comprador_apellido)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{formatearValor(pedido.comprador_email)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>WhatsApp</Text>
            <Text style={styles.value}>{formatearValor(pedido.comprador_whatsapp)}</Text>
          </View>
        </View>

        {pedido.es_regalo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Destinatario del regalo</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Nombre</Text>
              <Text style={styles.value}>
                {formatearValor(pedido.destinatario_nombre)} {formatearValor(pedido.destinatario_apellido)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{formatearValor(pedido.destinatario_email)}</Text>
            </View>
          </View>
        )}

        {camposDatos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Formulario completo</Text>
            {camposDatos.map(([campo, valor]) => (
              <View style={styles.row} key={campo}>
                <Text style={styles.label}>{etiqueta(campo)}</Text>
                <Text style={styles.value}>{formatearValor(valor)}</Text>
              </View>
            ))}
          </View>
        )}

        {pedido.como_supiste && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cómo se enteró</Text>
            <Text>{pedido.como_supiste}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
