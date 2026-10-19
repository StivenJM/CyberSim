import type { Reglas } from '../../shared/types/FirewallTypes'
import type { RegistroFirewallBloqueado } from '../../shared/types/TrafficEnums'
import { Componente } from '../core'
import type { Entidad } from '../core/Componente'

export class RouterComponent extends Componente {
	constructor(
		public bloqueosFirewall: Map<Entidad, Reglas[]> = new Map(),
		public logsTrafico: RegistroFirewallBloqueado[] = [],
	) {
		super()
	}
}
