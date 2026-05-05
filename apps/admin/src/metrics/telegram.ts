import { Transformer } from 'grammy'
import { telegramApiDuration } from './registry'

export function createTelegramMetricsTransformer(): Transformer {
	return async (prev, method, payload, signal) => {
		const end = telegramApiDuration.startTimer({ method })

		try {
			const result = await prev(method, payload, signal)
			end({ status: result.ok ? 'success' : 'error' })
			return result
		} catch (error) {
			end({ status: 'error' })
			throw error
		}
	}
}
