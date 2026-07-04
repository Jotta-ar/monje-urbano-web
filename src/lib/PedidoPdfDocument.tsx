import fs from "fs";
import path from "path";
import { Document, Page, Text, View, Image, Font, StyleSheet } from "@react-pdf/renderer";

// Ruta local simple (NO file:// ni buffer): @react-pdf/font decide si algo
// es "URL" con una regex que exige "//" después del esquema — un file://
// la matchea (y termina en un fetch() que Node no soporta para ese
// protocolo), pero una ruta de sistema de archivos común cae en su loader
// local (fontkit.open), que es lo que realmente queremos.
Font.register({
  family: "Pirata One",
  src: path.join(process.cwd(), "src/fonts/PirataOne-Regular.ttf"),
});

const ACCENT = "#8a6d1f"; // dorado apagado, tono "luna" del sitio
const INK = "#161616";
const MUTED = "#6b6b6b";

const styles = StyleSheet.create({
  page: { padding: 44, fontSize: 10.5, fontFamily: "Helvetica", color: INK },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingBottom: 16,
    borderBottom: `2px solid ${ACCENT}`,
  },
  logo: { width: 190, height: 63 },
  headerRight: { alignItems: "flex-end" },
  eyebrow: { fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: 1.2 },
  title: { fontFamily: "Pirata One", fontSize: 22, color: INK, marginTop: 2 },
  idLine: { fontSize: 8, color: MUTED, marginTop: 2 },

  section: { marginBottom: 16 },
  sectionTitle: {
    fontFamily: "Pirata One",
    fontSize: 14,
    color: ACCENT,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: "0.5px solid #ddd",
  },
  row: { flexDirection: "row", marginBottom: 5 },
  label: { width: 150, color: MUTED },
  value: { flex: 1, color: INK },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 44,
    right: 44,
    borderTop: "0.5px solid #ddd",
    paddingTop: 8,
    fontSize: 8,
    color: MUTED,
    textAlign: "center",
  },
});

const SERVICIO_LABELS: Record<string, string> = {
  manifiesto: "Manifiesto Personalizado",
  manifiesto_descarga_gratuita: "Descarga gratuita del Manifiesto",
  cartografia: "Cartografía del Síntoma",
  magia_sanadora: "Magia Sanadora",
  ritual_matutino: "Ritual Matutino Personalizado",
};

const ESTADO_LABELS: Record<string, string> = {
  pendiente_pago: "Pendiente de pago",
  pagado_pendiente_formulario: "Pagado, esperando formulario",
  completado: "Completado",
};

function etiqueta(campo: string): string {
  return campo.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
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

function Fila({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const LOGO_BUFFER = fs.readFileSync(path.join(process.cwd(), "public/logos/logo-completo-negro.png"));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PedidoPdfDocument({ pedido }: { pedido: any }) {
  const datos = (pedido.datos ?? {}) as Record<string, unknown>;
  const camposDatos = Object.entries(datos).filter(([k]) => k !== "archivo");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={{ data: LOGO_BUFFER, format: "png" }} style={styles.logo} />
          <View style={styles.headerRight}>
            <Text style={styles.eyebrow}>Comprobante de pedido</Text>
            <Text style={styles.title}>Monje Urbano Libre</Text>
            <Text style={styles.idLine}>Pedido N.° {String(pedido.numero).padStart(6, "0")}</Text>
            <Text style={styles.idLine}>ID: {pedido.id}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicio</Text>
          <Fila label="Servicio" value={SERVICIO_LABELS[pedido.servicio] ?? pedido.servicio} />
          {pedido.modalidad && <Fila label="Modalidad" value={pedido.modalidad} />}
          <Fila label="¿Es regalo?" value={pedido.es_regalo ? "Sí" : "No"} />
          <Fila label="Estado" value={ESTADO_LABELS[pedido.estado] ?? pedido.estado} />
          <Fila label="Monto" value={pedido.monto ? `${pedido.monto} ${pedido.moneda}` : "A confirmar"} />
          <Fila label="Creado" value={fecha(pedido.creado_en)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {pedido.es_regalo ? "Comprador (quien pagó el regalo)" : "Cliente"}
          </Text>
          <Fila
            label="Nombre"
            value={`${formatearValor(pedido.comprador_nombre)} ${formatearValor(pedido.comprador_apellido)}`}
          />
          <Fila label="Email" value={formatearValor(pedido.comprador_email)} />
          <Fila label="WhatsApp" value={formatearValor(pedido.comprador_whatsapp)} />
        </View>

        {pedido.es_regalo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Destinatario del regalo</Text>
            <Fila
              label="Nombre"
              value={`${formatearValor(pedido.destinatario_nombre)} ${formatearValor(pedido.destinatario_apellido)}`}
            />
            <Fila label="Email" value={formatearValor(pedido.destinatario_email)} />
          </View>
        )}

        {camposDatos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Formulario completo</Text>
            {camposDatos.map(([campo, valor]) => (
              <Fila key={campo} label={etiqueta(campo)} value={formatearValor(valor)} />
            ))}
          </View>
        )}

        {pedido.como_supiste && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cómo se enteró</Text>
            <Text>{pedido.como_supiste}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Monje Urbano Libre · monjeurbanolibre.com · info@monjeurbanolibre.com
        </Text>
      </Page>
    </Document>
  );
}
