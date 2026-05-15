import { collectDefaultMetrics, Histogram, Registry } from 'prom-client'

export const registry = new Registry()

collectDefaultMetrics({ register: registry })

export const telegramApiDuration = new Histogram({
	name: 'telegram_api_call_duration_seconds',
	help: 'Duration of Telegram Bot API calls',
	labelNames: ['method', 'status'] as const,
	buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
	registers: [registry],
})

export const botActionDuration = new Histogram({
	name: 'bot_action_duration_seconds',
	help: 'Duration of bot action handler execution',
	labelNames: ['action'] as const,
	buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
	registers: [registry],
})
