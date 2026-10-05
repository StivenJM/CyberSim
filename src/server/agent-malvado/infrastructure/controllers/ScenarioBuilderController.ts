import { type Request, type Response, Router } from 'express';
import { GenerateScenarioUseCase } from '../../application/useCases/GenerateScenarioUseCase.js';
import { N8nWebhookRepository } from '../repositories/N8nWebhookRepository.js';

export class ScenarioBuilderController {
  private readonly router: Router;
  private readonly generateUseCase: GenerateScenarioUseCase;

  constructor() {
    this.router = Router();
    const webhookUrl = process.env.N8N_SCENARIO_WEBHOOK_URL || 'https://pymwebhooks.pymbots.com/webhook/bc9c6053-3be9-4e71-b769-0de0166ca4e9';
    const repository = new N8nWebhookRepository(webhookUrl);
    this.generateUseCase = new GenerateScenarioUseCase(repository);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/generate', this.generateScenario.bind(this));
  }

  public getRouter(): Router {
    return this.router;
  }

  private async generateScenario(req: Request, res: Response): Promise<void> {
    try {
      const { prompt } = req.body;
      const requestDto = { 
        prompt: prompt || this.getDefaultPrompt(),
        seed: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString()
      };
      const result = await this.generateUseCase.execute(requestDto);
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch {
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  private getDefaultPrompt(): string {
    return `MODO ARQUITECTO ECS (PSM-V12 - ESTÁNDAR LOGICORP)
1. BASE: Elige un escenario con 'buscar_topologias'. OBLIGATORIO: INYECTA VARIEDAD. NO elijas siempre la misma topología. No inventes redes ni PCs.
2. ESTRUCTURA DE FASES (REGLA DE ORO):
    - VARIACIÓN DE TEMAS: Alterna equitativamente entre los 4 pilares: Malware (Troyanos), Firewall, VPN y Criptografía (Firmas). No te quedes en uno solo.
    - FLUJO LIBRE (ORDEN DE FASES): El Reconocimiento (Escaneo/Búsqueda) NO es obligatorio en la Fase 1. Puede ocurrir en cualquier fase. 
    - COHERENCIA DE TOPOLOGÍA:
      * Si eliges "Bufete Mendoza": Usa Criptografía (FirmaChecker) y VPN.
      * Si eliges "Campus TechU": Usa Firewall y Malware (Troyanos).
      * Si eliges "Empresa Auditoría": Usa Escaneos y Malware.
    - REGLA HACKING ÉTICO: Si eliges la topología 'hacking-etico', usa ÚNICAMENTE sus retos de escaneo/búsqueda (Reconocimiento). Las fases restantes complétalas con otros temas.
    - PROHIBICIÓN PHISHING: ESTÁ TOTALMENTE PROHIBIDO usar desafíos de Phishing o envío de correos.
3. CAMPOS OBLIGATORIOS:
   - Cada fase debe tener "faseActual": (true solo en P1) y "completada": false.
   - Retos de Escaneo/VPN/Firewall → "tipoEvento": "Verificación de acciones de un jugador en la simulación".
   - Retos de Criptografía (Firmas) → "tipoEvento": "Verificación de firma".
   - Amenazas reales (Troyano/Ransomware) → Usar el array 'ataques'. OBLIGATORIO incluir TANTO tiempoNotificacion COMO tiempoEnOcurrir.
   - REGLA tiempoEnOcurrir (CRÍTICO): Los eventos de tipo "Tráfico de red", "Verificación de firma" y "Verificación de acciones..." DEBEN incluir AMBOS campos:
     * tiempoNotificacion: cuando se avisa al jugador (ej. 10)
     * tiempoEnOcurrir: cuando el motor valida (= tiempoNotificacion + 5 a 10s, ej. 15)
4. SINCRONIZACIÓN DE NOMBRES (CRÍTICO - OBLIGATORIO):
   El campo 'nombreEvento' (en eventos) o 'nombreAtaque' (en ataques) debe ser EXACTAMENTE IGUAL, carácter por carácter, a la 'descripcion' del objetivo correspondiente en la fase.
5. VALORES EXACTOS DEL infoAdicional (OBLIGATORIO - COPIAR TAL CUAL):
   Para escaneo/app → "accion": "ejecutar", "objeto": "aplicación/software de computadora", "val": { "nombreAplicacion": "Net-Scan Viz" }, "esObjetivo": true
   Para búsqueda de personas → "accion": "ejecutar", "objeto": "aplicación/software de computadora", "val": { "nombreAplicacion": "Company Social-Searcher" }, "esObjetivo": true
   Para criptografía/firmas (Verificación de firma) → "tipoEvento": "Verificación de firma". infoAdicional: { "nombreDocumento": "...", "nombreFirma": "...", "nombreClave": "...", "veredicto": true|false, "esObjetivo": true }. 
   IMPORTANTE: Para firmas NO uses el objeto "val" con nombreAplicación, pon los campos de documento y veredicto directamente en infoAdicional.
   Para firewall → usar "tipoEvento": "Tráfico de red" con "dispositivoOrigen", "dispositivoDestino", "protocolo", "debeSerBloqueado": true.
   Para VPN → usar "tipoEvento": "Conexión VPN". Copia la estructura de 'gateway' y 'cliente'. Solo dispositivos tipo "vpn".
   Para workstation config → "objeto": "configuración de workstation", "accion": "click"
6. EVENTOS DE CIERRE DE FASE (OBLIGATORIO):
   Al final de CADA fase debes incluir un evento de cierre en el array 'eventos':
   - Fases intermedias: "tipoEvento": "Completación de fase" con tiempoNotificacion: 999
   - Última fase: "tipoEvento": "Completación de escenario" con tiempoNotificacion: 999
7. NO INVENTES NOMBRES: Usa estrictamente nombres de apps y configuraciones de 'buscar_desafios'.
8. ESTRUCTURA 3D (CRÍTICO - OBLIGATORIO):
   Copia la estructura oficinas→espacios→dispositivos EXACTAMENTE como viene en 'buscar_topologias'.
   Incluye "posicion" de cada espacio y dispositivo tal como aparece en el RAG.
9. DESCRIPCIONES (CRÍTICO):
   El campo "descripcion" de CADA ataque Y evento DEBE copiarse de 'buscar_desafios'.
   AL COPIAR: sustituye el nombre del dominio y empresa con los de la topología elegida en 'buscar_topologias'.`;
  }
}

export default new ScenarioBuilderController().getRouter();
