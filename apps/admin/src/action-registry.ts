import { openHome } from './action-handlers/open-home'
import { ActionHandler } from './types'

export const actionRegistry = {
	openHome,
} satisfies Record<string, ActionHandler>
