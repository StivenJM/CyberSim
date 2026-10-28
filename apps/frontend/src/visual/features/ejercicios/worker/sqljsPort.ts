import type { SqlParams, SqlPort } from '@cybersim/exercises'
import type { Database, SqlJsStatic, SqlValue } from 'sql.js'

function bindable(params: SqlParams | undefined) {
	if (params === undefined) return undefined
	if (Array.isArray(params)) return params as SqlValue[]
	return Object.fromEntries(
		Object.entries(params).map(([key, value]) => [
			key.startsWith(':') ? key : `:${key}`,
			value,
		]),
	)
}

/**
 * In-memory SQLite port backed by sql.js.
 *
 * Each port owns a fresh database built from the fixture schema, so a probe
 * cannot contaminate another one. No OPFS, no network, no host filesystem.
 */
export function createSqlJsPort(SQL: SqlJsStatic, schema: string): SqlPort {
	const db: Database = new SQL.Database()
	db.run(schema)

	const rowsOf = (table: string) =>
		db.exec(`SELECT * FROM ${table} ORDER BY 1`)[0]?.values ?? []

	return {
		query(sql, params) {
			const statement = db.prepare(sql)
			try {
				const bound = bindable(params)
				if (bound !== undefined) statement.bind(bound as never)
				const rows: Record<string, unknown>[] = []
				while (statement.step()) {
					rows.push(statement.getAsObject() as Record<string, unknown>)
				}
				return rows
			} finally {
				statement.free()
			}
		},
		execute(sql, params) {
			const statement = db.prepare(sql)
			try {
				const bound = bindable(params)
				if (bound !== undefined) statement.bind(bound as never)
				statement.step()
			} finally {
				statement.free()
			}
		},
		snapshot: () =>
			JSON.stringify({
				loans: rowsOf('loans'),
				books: rowsOf('books'),
				users: rowsOf('users'),
			}),
		close() {
			db.close()
		},
	}
}
