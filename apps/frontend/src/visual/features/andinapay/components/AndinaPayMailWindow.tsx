import { Mail, Paperclip } from 'lucide-react'
import { useState } from 'react'
import {
	ANDINAPAY_INCIDENT_MAIL_ID,
	ANDINAPAY_MAIL,
	type AndinaPayMail,
} from '../data/mailbox'
import styles from '../styles/AndinaPayMail.module.css'
import {
	andinaPayStorageKey,
	isAndinaPayNoticeRead,
	markAndinaPayNoticeRead,
} from './AndinaPayCaseWorkspace'

function readMailIds(): string[] {
	try {
		const stored: unknown = JSON.parse(
			localStorage.getItem(`${andinaPayStorageKey()}:mail-read`) ?? '[]',
		)
		return Array.isArray(stored)
			? stored.filter((id): id is string => typeof id === 'string')
			: []
	} catch {
		return []
	}
}

const dateFormat = new Intl.DateTimeFormat('es-EC', {
	timeZone: 'America/Guayaquil',
	day: 'numeric',
	month: 'short',
	hour: '2-digit',
	minute: '2-digit',
	hour12: false,
})

export function AndinaPayMailWindow({
	onOpenMaterial,
	onIncidentRead,
}: {
	readonly onOpenMaterial: (reference: string) => void
	readonly onIncidentRead: () => void
}) {
	const [selected, setSelected] = useState<AndinaPayMail | null>(null)
	const [readIds, setReadIds] = useState(readMailIds)
	const isUnread = (mail: AndinaPayMail) =>
		mail.unread &&
		!readIds.includes(mail.id) &&
		!(mail.id === ANDINAPAY_INCIDENT_MAIL_ID && isAndinaPayNoticeRead())
	const unreadCount = ANDINAPAY_MAIL.filter(isUnread).length

	const openMail = (mail: AndinaPayMail) => {
		setSelected(mail)
		const next = [...new Set([...readIds, mail.id])]
		setReadIds(next)
		try {
			localStorage.setItem(
				`${andinaPayStorageKey()}:mail-read`,
				JSON.stringify(next),
			)
		} catch {
			// Reading remains available when browser storage is unavailable.
		}
		if (mail.id === ANDINAPAY_INCIDENT_MAIL_ID) {
			markAndinaPayNoticeRead()
			onIncidentRead()
		}
	}

	return (
		<div className={styles.mailbox}>
			<header className={styles.toolbar}>
				<Mail size={19} aria-hidden="true" />
				<strong>Correo</strong>
				<span>Respuesta a incidentes · AndinaPay</span>
			</header>
			<div className={styles.account}>analista@andinapay.example</div>
			<div className={`${styles.layout} ${selected ? styles.messageOpen : ''}`}>
				<nav className={styles.inbox} aria-label="Bandeja de entrada">
					<div className={styles.listHeader}>
						<strong>Entrada</strong>
						<span>{unreadCount} sin leer</span>
					</div>
					{ANDINAPAY_MAIL.map((mail) => (
						<button
							key={mail.id}
							type="button"
							className={`${styles.row} ${isUnread(mail) ? styles.unread : ''}`}
							aria-current={selected?.id === mail.id ? 'true' : undefined}
							aria-label={`${isUnread(mail) ? 'Sin leer. ' : ''}${mail.sender}. ${mail.subject}`}
							onClick={() => openMail(mail)}
						>
							<span className={styles.sender}>
								{isUnread(mail) && (
									<span className={styles.dot} aria-hidden="true" />
								)}
								{mail.sender}
							</span>
							<time dateTime={mail.date}>
								{dateFormat.format(new Date(mail.date))}
							</time>
							<span className={styles.subject}>
								{mail.subject}
								{mail.attachments && (
									<Paperclip size={13} aria-label="Con adjuntos" />
								)}
							</span>
							<span className={styles.preview}>{mail.preview}</span>
						</button>
					))}
				</nav>
				{selected ? (
					<article className={styles.message} aria-label={selected.subject}>
						<button
							type="button"
							className={styles.back}
							onClick={() => setSelected(null)}
						>
							← Volver a entrada
						</button>
						<h1>{selected.subject}</h1>
						<div className={styles.metadata}>
							<strong>{selected.sender}</strong>
							<span>&lt;{selected.address}&gt;</span>
							<span>Para: analista@andinapay.example</span>
							<time dateTime={selected.date}>
								{dateFormat.format(new Date(selected.date))} · Ecuador
							</time>
						</div>
						{selected.paragraphs.map((paragraph) => (
							<p key={paragraph}>{paragraph}</p>
						))}
						{selected.attachments && (
							<div className={styles.attachments}>
								<span>Abrir en el expediente</span>
								{selected.attachments.map((attachment) => (
									<button
										key={attachment.reference}
										type="button"
										onClick={() => onOpenMaterial(attachment.reference)}
									>
										<Paperclip size={15} aria-hidden="true" />
										{attachment.name}
									</button>
								))}
							</div>
						)}
					</article>
				) : (
					<div className={styles.empty}>
						<Mail size={32} aria-hidden="true" />
						<p>Selecciona un mensaje para leerlo</p>
						<span>
							{ANDINAPAY_MAIL.length} mensajes en la bandeja de entrada
						</span>
					</div>
				)}
			</div>
		</div>
	)
}
