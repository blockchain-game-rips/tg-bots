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
	executeConfirmReferrerFrozen,
	openFreezeReferrer,
	openUnfreezeReferrer,
	submitConfirmFreezeReferrer,
	submitConfirmUnfreezeReferrer,
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
	submitConfirmFreezeReferrer,
	openUnfreezeReferrer,
	submitConfirmUnfreezeReferrer,
	executeConfirmReferrerFrozen,
} satisfies Record<string, ActionHandler>
