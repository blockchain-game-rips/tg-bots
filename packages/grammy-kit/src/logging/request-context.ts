import { AsyncLocalStorage } from 'async_hooks'
import { randomUUID } from 'crypto'

/**
 * Identifies one button press for the whole time it is being handled, so every
 * log line and every backend call it causes carries the same id. `messageId`
 * tells apart presses coming from different menus the user has open at once.
 */
export interface RequestContext {
	requestId: string
	telegramId: number
	messageId: number
}

const storage = new AsyncLocalStorage<RequestContext>()

export function runWithRequestContext<T>(
	context: Omit<RequestContext, 'requestId'>,
	run: () => Promise<T>,
): Promise<T> {
	return storage.run({ ...context, requestId: randomUUID() }, run)
}

export function currentRequestContext(): RequestContext | undefined {
	return storage.getStore()
}
