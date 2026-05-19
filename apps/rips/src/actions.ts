import {
	ActionDef,
	ActionId,
	buildActionIds,
	buildActions,
} from '@rips/grammy-kit'
import { actionRegistry } from './action-registry'

type ActionRegistry = typeof actionRegistry
type ActionName = keyof ActionRegistry
type PayloadOf<D> = D extends ActionDef<infer P> ? P : never

export const actionIds = buildActionIds(actionRegistry) as {
	[K in ActionName]: ActionId<PayloadOf<(typeof actionRegistry)[K]>>
}

export const actions = buildActions(actionRegistry)
