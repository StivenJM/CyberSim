import { concatBytes, hexToBytes, utf8 } from '../core.js'
import type { CipherEnvelope } from './fixtures.js'

export type EnvelopeDecision =
	| { readonly ok: true; readonly plaintext: string }
	| {
			readonly ok: false
			readonly code: 'AUTHENTICATION_FAILED' | 'INVALID_ENVELOPE'
			readonly detail: string
	  }

const HEX_64 = /^[0-9a-f]{64}$/
const HEX_24 = /^[0-9a-f]{24}$/
const HEX_32 = /^[0-9a-f]{32}$/
const HEX_EVEN = /^(?:[0-9a-f]{2})+$/

/**
 * Structural validation only. A malformed envelope is a typed result that
 * leaves the model untouched; it never yields partial plaintext.
 */
export function isValidEnvelope(envelope: CipherEnvelope): boolean {
	return (
		HEX_24.test(envelope.ivHex) &&
		HEX_32.test(envelope.tagHex) &&
		HEX_EVEN.test(envelope.ciphertextHex) &&
		typeof envelope.aadUtf8 === 'string'
	)
}

/**
 * Node 22+ and browsers both expose WebCrypto here. The tag travels
 * concatenated with the ciphertext, which is the representation this
 * implementation must prove rather than assume.
 */
export async function decryptEnvelope(
	envelope: CipherEnvelope,
	keyHex: string,
): Promise<EnvelopeDecision> {
	if (!HEX_64.test(keyHex) || !isValidEnvelope(envelope)) {
		return {
			ok: false,
			code: 'INVALID_ENVELOPE',
			detail: 'El envelope o la clave no tienen el formato admitido.',
		}
	}

	try {
		const key = await crypto.subtle.importKey(
			'raw',
			hexToBytes(keyHex) as unknown as BufferSource,
			{ name: 'AES-GCM', length: 256 },
			false,
			['decrypt'],
		)
		const sealed = concatBytes(
			hexToBytes(envelope.ciphertextHex),
			hexToBytes(envelope.tagHex),
		)
		const plaintext = await crypto.subtle.decrypt(
			{
				name: 'AES-GCM',
				iv: hexToBytes(envelope.ivHex) as unknown as BufferSource,
				additionalData: utf8(envelope.aadUtf8) as unknown as BufferSource,
				tagLength: 128,
			},
			key,
			sealed as unknown as BufferSource,
		)
		return { ok: true, plaintext: new TextDecoder().decode(plaintext) }
	} catch {
		return {
			ok: false,
			code: 'AUTHENTICATION_FAILED',
			detail: 'AUTHENTICATION_FAILED',
		}
	}
}
