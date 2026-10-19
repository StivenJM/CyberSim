import { useGLTF } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const loader = new GLTFLoader()

export const preloadModel = (path: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		loader.load(
			path,
			() => {
				useGLTF.preload(path)
				resolve()
			},
			undefined,
			(error) => {
				console.error('Error cargando modelo', { path, error })
				reject(error)
			},
		)
	})
}
