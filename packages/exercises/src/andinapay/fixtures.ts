/**
 * Public laboratory fixtures from `docs/project/ejercicios/cwe-321-andinapay.md`.
 *
 * AES-256-GCM, 12-byte IV, 16-byte tag, lowercase hex with no prefix, UTF-8
 * plaintext and AAD with no BOM and no trailing newline. These values are
 * published authoring material: they are not secrets and must never be used
 * outside this exercise.
 */

export type AndinaPayKeyId =
	| 'legacy-demo'
	| 'recovery-v2'
	| 'archive-independent'
export type AndinaPayRecordId = 'R01' | 'R02' | 'R03' | 'R04'

export interface CipherEnvelope {
	readonly recordId: AndinaPayRecordId
	readonly keyId: AndinaPayKeyId
	readonly version: number
	readonly ivHex: string
	readonly aadUtf8: string
	readonly ciphertextHex: string
	readonly tagHex: string
}

export const ANDINAPAY_KEYS: Readonly<Record<AndinaPayKeyId, string>> = {
	'legacy-demo':
		'000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
	'recovery-v2':
		'202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f',
	'archive-independent':
		'404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f',
}

export const ANDINAPAY_PLAINTEXT: Readonly<Record<AndinaPayRecordId, string>> =
	{
		R01: '{"id":"R01","document":"SYN-001","cardToken":"tok_demo_A"}',
		R02: '{"id":"R02","document":"SYN-002","cardToken":"tok_demo_B"}',
		R03: '{"id":"R03","document":"SYN-003","cardToken":"tok_demo_C"}',
		R04: '{"id":"R04","document":"SYN-004","cardToken":"tok_demo_D"}',
	}

export const ANDINAPAY_ENVELOPES: readonly CipherEnvelope[] = [
	{
		recordId: 'R01',
		keyId: 'legacy-demo',
		version: 1,
		ivHex: '101112131415161718191a1b',
		aadUtf8: 'AndinaPay|R01|v1',
		ciphertextHex:
			'06dcf1726bf318e1fa442a312d1d0630a23d2b606fe06d93b4a0ac4a6e6465f97ccb346287c23a801553fc73b0ba677478e323168ee406b39e63',
		tagHex: 'b8656985e78563eb40dfa3697e468f3c',
	},
	{
		recordId: 'R02',
		keyId: 'legacy-demo',
		version: 1,
		ivHex: '1c1d1e1f2021222324252627',
		aadUtf8: 'AndinaPay|R02|v1',
		ciphertextHex:
			'391f3403122a017f9af8ee7beb6901a1d1718bc4cd799a38d2c07f0924e938af4dce12a5feff5fc0d3840367e02158f6cb5f66017267d3119a9f',
		tagHex: 'af20a0411ff18a3d109ba6117b95228b',
	},
	{
		recordId: 'R03',
		keyId: 'archive-independent',
		version: 1,
		ivHex: '28292a2b2c2d2e2f30313233',
		aadUtf8: 'AndinaPay|R03|v1',
		ciphertextHex:
			'775142f3c8538cf696cc0cf60ec7decaa4f5f58940562b5f8971b4209e8d9c32ad7d3793920f1c58dc91c40bfdd77cd32dbd630d24a7f8fbb835',
		tagHex: '772defdd4efe4ed60b8ad71f6d09c360',
	},
	{
		recordId: 'R04',
		keyId: 'legacy-demo',
		version: 1,
		ivHex: '58595a5b5c5d5e5f60616263',
		aadUtf8: 'AndinaPay|R04|v1',
		ciphertextHex:
			'801beaef967efc70afddc0632ed935fcd5b3f7c1146cdb85cc6a2026fa778d0d7d3c8d28011d5f919b7f0e93ef34a3bf2a616c059acab48d9060',
		tagHex: '050ba5aed7d481cacd6b90e556af0edb',
	},
	{
		recordId: 'R01',
		keyId: 'recovery-v2',
		version: 2,
		ivHex: '3435363738393a3b3c3d3e3f',
		aadUtf8: 'AndinaPay|R01|v2',
		ciphertextHex:
			'a891d61ce29a00896ae90c116675db2d24024322dced64645319127d4752fd75f0ebbbeecae39584ac856368ef6006ac11184babd36324d3e140',
		tagHex: 'ffd6aef2f4e34a1e3e58ed04fa70af41',
	},
	{
		recordId: 'R02',
		keyId: 'recovery-v2',
		version: 2,
		ivHex: '404142434445464748494a4b',
		aadUtf8: 'AndinaPay|R02|v2',
		ciphertextHex:
			'b976d4e5724ce75962007204a72e3e1166e3f8ed81629dfc3da7da2d50dafd20e6317c7f44b8f54926f253a6a7f2c780b5c78d55d0858fbf5c99',
		tagHex: '1ccbabdd245265d27fc5fafa1555759b',
	},
	{
		recordId: 'R04',
		keyId: 'recovery-v2',
		version: 2,
		ivHex: '4c4d4e4f5051525354555657',
		aadUtf8: 'AndinaPay|R04|v2',
		ciphertextHex:
			'b6f522a52da5bd5f79ef6eddf296fc088c79457d6d0b82a43241318d748273dc73998518fc4549a94bbea4036ced7f0b9748b3edbac1a008d56c',
		tagHex: 'dfeaea24ecb515b482584bf09805e4b2',
	},
]

export function envelopeFor(
	recordId: AndinaPayRecordId,
	keyId: AndinaPayKeyId,
	version: number,
): CipherEnvelope | undefined {
	return ANDINAPAY_ENVELOPES.find(
		(envelope) =>
			envelope.recordId === recordId &&
			envelope.keyId === keyId &&
			envelope.version === version,
	)
}
