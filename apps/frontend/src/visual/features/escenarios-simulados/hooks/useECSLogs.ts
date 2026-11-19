import { useCallback, useEffect, useRef, useState } from 'react'

export interface LogEntry {
	numero: string
	content: string
	category: string
}

export function useECSLogs() {
	const [mostrarNuevoLog, setMostrarNuevoLog] = useState(false)
	const [mensajeLog, setMensajeLog] = useState('')
	const [numeroLog, setNumeroLog] = useState(0)
	const [tipoLog, setTipoLog] = useState<
		'ataque' | 'advertencia' | 'completado' | 'informacion'
	>('advertencia')
	const [logs, setLogs] = useState<LogEntry[]>([])
	const [logsPanelOpen, setLogsPanelOpen] = useState(false)
	const [hasNewLog, setHasNewLog] = useState(false)

	const lastSeenCountRef = useRef(0)
	const closeDevicePanelRef = useRef<(() => void) | null>(null)
	// Numeración secuencial de los mensajes: sustituye al tiempo mostrado.
	const logCounterRef = useRef(0)
	// Ref para no romper la identidad de `agregarLog` cuando cambia el panel:
	// si `agregarLog` cambiara de identidad, el efecto de useECSScene se
	// re-ejecutaría y perdería sus suscripciones.
	const logsPanelOpenRef = useRef(false)

	useEffect(() => {
		logsPanelOpenRef.current = logsPanelOpen
	}, [logsPanelOpen])

	const agregarLog = useCallback((content: string, category: string) => {
		logCounterRef.current += 1
		const nuevoLog = {
			numero: String(logCounterRef.current),
			content,
			category,
		}
		setLogs((prev) => [...prev, nuevoLog])
		setNumeroLog(logCounterRef.current)
		if (!logsPanelOpenRef.current) {
			setHasNewLog(true)
		}
	}, [])

	const toggleLogsPanel = useCallback(
		(isOpen: boolean) => {
			setLogsPanelOpen(isOpen)
			if (isOpen) {
				setHasNewLog(false)
				lastSeenCountRef.current = logs.length
				closeDevicePanelRef.current?.()
			}
		},
		[logs.length],
	)

	const resetLogs = useCallback(() => {
		setLogs([])
		setMostrarNuevoLog(false)
		logCounterRef.current = 0
		lastSeenCountRef.current = 0
	}, [])

	return {
		mostrarNuevoLog,
		mensajeLog,
		numeroLog,
		tipoLog,
		logs,
		hasNewLog,
		logsPanelOpen,
		setMostrarNuevoLog,
		setMensajeLog,
		setTipoLog,
		agregarLog,
		toggleLogsPanel,
		resetLogs,
		closeDevicePanelRef,
	}
}
