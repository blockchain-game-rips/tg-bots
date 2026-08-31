import { declareActions, noPayloadId, payload } from '@rips/grammy-kit'

/**
 * Every action the bot can run, with the payload its buttons carry. Imports
 * nothing from pages or handlers, so a page can build a button without pulling
 * the whole handler graph in behind it.
 */
export const actionIds = declareActions({
	openHome: noPayloadId(),
	openState: noPayloadId(),
	openConfirmPause: noPayloadId(),
	openConfirmUnpause: noPayloadId(),
	executeConfirmPaused: noPayloadId(),
	openSetDefaultFee: noPayloadId(),
	submitConfirmSetDefaultFee: payload<string>(),
	executeConfirmSetDefaultFee: noPayloadId(),
	openFreezeReferrer: noPayloadId(),
	submitConfirmFreezeReferrer: payload<string>(),
	openUnfreezeReferrer: noPayloadId(),
	submitConfirmUnfreezeReferrer: payload<string>(),
	executeConfirmReferrerFrozen: noPayloadId(),
	openSetTiers: noPayloadId(),
	submitConfirmSetTiers: payload<string>(),
	executeConfirmSetTiers: noPayloadId(),
	openUpdatePresetConfig: noPayloadId(),
	submitConfirmUpdatePresetConfig: payload<string>(),
	executeConfirmUpdatePresetConfig: noPayloadId(),
})
