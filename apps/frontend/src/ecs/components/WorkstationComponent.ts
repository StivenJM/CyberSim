import {
	ConfiguracionWorkstation,
	type EsquemaConfigWorkstation,
} from '../../data/configuraciones/configWorkstation'
import { Componente } from '../core'

// Tiene el conjunto total de configuraciones de un workstation.
export class WorkstationComponent extends Componente {
	constructor(public configuraciones: Array<EsquemaConfigWorkstation> = []) {
		super()
		this.configuraciones = ConfiguracionWorkstation.map((c) => ({ ...c }))
	}
}
