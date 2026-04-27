export const actionIds = {
	showTestHome: 'sth',
	showChooseTickets: 'sct',
	showConfirm: 'scf',
	requestCustomCount: 'rcc',
} as const

export type ActionId = (typeof actionIds)[keyof typeof actionIds]
