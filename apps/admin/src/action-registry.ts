import {
	openSetDefaultFee,
	submitSetDefaultFee,
} from './action-handlers/execute-set-default-fee'
import {
	executePause,
	executeUnpause,
} from './action-handlers/execute-set-paused'
import { openHome } from './action-handlers/open-home'
import { ActionHandler } from './types'

export const actionRegistry = {
	openHome,
	executePause,
	executeUnpause,
	openSetDefaultFee,
	submitSetDefaultFee,
} satisfies Record<string, ActionHandler>
