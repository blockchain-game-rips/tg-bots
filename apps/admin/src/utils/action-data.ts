import { ActionId } from '../actions'

export const COMMAND_SEPARATOR = ':'

export function buildActionData(actionId: ActionId, payload?: string): string {
	if (payload === undefined) return actionId
	return `${actionId}${COMMAND_SEPARATOR}${payload}`
}
