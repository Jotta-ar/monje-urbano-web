import Image from "next/image";
import Link from "next/link";
import PriceTag from "@/components/PriceTag";
import TestimonialTeaser from "@/components/semillas/TestimonialTeaser";
import NewsletterForm from "@/components/NewsletterForm";
import ContactForm from "@/components/ContactForm";
import RevealObserver from "@/components/RevealObserver";
import ComingSoonButton from "@/components/ComingSoonButton";

export default function Home() {
  return (
    <>
      <RevealObserver />
      {/* HERO */}
      <section id="inicio" className="hero">
        <div className="hero-content">
          <div className="hero-logo">
            <Image
              src="/logos/logo-completo-blanco.png"
              alt="Monje Urbano Libre"
              width={380}
              height={861}
              priority
            />
          </div>
          <p className="tagline">Silencio, presencia y propósito.</p>
          <span className="hero-scroll">Deslizá para conocer más</span>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios">
        <div className="container">
          <div className="reveal">
            <h2 className="section-title">Servicios</h2>
            <p className="section-sub">
              Herramientas espirituales para tu camino de regreso a vos
            </p>
          </div>
          <div className="cards-grid stagger-cards">
            <div className="card">
              <h3 className="card-title">Magia Sanadora</h3>
              <p className="card-desc">
                Rituales energéticos a distancia, realizados en meditación profunda e
                intención pura, para canalizar sanación sin contacto presencial.
              </p>
              <a href="#magia-sanadora" className="card-btn">Ver más</a>
            </div>
            <div className="card">
              <h3 className="card-title">Manifiesto Personalizado</h3>
              <p className="card-desc">
                Documento canalizado a medida a partir de un formulario, que ofrece una
                guía espiritual y reflexiva personalizada. Un ritual para volver a vos.
              </p>
              <a href="#manifiesto-personalizado" className="card-btn">Ver más</a>
            </div>
            <div className="card">
              <h3 className="card-title">Cartografía del Síntoma</h3>
              <p className="card-desc">
                Lectura profunda que vincula síntomas físicos con emociones, memorias y
                leyes universales, revelando el mensaje del cuerpo como mapa del alma.
              </p>
              <a href="#cartografia" className="card-btn">Ver más</a>
            </div>
            <div className="card">
              <h3 className="card-title">Ritual Matutino Personalizado</h3>
              <p className="card-desc">
                Rutina diaria creada en base a tu perfil, integrando respiración,
                intención y conexión interior para comenzar cada día desde tu centro.
              </p>
              <a href="#ritual-matutino" className="card-btn">Ver más</a>
            </div>
          </div>
        </div>
      </section>

      {/* MAGIA SANADORA */}
      <section id="magia-sanadora">
        <div className="container text-block">
          <div className="reveal">
            <h2 className="section-title">Magia Sanadora</h2>
            <p className="section-sub" style={{ marginBottom: 36 }}>
              Camino invisible, efecto evidente.
            </p>
          </div>

          <div className="reveal">
            <h3>Descripción</h3>
            <p>
              Hay dolores que no entienden de distancias. Sangran, arden o laten en
              silencio, esperando una mano invisible que los alcance. En el silencio de
              mi altar, invoco la magia que no se aprende en libros, la que viaja por
              caminos invisibles y reconoce tu cuerpo como si fuera el mío. Con tu nombre
              como llave y la imagen de la zona que reclama alivio, convoco la energía
              que todo lo restaura, los símbolos que despiertan la memoria de la salud.
              Tres, seis o nueve veces, como un pulso sagrado, la luz atraviesa el
              tiempo y el espacio hasta encontrar tu herida. Y allí, donde antes habitaba
              el dolor, comienza a nacer la calma. Esta es mi magia. Y hoy, puede ser
              también tu sanación.
            </p>
          </div>

          <div className="reveal-left">
            <h3>Para quién es</h3>
            <ul>
              <li>Dolor físico puntual o recurrente que &quot;no afloja&quot;</li>
              <li>Procesos emocionales que tensan el cuerpo (ansiedad, duelo, estrés)</li>
              <li>Recuperación o acompañamiento en tratamientos</li>
              <li>Cuando necesitás ayuda ahora, aunque estemos lejos</li>
            </ul>
          </div>

          <div className="reveal-right">
            <h3>Qué recibís</h3>
            <ul>
              <li>Ritual energético a distancia, hecho a tu nombre y a tu caso</li>
              <li>Foco en una zona o tema específico</li>
              <li>Posibilidad de trabajar en serie 3 / 6 / 9 según la profundidad del proceso</li>
            </ul>
          </div>

          <div className="reveal">
            <h3>Cómo funciona</h3>
            <ul>
              <li>Pedís tu magia y completás un breve formulario</li>
              <li>Acordamos día y horario para realizarla</li>
              <li>Realizo el ritual en mi altar, en silencio y presencia</li>
              <li>Te aviso al terminar</li>
            </ul>
          </div>

          <div className="reveal">
            <h3>Duración y modalidades</h3>
            <ul>
              <li><strong>Única:</strong> 1 ritual puntual</li>
              <li><strong>Serie 3:</strong> 3 rituales</li>
              <li><strong>Serie 6 y 9:</strong> para procesos más profundos</li>
            </ul>
          </div>

          <div className="reveal">
            <h3>Preguntas frecuentes</h3>
            <div className="faq-grid" style={{ marginTop: 20 }}>
              <div className="faq-item">
                <strong>¿Se siente algo a la distancia?</strong>
                <span>A veces sí (calor, calma, sueño). Otras, el cambio es sutil y aparece en las horas siguientes.</span>
              </div>
              <div className="faq-item">
                <strong>¿Puede complementarse con otros tratamientos?</strong>
                <span>Sí. No reemplaza cuidados médicos ni psicológicos; acompaña.</span>
              </div>
              <div className="faq-item">
                <strong>¿Para otra persona?</strong>
                <span>Sí, con su consentimiento.</span>
              </div>
              <div className="faq-item">
                <strong>¿Qué pasa si no percibo nada?</strong>
                <span>La energía actúa igual. Observá las horas/días siguientes.</span>
              </div>
            </div>
          </div>

          <div className="reveal" style={{ textAlign: "center", margin: "30px 0" }}>
            <PriceTag
              ids={["magia_unica", "magia_serie3", "magia_serie6", "magia_serie9"]}
              labels={["Única", "Serie 3", "Serie 6", "Serie 9"]}
            />
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/pedir/magia-sanadora" className="btn-primary">Pedir Magia Sanadora</Link>
              <Link href="/consultas?servicio=Magia+Sanadora" className="btn-outline">Consultas</Link>
            </div>
          </div>

          <TestimonialTeaser servicio="Magia Sanadora" />
        </div>
      </section>

      {/* MANIFIESTO PERSONALIZADO */}
      <section id="manifiesto-personalizado">
        <div className="container text-block">
          <div className="reveal">
            <h2 className="section-title">Manifiesto Personalizado</h2>
            <p className="section-sub" style={{ marginBottom: 36 }}>Un ritual para volver a vos.</p>
          </div>

          <div className="reveal">
            <p>
              En un mundo que acelera y confunde, detenerse a escuchar la voz interior
              es un acto de coraje. Los Manifiestos Personalizados son guías escritas
              desde la presencia y la conexión profunda con tu esencia. No son frases
              motivacionales ni fórmulas generales: son textos sagrados, únicos,
              creados a partir de tu historia, tus búsquedas, tus silencios y tus
              anhelos más íntimos.
            </p>
          </div>

          <div className="reveal-left">
            <h3>Para quién es</h3>
            <ul>
              <li>Reconectar con tu propósito</li>
              <li>Marcar el inicio de una nueva etapa</li>
              <li>Anclar una decisión o proyecto personal</li>
              <li>Honrar tu historia desde un lugar más consciente</li>
              <li>Regalar un mensaje significativo a alguien amado</li>
            </ul>
          </div>

          <div className="reveal">
            <h3>Qué recibís</h3>
            <ul><li>Manifiesto Personalizado en PDF</li></ul>
          </div>

          <div className="reveal">
            <h3>Cómo funciona</h3>
            <ul>
              <li>Completás un formulario breve con datos y foco del manifiesto</li>
              <li>Leo tu historia, integro señales y defino el tono</li>
              <li>Recibís tu manifiesto por email en PDF (3-5 días hábiles)</li>
            </ul>
          </div>

          <div className="reveal" style={{ textAlign: "center", margin: "30px 0" }}>
            <PriceTag ids={["manifiesto"]} labels={["Precio único"]} />
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/pedir/manifiesto" className="btn-primary">Pedir Manifiesto Personalizado</Link>
              <Link href="/consultas?servicio=Manifiesto+Personalizado" className="btn-outline">Consultas</Link>
            </div>
          </div>

          <TestimonialTeaser servicio="Manifiesto Personalizado" />
        </div>
      </section>

      {/* CARTOGRAFÍA */}
      <section id="cartografia">
        <div className="container text-block">
          <div className="reveal">
            <h2 className="section-title">Cartografía del Síntoma</h2>
            <p className="section-sub" style={{ marginBottom: 36 }}>
              Tu cuerpo habla. Yo traduzco su mensaje en una dirección clara.
            </p>
          </div>

          <div className="reveal">
            <p>
              Cuando un síntoma se repite o se instala en el cuerpo, no siempre está
              pidiendo un remedio. Muchas veces está pidiendo ser escuchado. La
              Cartografía del Síntoma es un servicio espiritual y simbólico que
              decodifica el mensaje emocional detrás de un síntoma físico y lo
              transforma en una dirección clara para tu bienestar interior.
            </p>
          </div>

          <div className="reveal-left">
            <h3>Para quién es</h3>
            <ul>
              <li>Quien siente que su cuerpo está diciendo algo y desea comprender su lenguaje oculto</li>
              <li>Personas con síntomas físicos recurrentes que buscan explorar la raíz emocional</li>
              <li>Quienes atraviesan un cambio vital (estrés, duelo, crisis, decisiones)</li>
              <li>Quienes eligen un proceso íntimo, en conexión consigo mismos</li>
            </ul>
          </div>

          <div className="reveal-right">
            <h3>Qué recibís</h3>
            <ul>
              <li>Lectura emocional personalizada de uno o más síntomas físicos</li>
              <li>Ritual práctico de 7 días para mover la energía</li>
              <li>5 afirmaciones en primera persona, adaptadas a tu caso</li>
              <li>1 ajuste textual sin cargo</li>
              <li>Entrega en PDF dentro de 3 a 5 días hábiles</li>
            </ul>
          </div>

          <div className="reveal" style={{ textAlign: "center", margin: "30px 0" }}>
            <PriceTag
              ids={["cartografia_pdf", "cartografia_combo"]}
              labels={["Cartografía (PDF)", "+ Magia Sanadora (3 sesiones)"]}
            />
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/pedir/cartografia" className="btn-primary">Pedir Cartografía del Síntoma</Link>
              <Link href="/consultas?servicio=Cartograf%C3%ADa+del+S%C3%ADntoma" className="btn-outline">Consultas</Link>
            </div>
          </div>

          <TestimonialTeaser servicio="Cartografía del Síntoma" />
        </div>
      </section>

      {/* RITUAL MATUTINO */}
      <section id="ritual-matutino">
        <div className="container text-block">
          <div className="reveal">
            <h2 className="section-title">Ritual Matutino Personalizado</h2>
            <p className="section-sub" style={{ marginBottom: 36 }}>
              Un anclaje diario para reconectar con tu verdadero centro
            </p>
          </div>

          <div className="reveal">
            <p>
              En un mundo que corre sin pausa y arrastra la atención hacia lo externo,
              crear un momento sagrado al comenzar el día ya no es un lujo: es una
              necesidad del alma. El Ritual Matutino Personalizado es una guía única,
              diseñada a partir de tu esencia, tu momento vital y tu búsqueda interior.
            </p>
          </div>

          <div className="reveal-left">
            <h3>Para quién es</h3>
            <ul>
              <li>Quienes sienten que necesitan orden interno y no encuentran por dónde empezar</li>
              <li>Quienes probaron múltiples rutinas sin que ninguna les hable de verdad</li>
              <li>Quienes saben que las grandes transformaciones nacen en lo sutil, en lo ritual</li>
              <li>Quienes buscan una práctica breve, clara y personalizada</li>
            </ul>
          </div>

          <div className="reveal">
            <h3>Qué recibís</h3>
            <ul>
              <li>Ritual Matutino Personalizado en PDF listo para imprimir</li>
              <li>Guía de uso con sugerencias de práctica (21/45/90 días)</li>
            </ul>
          </div>

          <div className="reveal" style={{ textAlign: "center", margin: "30px 0" }}>
            <PriceTag ids={["ritual_matutino"]} labels={["Ritual Matutino (PDF)"]} />
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/pedir/ritual-matutino" className="btn-primary">Comprar</Link>
              <Link href="/consultas?servicio=Ritual+Matutino+Personalizado" className="btn-outline">Consultas</Link>
            </div>
          </div>

          <TestimonialTeaser servicio="Ritual Matutino Personalizado" />
        </div>
      </section>

      {/* PRODUCTOS */}
      <section id="productos">
        <div className="container">
          <div className="reveal">
            <h2 className="section-title">Productos</h2>
            <p className="section-sub">Objetos sagrados para acompañar tu camino</p>
          </div>
          <div className="prod-grid stagger-cards">
            <div className="prod-card">
              <h3>Talismanes del Monje Urbano Libre</h3>
              <p className="prod-sub">
                Amuletos de madera grabados con el símbolo sagrado, creados para acompañar
                procesos de transformación y presencia.
              </p>
              <a href="#producto-talismanes" className="card-btn">Ver más</a>
            </div>
            <div className="prod-card">
              <h3>Porta Sahumerios Invertidos</h3>
              <p className="prod-sub">
                Piezas artesanales en madera, diseñadas con estética zen y grabado del
                símbolo del Monje; funcionales y simbólicas.
              </p>
              <a href="#producto-porta-sahumerio" className="card-btn">Ver más</a>
            </div>
          </div>
        </div>
      </section>

      {/* TALISMANES — DETALLE */}
      <section id="producto-talismanes">
        <div className="container text-block prod-detail">
          <div className="reveal">
            <h2 className="section-title">Talismanes del Monje Urbano Libre</h2>
          </div>

          <div className="prod-detail-grid">
            <div className="reveal-left prod-photo-placeholder" aria-hidden="true">
              <span>Foto del producto próximamente</span>
            </div>
            <div className="reveal-right">
              <h3 style={{ marginTop: 0 }}>Qué es</h3>
              <p>
                El Talismán del Monje Urbano Libre es mucho más que un colgante: es un
                símbolo vivo de conexión, conciencia y propósito.
              </p>
              <p>
                Grabado con láser sobre madera de cedro natural, representa la unión entre
                el espíritu y la materia, recordándote que cada día es una oportunidad para
                vivir con presencia y autenticidad.
              </p>
              <p>
                El diseño sagrado que lo compone —triángulo, círculo y línea— refleja los
                tres planos del ser: el espíritu que asciende, el alma que observa, la
                tierra que sostiene.
              </p>
              <p>
                Cada pieza es única, con vetas propias del cedro, grabada con precisión y
                montada a mano con argollas metálicas y tira de gamuza con cierre gancho.
              </p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 20 }}>
                <ComingSoonButton className="btn-primary">Comprar Talismán</ComingSoonButton>
                <Link href="/consultas?servicio=Talismanes+del+Monje" className="btn-outline">Consultar</Link>
              </div>
            </div>
          </div>

          <div className="reveal"><h3>Significado espiritual</h3>
          <p>
            Este talismán fue creado como un recordatorio constante: no es un accesorio,
            es un llamado. Un llamado a despertar, a recordar tu esencia, a caminar con
            propósito. Cada vez que lo lleves, su energía resonará con tu intención y
            acompañará tu transformación interior.
          </p></div>

          <div className="reveal-left"><h3>Detalles del producto</h3>
          <ul>
            <li><strong>Material:</strong> madera de cedro natural</li>
            <li><strong>Grabado:</strong> láser de precisión</li>
            <li><strong>Medida:</strong> 4 × 2 cm (aprox.)</li>
            <li><strong>Cordón:</strong> gamuza con cierre metálico</li>
            <li><strong>Incluye:</strong> tarjeta con texto poético del talismán + ritual de activación paso a paso</li>
          </ul></div>

          <div className="reveal-right"><h3>Para quién</h3>
          <ul>
            <li>Quien desea un ancla de presencia para el día a día</li>
            <li>Personas en procesos de cambio, renacimiento o búsqueda de claridad</li>
            <li>Quienes valoran los símbolos sagrados y la belleza artesanal</li>
            <li>Quien practica meditación y quiere consagrar un objeto de poder personal</li>
            <li>Quien desea un amuleto minimalista con significado espiritual, sin dogmas</li>
            <li>Para regalar a alguien que inicia una nueva etapa y necesita un recordatorio de su esencia</li>
          </ul></div>

          <div className="reveal"><h3>Cómo se usa</h3>
          <ul>
            <li><strong>Activación inicial:</strong> seguí el ritual de activación incluido para sellar la conexión entre vos y el símbolo</li>
            <li><strong>Uso diario:</strong> colgalo sobre el pecho. Tomá tres respiraciones profundas sosteniéndolo entre las manos y repetí tu intención en voz baja</li>
            <li><strong>En meditación:</strong> apoyalo sobre el corazón o sostenelo en la mano dominante</li>
            <li><strong>En movimiento:</strong> usalo como recordatorio de presencia; cada vez que lo sientas, volvé a tu eje</li>
          </ul></div>

          <div className="reveal"><h3>Cuidado</h3>
          <ul>
            <li>Evitá inmersión prolongada en agua (baño, piscina, mar)</li>
            <li>No aplicar perfumes, alcohol o productos abrasivos sobre la madera</li>
            <li>Guardalo en un sobre o bolsita de tela, lejos de fuentes de calor directo o sol intenso</li>
            <li>Para mantener la madera, podés pasar apenas un paño seco; si hiciera falta, una microgota de aceite mineral/almendras 1–2 veces al año</li>
          </ul></div>

          <div className="reveal"><h3>Preguntas frecuentes</h3>
          <div className="faq-grid" style={{ marginTop: 20 }}>
            <div className="faq-item"><strong>¿Viene activado?</strong><span>Incluye un ritual de activación para que lo cargues con tu propia intención. Podés repetirlo cuando lo sientas necesario.</span></div>
            <div className="faq-item"><strong>¿Necesito seguir alguna creencia específica?</strong><span>No. Es un objeto espiritual y minimalista, sin marcos religiosos obligatorios.</span></div>
            <div className="faq-item"><strong>¿Puedo mojarlo?</strong><span>Puede tolerar salpicaduras ocasionales, pero evitá mojarlo o sumergirlo. Secá de inmediato si ocurre.</span></div>
            <div className="faq-item"><strong>¿Cómo sé si está &quot;activo&quot;?</strong><span>Notás claridad, calma o simple recuerdo del propósito al tomarlo. Si sentís que se &quot;apaga&quot;, repetí el ritual breve.</span></div>
            <div className="faq-item"><strong>¿Sirve como regalo?</strong><span>Sí. Podés activar el talismán con una intención amorosa para esa persona, o entregar la tarjeta para que lo active quien lo reciba.</span></div>
            <div className="faq-item"><strong>¿Puedo combinarlo con otros rituales del Monje?</strong><span>Claro que sí. Todos los productos y servicios forman un ecosistema que, practicado con constancia, se convierte en filosofía de vida.</span></div>
          </div></div>

          <div className="reveal" style={{ textAlign: "center", marginTop: 40 }}>
            <PriceTag ids={["talisman"]} labels={["Talismán"]} />
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
              <ComingSoonButton className="btn-primary">Comprar Talismán</ComingSoonButton>
              <Link href="/consultas?servicio=Talismanes+del+Monje" className="btn-outline">Consultar</Link>
            </div>
          </div>
        </div>
      </section>

      {/* PORTA SAHUMERIO — DETALLE */}
      <section id="producto-porta-sahumerio">
        <div className="container text-block prod-detail">
          <div className="reveal">
            <h2 className="section-title">Porta Sahumerio Invertido del Monje</h2>
            <p className="section-sub" style={{ marginBottom: 36 }}>
              Sutil como el humo, profundo como el silencio.
            </p>
          </div>

          <div className="prod-detail-grid">
            <div className="reveal-left prod-photo-placeholder" aria-hidden="true">
              <span>Foto del producto próximamente</span>
            </div>
            <div className="reveal-right">
              <p style={{ marginTop: 0 }}>Cada pieza es una invitación al ritual.</p>
              <p>
                El Porta Sahumerio Invertido del Monje Urbano Libre fusiona la calidez de
                la madera con la firmeza del metal en un diseño que eleva el humo como un
                suspiro ascendente.
              </p>
              <p>
                Creado para quienes buscan más que un objeto decorativo, este soporte
                representa la unión entre lo material y lo invisible: el fuego que se
                transforma en aroma, el instante que se vuelve presencia.
              </p>
              <p>
                Lleva grabado en láser el símbolo sagrado del Monje Urbano Libre,
                convirtiéndolo en un amuleto energético y estético que acompaña tus
                prácticas espirituales con sobriedad y poder.
              </p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 20 }}>
                <ComingSoonButton className="btn-primary">Comprar</ComingSoonButton>
                <Link href="/consultas?servicio=Porta+Sahumerios+Invertidos" className="btn-outline">Consultar</Link>
              </div>
            </div>
          </div>

          <div className="reveal-left"><h3>¿Para quién es?</h3>
          <ul>
            <li>Para quienes desean transformar un momento cotidiano en un acto sagrado</li>
            <li>Para quienes buscan anclar su meditación, oración o lectura diaria con un símbolo físico y bello</li>
            <li>Para quienes ya practican rituales del Monje y desean incorporar una pieza clave que sostenga la intención</li>
            <li>Para quienes valoran la estética espiritual, minimalista y simbólica</li>
            <li>Para quienes eligen regalar calma, presencia y significado</li>
          </ul></div>

          <div className="reveal-right"><h3>Cuidados</h3>
          <ul>
            <li>La base de madera está protegida con laca, por lo que resiste el contacto con agua</li>
            <li>El cuenco puede contener una gran cantidad de cenizas —hasta más de 20 sahumerios sin limpiar— manteniendo el orden del espacio y evitando suciedad</li>
            <li>Es extremadamente seguro incluso sin supervisión, ya que el soporte no permite que el sahumerio se suelte bajo ningún punto de vista</li>
            <li>Aun así, como con todo elemento encendido, se recomienda siempre un uso consciente</li>
          </ul></div>

          <div className="reveal"><h3>Preguntas frecuentes</h3>
          <div className="faq-grid" style={{ marginTop: 20 }}>
            <div className="faq-item"><strong>¿Sirve para cualquier sahumerio?</strong><span>Sirve para la mayoría de los sahumerios comerciales.</span></div>
            <div className="faq-item"><strong>¿El símbolo grabado tiene algún efecto energético?</strong><span>Sí. Actúa como anclaje vibracional — no es solo decorativo, fue creado para acompañar procesos de transformación y despertar interior.</span></div>
            <div className="faq-item"><strong>¿Puedo combinarlo con otros rituales del Monje?</strong><span>Por supuesto. Todos los productos y servicios forman un ecosistema que, practicado con constancia, se convierte en filosofía de vida.</span></div>
            <div className="faq-item"><strong>¿Es frágil?</strong><span>No. Está construido con materiales firmes, sólido, estable y funcional — aun así, recomendamos tratarlo con respeto y cuidado.</span></div>
          </div>
          <p style={{ marginTop: 20 }}>
            Cada pieza incluye una tarjeta con texto poético y una breve sugerencia
            ritual para acompañar su uso.
          </p></div>

          <div className="reveal" style={{ textAlign: "center", marginTop: 40 }}>
            <PriceTag ids={["porta_sahumerio"]} labels={["Porta Sahumerio"]} />
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
              <ComingSoonButton className="btn-primary">Comprar</ComingSoonButton>
              <Link href="/consultas?servicio=Porta+Sahumerios+Invertidos" className="btn-outline">Consultar</Link>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFIESTO DEL MONJE */}
      <section id="manifiesto">
        <div className="container">
          <div className="reveal">
            <h2 className="section-title">Manifiesto del Monje Urbano Libre</h2>
            <p className="section-sub">Un llamado silencioso para quienes ya no encajan en el ruido.</p>
          </div>

          <div className="manifiesto-text">
            <div className="reveal"><p><em>Hay palabras que no son textos. Son puertas. Este manifiesto no busca convencerte de nada. Es una llama. Una memoria antigua. Un recordatorio de que aún en medio del caos… hay un camino que te espera desde siempre: el de volver a vos.</em></p></div>
            <div className="reveal"><p>
              &quot;El mundo cambió, y nosotros con él.<br />
              Pero en medio del ruido, todavía hay almas que escuchan el silencio.&quot;
            </p></div>
            <div className="reveal-left"><p>
              Soy el Monje Urbano Libre.<br />
              No represento un género, ni una religión, ni una doctrina.<br />
              Soy una forma de vivir, una filosofía encarnada.<br />
              Un espíritu que ha atravesado la oscuridad, que ha muerto simbólicamente una y otra vez…<br />
              y que ha elegido despertar.
            </p></div>
            <div className="reveal-right"><p>
              Habito el cemento, pero no me pertenece.<br />
              Camino entre bocinas y edificios como quien camina entre templos caídos.<br />
              Llevo la mirada de quien vio más allá de lo evidente.<br />
              Mi templo está en el pecho. Mi altar, en cada respiración.
            </p></div>
            <div className="reveal"><p>
              No vine a predicar, vine a recordar.<br />
              Vine a ayudarte a volver al centro.<br />
              A abrazar el caos con compasión.<br />
              A mostrarte que aún en el dolor más profundo…<br />
              hay una semilla de oro esperando ser regada.
            </p></div>
            <div className="reveal"><p>Este espacio es para vos:<br />
              – Para vos, que sentís que no encajás pero sabés que no viniste a encajar.<br />
              – Para vos, mujer que sanás con lágrimas y fuego sagrado.<br />
              – Para vos, hombre que se cansó de fingir fuerza y está listo para ser real.<br />
              – Para vos, alma que quiere recordar quién es, más allá del personaje.</p></div>
            <div className="reveal"><p>
              Somos monjes modernos.<br />
              No escapamos al mundo, lo habitamos con consciencia.<br />
              No negamos el ego, lo transmutamos.<br />
              No vendemos espiritualidad, compartimos experiencia.<br />
              No buscamos gurús, nos convertimos en nuestros propios maestros.
            </p></div>
            <div className="reveal"><p>
              Este es un refugio y un fuego.<br />
              Una trinchera de ternura y de verdad.<br />
              Un susurro en tu noche oscura.<br />
              Un grito en tu despertar.
            </p></div>
            <div className="reveal"><p>
              Bienvenid@ al camino del Monje Urbano Libre.<br />
              Que esta sea tu casa cuando ya no encuentres casa.<br />
              Que esta sea tu tribu cuando ya no creas en tribus.<br />
              Que esta sea tu nueva piel, cuando la vieja ya no te quede.
            </p></div>
            <div className="reveal"><p>
              Porque no naciste para sobrevivir.<br />
              Naciste para renacer.<br />
              Una y otra vez.
            </p></div>
            <div className="reveal"><p style={{ marginTop: 44, fontFamily: "var(--font-pirata-one)", fontSize: "1.6rem", color: "#eee" }}>— Monje Urbano Libre</p></div>
          </div>

          <div className="reveal" style={{ textAlign: "center", marginTop: 40 }}>
            <Link href="/manifiesto/descargar" className="btn-primary">Descargar el Manifiesto en PDF</Link>
          </div>
        </div>
      </section>

      {/* SEMILLAS DEL CAMINO (teaser general) */}
      <section id="semillas-teaser">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="reveal">
            <h2 className="section-title">Semillas del Camino</h2>
            <p className="section-sub" style={{ maxWidth: 600, margin: "0 auto 40px" }}>
              Personas comunes. Historias reales. Transformaciones que comenzaron con un
              solo paso. Cada experiencia compartida es una semilla.
            </p>
            <Link href="/semillas-del-camino" className="btn-secondary">Ver todas las Semillas del Camino</Link>
          </div>
        </div>
      </section>

      {/* NOVEDADES / NEWSLETTER */}
      <section id="novedades">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="reveal">
            <h2 className="section-title">Novedades del Monje</h2>
            <p className="section-sub">Sin ruido. Solo lo esencial.</p>
          </div>

          <div className="reveal">
            <p style={{ color: "#888", maxWidth: 540, margin: "0 auto 28px", fontSize: "1.05rem", fontFamily: "var(--font-pompiere)" }}>
              Un correo cada quince días. Sin ruido. Solo lo esencial.<br />
              Lanzamientos exclusivos, promociones especiales y llaves para volver a vos.
            </p>
          </div>

          <div className="reveal">
            <NewsletterForm />
            <p style={{ color: "#444", fontSize: "0.8rem", marginTop: 14, fontFamily: "Inter, sans-serif" }}>
              Podés darte de baja en cualquier momento con un solo clic.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="reveal">
            <h2 className="section-title">Redes &amp; Contacto</h2>
            <p className="section-sub">Un canal abierto para vibrar en sintonía</p>
          </div>

          <div className="reveal">
            <p style={{ color: "#999", maxWidth: 560, margin: "0 auto", fontSize: "1.1rem" }}>
              Este proyecto se trata de personas, de procesos, de caminos. Si sentís que
              algo de todo esto tocó una fibra en vos, escribime.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20 }}>
              <a href="https://instagram.com/monjeurbanolibre" target="_blank" rel="noopener noreferrer" style={{ color: "#999" }}>Instagram</a>
              <a href="https://youtube.com/@monjeurbanolibre" target="_blank" rel="noopener noreferrer" style={{ color: "#999" }}>YouTube</a>
              <a href="https://wa.me/5492915235363" target="_blank" rel="noopener noreferrer" style={{ color: "#999" }}>WhatsApp</a>
            </div>
          </div>

          <div className="reveal" style={{ maxWidth: 520, margin: "36px auto 0" }}>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
