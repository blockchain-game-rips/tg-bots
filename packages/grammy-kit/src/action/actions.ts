import { botActionDuration } from '../metrics/registry'
import { ActionId, Effect, SessionData } from '../types'
import { registerEncoder } from './action-data'
import { ActionDef, AnyActionDef, resolveEffect } from './action-def'

export type { ActionId }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySession = SessionData<any>

export interface BoundAction {
	decode: (raw: string) => unknown
	handler: (session: AnySession, payload: unknown) => Promise<Effect> | Effect
}

function toActionId(index: number): ActionId {
	return index.toString(36) as ActionId
}

type PayloadOf<D> = D extends ActionDef<infer P> ? P : never

export function buildActionIds<R extends Record<string, AnyActionDef>>(
	registry: R,
): { [K in keyof R]: ActionId<PayloadOf<R[K]>> } {
	const result: Record<string, ActionId<unknown>> = {}

	Object.keys(registry).forEach((key, index) => {
		result[key] = toActionId(index)
	})

	return result as { [K in keyof R]: ActionId<PayloadOf<R[K]>> }
}

export function buildActions(
	registry: Record<string, AnyActionDef>,
): Record<string, BoundAction | undefined> {
	const result: Record<string, BoundAction> = {}

	Object.entries(registry).forEach(([name, def], index) => {
		const id = toActionId(index)

		registerEncoder(id, def.encode as (v: unknown) => string)

		result[id] = {
			decode: def.decode,
			handler: async (session, payload) => {
				const end = botActionDuration.startTimer({ action: name })
				try {
					const result = await def.handler(session, payload)

					return resolveEffect(session, result)
				} finally {
					end()
				}
			},
		}
	})

	return result
}
