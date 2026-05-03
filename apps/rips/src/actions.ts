import { actionRegistry } from './action-registry'
import { ActionHandler } from './types'

type ActionRegistry = typeof actionRegistry
type ActionName = keyof ActionRegistry

export type ActionId = string

function buildActionIds(
	registry: Record<string, ActionHandler>,
): Record<string, ActionId> {
	const result: Record<string, ActionId> = {}

	Object.keys(registry).forEach((key, index) => {
		result[key] = index.toString(36)
	})

	return result
}

function buildActions(
	registry: Record<string, ActionHandler>,
): Record<ActionId, ActionHandler> {
	const result: Record<ActionId, ActionHandler> = {}

	Object.entries(registry).forEach(([key, handler], index) => {
		result[index.toString(36)] = handler
	})

	return result
}

export const actionIds = buildActionIds(actionRegistry) as {
	[K in ActionName]: ActionId
}

export const actions = buildActions(actionRegistry)
