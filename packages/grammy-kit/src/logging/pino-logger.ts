import { pino } from 'pino'
import { currentRequestContext } from './request-context'

export const logger = pino({
	formatters: {
		level(label) {
			return { level: label }
		},
	},
	timestamp: () => `,"time":"${new Date().toISOString()}"`,
	mixin() {
		return { ...currentRequestContext() }
	},
})
