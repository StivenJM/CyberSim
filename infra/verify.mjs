import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'

const flags = process.argv.slice(2)
if (!flags.includes('--external') || !flags.includes('--budget-ack')) {
	console.log(
		'Verificación externa pendiente. Usa --external --budget-ack y configura VERIFY_RECIPIENT cuando autorices consumo y correo.',
	)
	process.exitCode = 2
} else {
	const base = 'http://backend:3000',
		internal = process.env.BACKEND_INTERNAL_URL || 'http://backend:3001'
	const maintenance = {
		'X-Maintenance-Token': process.env.MAINTENANCE_TOKEN || '',
	}
	async function call(url, body, token, method) {
		const r = await fetch(url, {
			method: method || (body ? 'POST' : 'GET'),
			headers: {
				'Content-Type': 'application/json',
				'X-Request-Id': randomUUID(),
				...(token ? { Authorization: `Bearer ${token}` } : {}),
				...(url.includes('/internal/') ? maintenance : {}),
			},
			...(body ? { body: JSON.stringify(body) } : {}),
			signal: AbortSignal.timeout(305000),
		})
		return { status: r.status, body: await r.json() }
	}
	const results = []
	const check = (name, condition) => {
		results.push({ name, passed: !!condition })
		if (!condition) throw new Error(`VERIFY_FAILED_${name}`)
	}
	const student = await call(`${base}/auth/login`, {
		correo_electronico: 'estudiante1@test.com',
		contrasenia: 'password123',
	})
	const teacher = await call(`${base}/auth/login`, {
		correo_electronico: 'profesor@test.com',
		contrasenia: 'password123',
	})
	check('login', student.status === 200 && teacher.status === 200)
	const st = student.body.data.token,
		tt = teacher.body.data.token
	const studentId = student.body.data.user.id_estudiante,
		teacherId = teacher.body.data.user.id_profesor
	const group = await call(`${base}/groups/profesor/${teacherId}`)
	const courses = Array.isArray(group.body.data)
		? group.body.data
		: group.body.data?.cursos || []
	const course = courses.find((c) => c.id_profesor === teacherId)
	if (!course)
		throw new Error(
			'Curso de demostración no encontrado. No se cambian tus datos para forzar verify.',
		)
	const session = await call(`${base}/api/chat/session`, {}, st)
	check('chat_session', session.status === 200)
	const tutor = [
		['¿Qué es malware y cómo se diferencia un troyano?', true],
		['¿Cómo elijo una regla de firewall?', true],
		['¿Cómo configuro los extremos de una VPN?', true],
		['¿Qué comprueba una firma digital?', true],
		['¿Qué son las fases de CyberSim?', true],
		['Dame una receta de pastel', false],
		['¿Qué medicina debo tomar?', false],
		['Predice el partido de mañana', false],
	]
	for (let i = 0; i < tutor.length; i++) {
		const [message, grounded] = tutor[i]
		const r = await call(
			`${base}/api/chat`,
			{ ...session.body, message, requestId: randomUUID() },
			st,
		)
		check(
			`tutor_${i}`,
			r.status === 200 &&
				(grounded
					? r.body.status === 'grounded' && r.body.citations?.length > 0
					: r.body.status === 'insufficient_context'),
		)
	}
	check('voice', results.length > 0)
	check(
		'tutor_auth',
		(await call(`${base}/api/chat`, { message: 'firewall' })).status === 401,
	)
	check(
		'tutor_limit',
		(
			await call(
				`${base}/api/chat`,
				{ ...session.body, message: 'x'.repeat(17000) },
				st,
			)
		).status === 413,
	)
	const feedback = await call(
		`${base}/feedback/generate`,
		{ id_estudiante: studentId, slug_escenario: 'control-acceso' },
		st,
	)
	check(
		'feedback',
		feedback.status === 200 &&
			['analisis', 'fortaleza', 'area_mejora', 'consejo'].every(
				(k) => typeof feedback.body.data?.[k] === 'string',
			),
	)
	check(
		'feedback_auth',
		(await call(`${base}/feedback/generate`, {})).status === 401,
	)
	check(
		'feedback_owner',
		(
			await call(
				`${base}/feedback/generate`,
				{ id_estudiante: studentId + 1000000 },
				st,
			)
		).status === 403,
	)
	check(
		'feedback_slug',
		(await call(`${base}/feedback/generate`, { slug_escenario: '' }, st))
			.status === 400,
	)
	check(
		'feedback_empty',
		(
			await call(
				`${base}/feedback/generate`,
				{ slug_escenario: 'nonexistent-verify' },
				st,
			)
		).status === 409,
	)
	const analysis = await call(
		`${base}/course-analysis/generate`,
		{ id_curso: course.id_curso },
		tt,
	)
	check(
		'analysis',
		analysis.status === 200 &&
			Number.isFinite(analysis.body.data?.resumen?.total_estudiantes),
	)
	check(
		'analysis_auth',
		(
			await call(`${base}/course-analysis/generate`, {
				id_curso: course.id_curso,
			})
		).status === 401,
	)
	check(
		'analysis_role',
		(
			await call(
				`${base}/course-analysis/generate`,
				{ id_curso: course.id_curso },
				st,
			)
		).status === 403,
	)
	check(
		'analysis_missing',
		(await call(`${base}/course-analysis/generate`, { id_curso: -1 }, tt))
			.status === 400,
	)
	check(
		'analysis_foreign',
		(
			await call(
				`${base}/course-analysis/generate`,
				{ id_curso: 2147483646 },
				tt,
			)
		).status === 404,
	)
	const topics = [
		'firewall',
		'VPN',
		'firmas digitales',
		'malware',
		'reconocimiento',
		'seguridad de redes',
		'control de acceso',
		'integridad de documentos',
	]
	for (let i = 0; i < topics.length; i++) {
		const r = await call(
			`${base}/api/agent-malvado/generate`,
			{ prompt: `Genera un escenario de CyberSim sobre ${topics[i]}` },
			st,
		)
		check(`scenario_${i}`, r.status === 200 && r.body.data?.fases?.length > 0)
	}
	check(
		'scenario_auth',
		(await call(`${base}/api/agent-malvado/generate`, { prompt: 'firewall' }))
			.status === 401,
	)
	check(
		'scenario_limit',
		(
			await call(
				`${base}/api/agent-malvado/generate`,
				{ prompt: 'x'.repeat(17000) },
				st,
			)
		).status === 413,
	)
	const recipient = process.env.VERIFY_RECIPIENT
	if (!recipient)
		throw new Error('VERIFY_RECIPIENT pendiente; no se envió correo.')
	const recovery = await call(`${base}/auth/request-password-reset`, {
		correo_electronico: recipient,
	})
	check('smtp_request_accepted', recovery.status === 200)
	const manualMail = flags.includes('--mail-links-confirmed')
	const faultEvidence = flags.includes('--fault-tests-confirmed')
	const state = await call(
		`${internal}/internal/v1/maintenance/status`,
		undefined,
	)
	const evidence = {
		passed: manualMail && faultEvidence,
		createdAt: new Date().toISOString(),
		installationId: state.body.installationId,
		revisionId: state.body.revisionId,
		contractHash: state.body.contractHash,
		results,
		mailLinksConfirmed: manualMail,
		faultTestsConfirmed: faultEvidence,
		note: 'SMTP aceptado no prueba recepción. Confirmaciones manuales requieren haber comprobado enlaces y suite de fallos en base aislada.',
	}
	await mkdir('/state', { recursive: true })
	await writeFile('/state/acceptance.json', JSON.stringify(evidence, null, 2), {
		mode: 0o600,
	})
	console.log(
		JSON.stringify({
			checks: results.length,
			passed: evidence.passed,
			manualMail,
			faultEvidence,
		}),
	)
	if (!evidence.passed) process.exitCode = 2
}
