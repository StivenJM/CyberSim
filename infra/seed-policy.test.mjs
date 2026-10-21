import assert from 'node:assert/strict'
import test from 'node:test'
import { startupScripts } from './seed-policy.mjs'

test('sin la variable no ejecuta el seed de demostración', () => {
	assert.deepEqual(startupScripts(undefined), [
		'migrate:deploy',
		'db:sync-scenarios',
	])
})

test('con false no ejecuta el seed de demostración', () => {
	assert.deepEqual(startupScripts('false'), [
		'migrate:deploy',
		'db:sync-scenarios',
	])
})

test('con true ejecuta migración, seed y catálogo', () => {
	assert.deepEqual(startupScripts('true'), [
		'migrate:deploy',
		'db:seed',
		'db:sync-scenarios',
	])
})

test('solo el valor true activa el seed', () => {
	for (const value of ['1', 'TRUE', 'yes', '', false]) {
		assert.ok(!startupScripts(value).includes('db:seed'))
	}
})
