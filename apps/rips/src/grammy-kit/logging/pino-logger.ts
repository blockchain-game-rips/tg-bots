import { pino } from 'pino'

export const logger = pino({
	formatters: {
		level(label) {
			return { level: label }
		},
	},
	timestamp: () => `,"time":"${new Date().toISOString()}"`,
})
