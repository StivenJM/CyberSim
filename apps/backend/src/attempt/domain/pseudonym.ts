import { createHash } from 'node:crypto'

import { ServiceError } from '../../integrations/config.js'

/**
 * Actor pseudonym for attempt evidence.
 *
 * Deterministic from the authenticated identifier so ownership can be enforced
 * without storing a direct reference to the account. It is not a secret: it
 * only avoids keeping the account id inside the evidence payload.
 */
export function attemptPseudonym(idUsuarioAuth: number): string {
	if (!Number.isSafeInteger(idUsuarioAuth) || idUsuarioAuth <= 0) {
		throw new ServiceError('INVALID_TOKEN', 401)
	}
	const digest = createHash('sha256')
		.update(`cybersim:attempt:${idUsuarioAuth}`)
		.digest('hex')
	return `actor-${digest.slice(0, 32)}`
}
