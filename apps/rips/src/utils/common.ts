import dotenv from 'dotenv'
import { logger } from '../logging/pino-logger'

export const wait = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms))

dotenv.config()
export function getEnvSafe(key: string): string {
	const value = process.env[key]

	if (!value) {
		throw new Error(`Environment variable ${key} is not set`)
	}

	return value
}

export function fireAndForget<T>(promise: Promise<T>) {
	promise.catch((error) => {
		logger.error(error)
	})
}
