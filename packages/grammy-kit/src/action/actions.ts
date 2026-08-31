import { botActionDuration } from '../metrics/registry'
import { ActionId, AnyHandlerResult } from '../types'
import { registerEncoder } from './action-data'
import { ActionContext, AnyActionDef } from './action-def'
import { ActionDeclarations } from './declare-actions'

export type { ActionId }

export interface BoundAction {
	decode: (raw: string) => unknown
	handler: (
		actionContext: ActionContext,
		payload: unknown,
	) => Promise<AnyHandlerResult> | AnyHandlerResult
}

/**
 * Binds each handler under the id its declaration allocated, looked up by
 * name — the registry's own order carries no meaning.
 */
export function buildActions(
	actionIds: ActionDeclarations,
	registry: Record<string, AnyActionDef>,
): Record<string, BoundAction | undefined> {
	const result: Record<string, BoundAction> = {}

	Object.entries(registry).forEach(([name, def]) => {
		const id = actionIds[name]

		if (id === undefined)
			throw new Error(`Action "${name}" has no declared id`)

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
