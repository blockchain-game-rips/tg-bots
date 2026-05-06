import { ActionDef } from './action-def'
import { actionRegistry } from './action-registry'
import { botActionDuration } from './metrics/registry'
import { ActionId, Effect, SessionData } from './types'
import { registerEncoder } from './utils/action-data'

type ActionRegistry = typeof actionRegistry
type ActionName = keyof ActionRegistry

type PayloadOf<D> = D extends ActionDef<infer P> ? P : never

export type { ActionId }

export type BoundAction = {
	decode: (raw: string) => unknown
	handler: (
		session: SessionData,
		payload: unknown,
	) => Promise<Effect> | Effect
}

function toActionId(index: number): string {
	return index.toString(36)
}

function buildActionIds(
	registry: Record<string, ActionDef<any>>,
): Record<string, ActionId<any>> {
	const result: Record<string, ActionId<any>> = {}

	Object.keys(registry).forEach((key, index) => {
		result[key] = toActionId(index) as ActionId<any>
	})

	return result
}

function buildActions(
	registry: Record<string, ActionDef<any>>,
): Record<string, BoundAction> {
	const result: Record<string, BoundAction> = {}

	Object.entries(registry).forEach(([name, def], index) => {
		const id = toActionId(index)

		registerEncoder(id, def.encode as (v: unknown) => string)

		result[id] = {
			decode: def.decode,
			handler: async (session, payload) => {
				const end = botActionDuration.startTimer({ action: name })
				try {
					return await def.handler(session, payload)
				} finally {
					end()
				}
			},
		}
	})

	return result
}

export const actionIds = buildActionIds(actionRegistry) as {
	[K in ActionName]: ActionId<PayloadOf<(typeof actionRegistry)[K]>>
}

export const actions = buildActions(actionRegistry)
