import { ActionRegistryFor } from '@rips/grammy-kit'
import { actionIds } from './action-ids'
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
import {
	executeConfirmSetReferrerCustomFee,
	openSetReferrerCustomFee,
	submitConfirmSetReferrerCustomFee,
	submitSetReferrerCustomFeeAddress,
} from './action-handlers/execute-set-referrer-custom-fee'
import {
	executeConfirmSetTiers,
	openSetTiers,
	submitConfirmSetTiers,
} from './action-handlers/execute-set-tiers'
import {
	executeConfirmUpdatePresetConfig,
	openUpdatePresetConfig,
	submitConfirmUpdatePresetConfig,
} from './action-handlers/execute-update-preset-config'
import {
	executeConfirmSetBlockedCountries,
	openSetBlockedCountries,
	submitConfirmSetBlockedCountries,
} from './action-handlers/execute-set-blocked-countries'
import {
	executeConfirmUploadTerms,
	openUploadTerms,
	submitConfirmUploadTerms,
} from './action-handlers/execute-upload-terms'
import { openHome } from './action-handlers/open-home'
import { openState } from './action-handlers/open-state'

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
	openSetReferrerCustomFee,
	submitSetReferrerCustomFeeAddress,
	submitConfirmSetReferrerCustomFee,
	executeConfirmSetReferrerCustomFee,
	openSetTiers,
	submitConfirmSetTiers,
	executeConfirmSetTiers,
	openUpdatePresetConfig,
	submitConfirmUpdatePresetConfig,
	executeConfirmUpdatePresetConfig,
	openSetBlockedCountries,
	submitConfirmSetBlockedCountries,
	executeConfirmSetBlockedCountries,
	openUploadTerms,
	submitConfirmUploadTerms,
	executeConfirmUploadTerms,
} satisfies ActionRegistryFor<typeof actionIds>
