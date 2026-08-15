import { botActionDuration } from '../metrics/registry'
import { ActionId, AnyHandlerResult } from '../types'
import { registerEncoder } from './action-data'
import { ActionContext, ActionDef, AnyActionDef } from './action-def'

export type { ActionId }

export interface BoundAction {
	decode: (raw: string) => unknown
	handler: (
		actionContext: ActionContext,
		payload: unknown,
	) => Promise<AnyHandlerResult> | AnyHandlerResult
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
			handler: async (actionContext, payload) => {
				const end = botActionDuration.startTimer({ action: name })
				try {
					return await def.handler(actionContext, payload)
				} finally {
					end()
				}
			},
		}
	})

	return result
}
