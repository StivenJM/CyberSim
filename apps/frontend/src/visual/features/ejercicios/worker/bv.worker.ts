import {
	type BibliotecaVivaConfig,
	BV_SCHEMA,
	verifyBibliotecaViva,
} from '@cybersim/exercises'
import initSqlJs from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

import { createSqlJsPort } from './sqljsPort'

interface VerifyRequest {
	readonly id: number
	readonly config: BibliotecaVivaConfig
}

interface WorkerScope {
	onmessage: ((event: MessageEvent<VerifyRequest>) => void) | null
	postMessage: (value: unknown) => void
}

const scope = self as unknown as WorkerScope

scope.onmessage = async (event) => {
	const { id, config } = event.data
	try {
		const SQL = await initSqlJs({ locateFile: () => wasmUrl })
		const report = verifyBibliotecaViva(config, () =>
			createSqlJsPort(SQL, BV_SCHEMA),
		)
		scope.postMessage({ id, kind: 'ok', report })
	} catch (error) {
		scope.postMessage({
			id,
			kind: 'error',
			message: error instanceof Error ? error.message : String(error),
		})
	}
}
