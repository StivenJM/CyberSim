import { escenarioAmenazas } from './escenarioAmenazas.js'
import { escenarioControlAcceso } from './escenarioControlAcceso.js'
import { escenarioCriptografia } from './escenarioCriptografia.js'
import { escenarioHackingEtico } from './escenarioHackingEtico.js'
import { escenarioTutorial } from './escenarioTutorial.js'
export const escenariosActivos = [
	escenarioTutorial,
	escenarioAmenazas,
	escenarioCriptografia,
	escenarioControlAcceso,
	escenarioHackingEtico,
]
