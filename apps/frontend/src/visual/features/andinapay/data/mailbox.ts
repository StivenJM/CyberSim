export interface AndinaPayMail {
	readonly id: string
	readonly sender: string
	readonly address: string
	readonly subject: string
	readonly date: string
	readonly preview: string
	readonly paragraphs: readonly string[]
	readonly unread?: boolean
	readonly attachments?: readonly { name: string; reference: string }[]
}

export const ANDINAPAY_INCIDENT_MAIL_ID = 'support-1042'

// Fixed narrative clock: Monday 26 October 2026, America/Guayaquil.
// Background mail adds workplace context, never evidence requirements or scores.
export const ANDINAPAY_MAIL: readonly AndinaPayMail[] = [
	{
		id: 'office-water',
		sender: 'Paula · Administración',
		address: 'paula@andinapay.example',
		subject: 'Visita de mantenimiento del dispensador',
		date: '2026-10-26T08:40:00-05:00',
		preview: 'El técnico viene al mediodía; recepción se encarga de recibirlo.',
		unread: true,
		paragraphs: [
			'Buen día, equipo. El proveedor confirmó la limpieza del dispensador de la cocina para hoy entre las 12:00 y las 12:30.',
			'Recepción se encarga de recibir al técnico. Durante ese rato pueden usar el agua de la sala de reuniones; no hace falta mover nada de los puestos.',
			'Gracias,\nPaula',
		],
	},
	{
		id: ANDINAPAY_INCIDENT_MAIL_ID,
		sender: 'Valeria · Soporte a comercios',
		address: 'soporte@andinapay.example',
		subject: 'RV: Mensaje recibido en soporte · #1042',
		date: '2026-10-26T08:36:00-05:00',
		preview:
			'Nos llegó un mensaje con una muestra de datos. Gerencia pidió que lo revises.',
		unread: true,
		paragraphs: [
			'Hola. A las 08:30 llegó este mensaje al canal de soporte. No corresponde a un comercio que hayamos podido identificar. Gerencia pidió que te lo pasemos para revisar qué se puede comprobar.',
			'Conservé el mensaje y el archivo recibido en el expediente de esta computadora. Por ahora no tenemos más información del remitente.',
			'Valeria\nSoporte a comercios · AndinaPay',
			'— Mensaje recibido · 26 de octubre, 08:30 —\nRemitente: no identificado\n\n«Hay una muestra de su base de datos circulando en un foro. Entre lo que se puede leer aparece: SYN-001 / tok_demo_A. Les dejo el archivo que encontré.»\n\nArchivo recibido: partial-v1.json',
		],
		attachments: [
			{
				name: 'Mensaje conservado · notice.txt',
				reference: 'incident/notice.txt',
			},
			{ name: 'partial-v1.json', reference: 'data/partial-v1.json' },
		],
	},
	{
		id: 'settlement-close',
		sender: 'Diego · Operaciones',
		address: 'diego@andinapay.example',
		subject: 'Conciliación del viernes: cierre registrado',
		date: '2026-10-26T08:12:00-05:00',
		preview:
			'Las dos diferencias eran del corte bancario; el cierre quedó registrado.',
		paragraphs: [
			'Buenos días. Cerramos la conciliación del viernes: los dos abonos que quedaban pendientes entraron en el siguiente corte del banco y ya están asociados a sus liquidaciones.',
			'El detalle quedó en la carpeta habitual de Operaciones. El equipo de soporte ya puede responder las consultas de esos comercios con el comprobante del cierre.',
			'Diego',
		],
	},
	{
		id: 'merchant-receipts',
		sender: 'Valeria · Soporte a comercios',
		address: 'soporte@andinapay.example',
		subject: 'Re: Nombre comercial en los comprobantes',
		date: '2026-10-26T07:55:00-05:00',
		preview:
			'La tienda confirmó el nombre que quiere mostrar. El ticket sigue con soporte.',
		paragraphs: [
			'Hola, equipo. La persona encargada de La Esquina confirmó que quiere mostrar el nombre del local en el comprobante, en lugar de la razón social completa.',
			'Ya le expliqué dónde se cambia en su panel. El ticket queda con soporte hasta que confirme cómo sale el siguiente comprobante; no requiere revisión técnica por ahora.',
			'Valeria',
		],
	},
	{
		id: 'weekly-coordination',
		sender: 'Camila · Gerencia',
		address: 'camila@andinapay.example',
		subject: 'Coordinación del lunes: cambio de sala',
		date: '2026-10-23T16:20:00-05:00',
		preview:
			'La reunión de coordinación será en la sala pequeña; la agenda sigue igual.',
		paragraphs: [
			'Equipo, el lunes usaremos la sala pequeña para la coordinación de las 10:00. La sala grande está reservada para las entrevistas de comercios.',
			'Mantenemos la agenda: altas de la semana, consultas pendientes de soporte y disponibilidad del equipo. Si alguien no puede asistir, me deja su actualización por el canal interno.',
			'Buen fin de semana,\nCamila',
		],
	},
	{
		id: 'office-delivery',
		sender: 'Paula · Administración',
		address: 'paula@andinapay.example',
		subject: 'Llegaron los soportes para las pantallas',
		date: '2026-10-23T11:10:00-05:00',
		preview:
			'Los soportes están en recepción. La instalación se coordina con cada puesto.',
		paragraphs: [
			'Ya llegaron los soportes que pedimos para las pantallas. Dejé las cajas en recepción con el nombre de cada puesto.',
			'La instalación se coordina individualmente para no interrumpir el trabajo. Quienes estaban esperando uno pueden escribirme cuando tengan un espacio esta semana.',
			'Paula',
		],
	},
]
