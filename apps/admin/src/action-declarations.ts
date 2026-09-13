import { noPayloadId, withPayloadId } from '@rips/grammy-kit'

/**
 * Every action the bot can run, with the payload its buttons carry. Imports
 * nothing from pages or handlers, so a page can build a button without pulling
 * the whole handler graph in behind it. The `action-ids` script reads this to
 * keep the lockfile in step.
 */
export const actionDeclarations = {
	openHome: noPayloadId(),
	openState: noPayloadId(),
	openConfirmPause: noPayloadId(),
	openConfirmUnpause: noPayloadId(),
	executeConfirmPaused: noPayloadId(),
	openSetDefaultFee: noPayloadId(),
	submitConfirmSetDefaultFee: withPayloadId<string>(),
	executeConfirmSetDefaultFee: noPayloadId(),
	openFreezeReferrer: noPayloadId(),
	submitConfirmFreezeReferrer: withPayloadId<string>(),
	openUnfreezeReferrer: noPayloadId(),
	submitConfirmUnfreezeReferrer: withPayloadId<string>(),
	executeConfirmReferrerFrozen: noPayloadId(),
	openSetTiers: noPayloadId(),
	submitConfirmSetTiers: withPayloadId<string>(),
	executeConfirmSetTiers: noPayloadId(),
	openUpdatePresetConfig: noPayloadId(),
	submitConfirmUpdatePresetConfig: withPayloadId<string>(),
	executeConfirmUpdatePresetConfig: noPayloadId(),
	openSetBlockedCountries: noPayloadId(),
	submitConfirmSetBlockedCountries: withPayloadId<string>(),
	executeConfirmSetBlockedCountries: noPayloadId(),
	openUploadTerms: noPayloadId(),
	submitConfirmUploadTerms: withPayloadId<string>(),
	executeConfirmUploadTerms: noPayloadId(),
}
