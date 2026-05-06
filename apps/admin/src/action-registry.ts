import {
	openSetDefaultFee,
	submitSetDefaultFee,
} from './action-handlers/execute-set-default-fee'
import {
	executeConfirmPaused,
	openConfirmPause,
	openConfirmUnpause,
} from './action-handlers/execute-set-paused'
import {
	openFreezeReferrer,
	openUnfreezeReferrer,
	submitFreezeReferrer,
	submitUnfreezeReferrer,
} from './action-handlers/execute-set-referrer-frozen'
import { openHome } from './action-handlers/open-home'
import { ActionHandler } from './types'

export const actionRegistry = {
	openHome,
	openConfirmPause,
	openConfirmUnpause,
	executeConfirmPaused,
	openSetDefaultFee,
	submitSetDefaultFee,
	openFreezeReferrer,
	submitFreezeReferrer,
	openUnfreezeReferrer,
	submitUnfreezeReferrer,
} satisfies Record<string, ActionHandler>
