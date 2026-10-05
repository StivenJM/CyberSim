/**
 * EXPORTADOR DE BASE DE CONOCIMIENTO RAG — AGENTE MALVADO
 * =========================================================
 * Genera 2 archivos JSON con los 5 escenarios activos del proyecto:
 *   - topologias.json  → zonas, oficinas, dispositivos, redes, personas
 *   - desafios.json    → fases, objetivos, eventos, ataques
 *
 * Ejecutar con:
 *   npx tsx scripts/export-rag-knowledge.ts
 *
 * Los archivos se guardan en: scripts/rag-output/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── Resolver __dirname en ESM ───────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Imports de los 5 escenarios activos ─────────────────────────────────────
import { escenarioTutorial } from '../src/client/data/escenarios/escenarioTutorial.js';
import { escenarioAmenazas } from '../src/client/data/escenarios/escenarioAmenazas.js';
import { escenarioCriptografia } from '../src/client/data/escenarios/escenarioCriptografia.js';
import { escenarioControlAcceso } from '../src/client/data/escenarios/escenarioControlAcceso.js';
import { escenarioHackingEtico } from '../src/client/data/escenarios/escenarioHackingEtico.js';

// ─── Tipos internos para el script ───────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EscenarioRaw = Record<string, any>;

interface DocumentoTopologia {
  slug: string;
  tipo: 'topologia';
  titulo: string;
  categoria: string;
  descripcion: string;
  presupuestoInicial: number;
  zonas: ZonaRAG[];
  text: string; // texto plano para embeddings
}

interface ZonaRAG {
  id: number;
  nombre: string;
  dominio: string;
  redes: string[];
  personas: { nombre: string; correo: string; nivelConcienciaSeguridad: string }[];
  oficinas: OficinaRAG[];
}

interface OficinaRAG {
  id: number;
  nombre: string;
  posicion?: { x: number; y: number; z: number; rotacionY?: number };
  espacios: EspacioRAG[];
}

interface EspacioRAG {
  id: number;
  mueble: string;
  posicion: { x: number; y: number; z: number; rotacionY?: number };
  dispositivos: DispositivoRAG[];
}

interface DispositivoRAG {
  id: number;
  nombre: string;
  tipo: string;
  sistemaOperativo: string;
  software: string;
  redes: string[];
  activos: string[];
  posicion?: { x: number; y: number; z: number; rotacionY?: number };
}

interface DocumentoDesafio {
  slug: string;
  tipo: 'desafio';
  titulo: string;
  fases: FaseRAG[];
  eventos: EventoRAG[];
  ataques: AtaqueRAG[];
  text: string; // texto plano para embeddings
}

interface FaseRAG {
  id: number;
  nombre: string;
  descripcion: string;
  objetivos: string[];
}

interface EventoRAG {
  nombreEvento: string;
  tipoEvento: string;
  descripcion: string;
  fase: number;
  tiempoNotificacion: number;
  infoAdicional: unknown;
}

interface AtaqueRAG {
  nombreAtaque: string;
  tipoAtaque: string;
  descripcion: string;
  fase: number;
  dispositivoAAtacar: string;
  condicionMitigacion: unknown;
}

// ─── Escenarios activos ───────────────────────────────────────────────────────
const ESCENARIOS_ACTIVOS: EscenarioRaw[] = [
  escenarioTutorial as EscenarioRaw,
  escenarioAmenazas as EscenarioRaw,
  escenarioCriptografia as EscenarioRaw,
  escenarioControlAcceso as EscenarioRaw,
  escenarioHackingEtico as EscenarioRaw,
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function extraerNombreRed(red: unknown): string {
  if (typeof red === 'string') return red;
  if (red && typeof red === 'object' && 'nombre' in (red as object)) {
    return (red as { nombre: string }).nombre;
  }
  return String(red);
}

function extraerEspacios(oficina: EscenarioRaw): EspacioRAG[] {
  return (oficina.espacios ?? []).map((esp: EscenarioRaw) => ({
    id: esp.id ?? 0,
    mueble: String(esp.mueble ?? 'libre'),
    posicion: esp.posicion ?? { x: 0, y: 0, z: 0, rotacionY: 0 },
    dispositivos: (esp.dispositivos ?? []).map((disp: EscenarioRaw) => ({
      id: disp.id ?? 0,
      nombre: disp.nombre ?? 'Sin nombre',
      tipo: disp.tipo ?? 'workstation',
      sistemaOperativo: disp.sistemaOperativo ?? '',
      software: disp.software ?? '',
      redes: (disp.redes ?? []).map(extraerNombreRed),
      activos: (disp.activos ?? []).map((a: EscenarioRaw) => a.nombre ?? '').filter(Boolean),
      posicion: disp.posicion ?? { x: 0, y: 0, z: 0, rotacionY: 0 },
    })),
  }));
}

// ─── Generador de documento TOPOLOGÍA ────────────────────────────────────────
function buildTopologia(esc: EscenarioRaw): DocumentoTopologia {
  const zonas: ZonaRAG[] = (esc.zonas ?? []).map((z: EscenarioRaw) => ({
    id: z.id ?? 0,
    nombre: z.nombre ?? '',
    dominio: z.dominio ?? '',
    redes: (z.redes ?? []).map(extraerNombreRed),
    personas: (z.personas ?? []).map((p: EscenarioRaw) => ({
      nombre: p.nombre ?? '',
      correo: p.correo ?? '',
      nivelConcienciaSeguridad: String(p.nivelConcienciaSeguridad ?? ''),
    })),
    oficinas: (z.oficinas ?? []).map((o: EscenarioRaw) => ({
      id: o.id ?? 0,
      nombre: o.nombre ?? '',
      posicion: o.posicion,
      espacios: extraerEspacios(o),
    })),
  }));

  // Construir texto plano para que el LLM pueda buscar por palabras clave
  const lineasText: string[] = [
    `TOPOLOGÍA DEL ESCENARIO: ${esc.titulo}`,
    `Slug: ${esc.slug}`,
    `Categoría: ${esc.categoria ?? ''}`,
    `Descripción: ${esc.descripcion ?? ''}`,
    `Presupuesto inicial: $${esc.presupuestoInicial ?? 0}`,
    '',
    '=== ZONAS Y DISPOSITIVOS ===',
  ];

  for (const zona of zonas) {
    lineasText.push(`\nZONA: ${zona.nombre} (Dominio: ${zona.dominio})`);
    lineasText.push(`  Redes disponibles: ${zona.redes.join(', ')}`);
    if (zona.personas.length > 0) {
      lineasText.push(`  Personas:`);
      zona.personas.forEach(p =>
        lineasText.push(`    - ${p.nombre} <${p.correo}> | Conciencia: ${p.nivelConcienciaSeguridad}`)
      );
    }
    for (const oficina of zona.oficinas) {
      lineasText.push(`  Oficina: "${oficina.nombre}" (id: ${oficina.id})`);
      for (const esp of oficina.espacios) {
        lineasText.push(`    Espacio id:${esp.id} | mueble:"${esp.mueble}" | posicion:${JSON.stringify(esp.posicion)}`);
        for (const disp of esp.dispositivos) {
          lineasText.push(`      Dispositivo: "${disp.nombre}" | tipo:${disp.tipo} | posicion:${JSON.stringify(disp.posicion)}`);
          lineasText.push(`        SO: ${disp.sistemaOperativo} | Software: ${disp.software}`);
          lineasText.push(`        Redes: ${disp.redes.join(', ') || 'ninguna'}`);
          if (disp.activos.length > 0) {
            lineasText.push(`        Activos: ${disp.activos.join(', ')}`);
          }
        }
      }
    }
  }

  return {
    slug: esc.slug,
    tipo: 'topologia',
    titulo: esc.titulo ?? '',
    categoria: esc.categoria ?? '',
    descripcion: esc.descripcion ?? '',
    presupuestoInicial: esc.presupuestoInicial ?? 0,
    zonas,
    text: lineasText.join('\n'),
  };
}

// ─── Generador de documento DESAFÍO ──────────────────────────────────────────
function buildDesafio(esc: EscenarioRaw): DocumentoDesafio {
  const fases: FaseRAG[] = (esc.fases ?? []).map((f: EscenarioRaw) => ({
    id: f.id ?? 0,
    nombre: f.nombre ?? '',
    descripcion: f.descripcion ?? '',
    objetivos: (f.objetivos ?? []).map((o: EscenarioRaw) => o.descripcion ?? '').filter(Boolean),
  }));

  const eventos: EventoRAG[] = (esc.eventos ?? []).map((ev: EscenarioRaw) => ({
    nombreEvento: ev.nombreEvento ?? '',
    tipoEvento: String(ev.tipoEvento ?? ''),
    descripcion: ev.descripcion ?? '',
    fase: Number(ev.fase ?? 1),
    tiempoNotificacion: Number(ev.tiempoNotificacion ?? 0),
    infoAdicional: ev.infoAdicional ?? null,
  }));

  const ataques: AtaqueRAG[] = (esc.ataques ?? []).map((atk: EscenarioRaw) => ({
    nombreAtaque: atk.nombreAtaque ?? '',
    tipoAtaque: String(atk.tipoAtaque ?? ''),
    descripcion: atk.descripcion ?? '',
    fase: Number(atk.fase ?? 1),
    dispositivoAAtacar: atk.dispositivoAAtacar ?? '',
    condicionMitigacion: atk.condicionMitigacion ?? null,
  }));

  // ── Extraer accionesEsperadas para incluir val exactos en el text ──
  const accionesEsperadas: EscenarioRaw[] = (esc.accionesEsperadas ?? []);

  // Construir texto plano para embeddings
  const lineasText: string[] = [
    `DESAFÍOS DEL ESCENARIO: ${esc.titulo}`,
    `Slug: ${esc.slug}`,
    '',
    '=== REGLAS DE tipoEvento (OBLIGATORIO SEGUIR) ===',
    '',
    'REGLA 1 — "Verificación de acciones de un jugador en la simulación":',
    '  Usar SOLO para: ejecutar aplicaciones (Net-Scan Viz, Company Social-Searcher), comandos de terminal (ssh, cat, ls), configuraciones de workstation (click).',
    '  infoAdicional requerido: { "accion": "ejecutar"|"click", "objeto": "aplicación/software de computadora"|"comando de terminal/CLI"|"configuración de workstation", "val": {...}, "esObjetivo": true }',
    '',
    'REGLA 2 — "Tráfico de red":',
    '  Usar SOLO para: asignar redes a dispositivos, bloquear tráfico en firewall de router.',
    '  infoAdicional requerido: { "dispositivoOrigen": "...", "dispositivoDestino": "...", "protocolo": "SSH"|"MANAGEMENT"|"HTTP", "esObjetivo": true, "debeSerBloqueado": true|false }',
    '  ATENCIÓN: NO usar "Verificación de acciones" para firewall — usar "Tráfico de red".',
    '',
    'REGLA 3 — "Conexión VPN":',
    '  Usar SOLO para: configurar túnel VPN entre gateway y cliente.',
    '  infoAdicional requerido: { "gateway": { "lanLocal":"...", "hostLan":"...", "proteccion":"Encriptar y Autenticar", "dominioRemoto":"...", "hostRemoto":"..." }, "cliente": { "proteccion":"Encriptar y Autenticar", "dominioRemoto":"...", "hostRemoto":"..." } }',
    '  ATENCIÓN CRÍTICA: Solo puedes asignar rol \'gateway\' a un dispositivo de tipo "vpn". Un router o workstation NO sirve. Si la topología NO tiene tipo "vpn", PROHIBIDO generar este evento (la simulación crasheará). Aborta el objetivo.',
    '',
    'REGLA 4 — "Envío de correo":',
    '  Usar SOLO para: enviar correo phishing.',
    '  infoAdicional requerido: { "dispositivoEmisor": "...", "destinatario": "correo@dominio.com", "asunto": "..." }',
    '',
    'REGLA 5 — "Verificación de firma":',
    '  Usar SOLO para: verificar firma digital de un documento.',
    '  infoAdicional requerido: { "nombreDocumento": "...", "nombreFirma": "...", "nombreClave": "...", "veredicto": true|false }',
    '',
    '=== FASES Y OBJETIVOS ===',
  ];

  for (const fase of fases) {
    lineasText.push(`\nFASE ${fase.id}: ${fase.nombre}`);
    lineasText.push(`  Descripción: ${fase.descripcion}`);
    if (fase.objetivos.length > 0) {
      lineasText.push(`  Objetivos (los nombres EXACTOS que debe usar el agente):`);
      fase.objetivos.forEach(obj => lineasText.push(`    - "${obj}"`));
    }
  }

  if (eventos.length > 0) {
    lineasText.push('\n=== EVENTOS (copiar estructura infoAdicional exactamente) ===');
    for (const ev of eventos) {
      lineasText.push(`\nEvento: "${ev.nombreEvento}" | tipoEvento: "${ev.tipoEvento}" | Fase: ${ev.fase}`);
      lineasText.push(`  Descripción para el jugador: ${ev.descripcion}`);
      if (ev.infoAdicional) {
        lineasText.push(`  infoAdicional EXACTO: ${JSON.stringify(ev.infoAdicional)}`);
      }
    }
  }

  if (accionesEsperadas.length > 0) {
    lineasText.push('\n=== ACCIONES ESPERADAS DEL JUGADOR (accion/objeto/val exactos) ===');
    for (const acc of accionesEsperadas) {
      lineasText.push(`\naccion: "${acc.accion}" | objeto: "${acc.objeto}"`);
      if (acc.val) lineasText.push(`  val: ${JSON.stringify(acc.val)}`);
    }
  }

  if (ataques.length > 0) {
    lineasText.push('\n=== ATAQUES (van en array "ataques", NO en "eventos") ===');
    for (const atk of ataques) {
      lineasText.push(`\nAtaque: "${atk.nombreAtaque}" | tipoAtaque: "${atk.tipoAtaque}" | Fase: ${atk.fase}`);
      lineasText.push(`  dispositivoAAtacar: "${atk.dispositivoAAtacar}"`);
      lineasText.push(`  Descripción: ${atk.descripcion}`);
      if (atk.condicionMitigacion) {
        lineasText.push(`  condicionMitigacion EXACTA: ${JSON.stringify(atk.condicionMitigacion)}`);
      }
    }
  }

  return {
    slug: esc.slug,
    tipo: 'desafio',
    titulo: esc.titulo ?? '',
    fases,
    eventos,
    ataques,
    text: lineasText.join('\n'),
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function main() {
  const outputDir = path.join(__dirname, 'rag-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const topologias: DocumentoTopologia[] = [];
  const desafios: DocumentoDesafio[] = [];

  for (const esc of ESCENARIOS_ACTIVOS) {
    console.log(`\n📦 Procesando: ${esc.slug} — ${esc.titulo}`);

    const topologia = buildTopologia(esc);
    topologias.push(topologia);
    console.log(`  ✅ Topología: ${topologia.zonas.length} zonas, ${topologia.zonas.reduce((acc, z) => acc + z.oficinas.reduce((a, o) => a + o.espacios.reduce((b, esp) => b + esp.dispositivos.length, 0), 0), 0)} dispositivos`);

    const desafio = buildDesafio(esc);
    desafios.push(desafio);
    console.log(`  ✅ Desafío: ${desafio.fases.length} fases, ${desafio.eventos.length} eventos, ${desafio.ataques.length} ataques`);
  }

  // ── Guardar topologias.json ──
  const topologiasPath = path.join(outputDir, 'topologias.json');
  fs.writeFileSync(topologiasPath, JSON.stringify(topologias, null, 2), 'utf-8');
  console.log(`\n💾 Guardado: ${topologiasPath}`);
  console.log(`   → ${topologias.length} documentos de topología`);

  // ── Guardar desafios.json ──
  const desafiosPath = path.join(outputDir, 'desafios.json');
  fs.writeFileSync(desafiosPath, JSON.stringify(desafios, null, 2), 'utf-8');
  console.log(`💾 Guardado: ${desafiosPath}`);
  console.log(`   → ${desafios.length} documentos de desafíos`);

  console.log('\n🎯 Resumen:');
  console.log(`   topologias.json → ${topologias.length} docs (1 por escenario)`);
  console.log(`   desafios.json   → ${desafios.length} docs (1 por escenario)`);
  console.log('\n✅ Exportación completada. Sube estos archivos a tu colección Qdrant en n8n.');
}

main();
