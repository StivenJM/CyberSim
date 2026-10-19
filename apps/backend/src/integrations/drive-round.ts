import jwt from 'jsonwebtoken'
import type { PoolClient } from 'pg'
import { locked, object, pool, required, ServiceError } from './config.js'
import { coordination } from './coordinator.js'
export async function startRound(
	executionId: string,
): Promise<Record<string, unknown>> {
	if (!executionId || executionId.length > 200)
		throw new ServiceError('EXECUTION_REQUIRED', 400)
	return locked(async (client) => {
		const c = await coordination(client)
		const state = object(
			(
				await client.query(
					'SELECT sincronizacion FROM coordinacion_integracion WHERE id=1',
				)
			).rows[0].sincronizacion,
		)
		if (c.pausada || Number(state.until) > Date.now()) return { run: false }
		const until = Date.now() + 65000
		await client.query(
			'UPDATE coordinacion_integracion SET sincronizacion=$1 WHERE id=1',
			[JSON.stringify({ owner: executionId, until })],
		)
		const syncPermit = jwt.sign(
			{
				installationId: c.installation_id,
				generation: c.generacion,
				executionId,
				exp: Math.floor(until / 1000),
				aud: 'drive-sync',
			},
			required('INTERNAL_SIGNING_KEY'),
			{ algorithm: 'HS256' },
		)
		return { run: true, syncPermit }
	})
}
export async function assertRound(
	token: unknown,
	client: Pick<PoolClient, 'query'> = pool,
): Promise<jwt.JwtPayload> {
	let decoded: jwt.JwtPayload
	try {
		const value = jwt.verify(String(token), required('INTERNAL_SIGNING_KEY'), {
			algorithms: ['HS256'],
			audience: 'drive-sync',
		})
		if (typeof value === 'string') throw new Error()
		decoded = value
	} catch {
		throw new ServiceError('SYNC_PERMIT_INVALID', 409)
	}
	const c = await coordination(client)
	const state = object(
		(
			await client.query(
				'SELECT sincronizacion FROM coordinacion_integracion WHERE id=1',
			)
		).rows[0].sincronizacion,
	)
	if (
		c.installation_id !== decoded.installationId ||
		c.generacion !== decoded.generation ||
		c.pausada ||
		state.owner !== decoded.executionId ||
		Number(state.until) <= Date.now()
	)
		throw new ServiceError('SYNC_PERMIT_STALE', 409)
	return decoded
}
export async function endRound(token: unknown): Promise<void> {
	const decoded = await assertRound(token)
	await pool.query(
		"UPDATE coordinacion_integracion SET sincronizacion='{}' WHERE id=1 AND sincronizacion->>'owner'=$1",
		[decoded.executionId],
	)
}
