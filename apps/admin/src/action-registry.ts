import {
	executeConfirmSetDefaultFee,
	openSetDefaultFee,
	submitConfirmSetDefaultFee,
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
import { openState } from './action-handlers/open-state'
import { ActionHandler } from './types'

export const actionRegistry = {
	openHome,
	openState,
	openConfirmPause,
	openConfirmUnpause,
	executeConfirmPaused,
	openSetDefaultFee,
	submitConfirmSetDefaultFee,
	executeConfirmSetDefaultFee,
	openFreezeReferrer,
	submitConfirmFreezeReferrer,
	openUnfreezeReferrer,
	submitConfirmUnfreezeReferrer,
	executeConfirmReferrerFrozen,
} satisfies Record<string, ActionHandler>
