import { assertFlow } from '@rips/grammy-kit'
import { parsePresetId } from '@rips/shared'
import { ActionDef, noPayload, withPayload } from '../../../action-def'
import { toFlow, toHold } from '../../../flows'
import { EnterChooseEntryCountPage } from '../../../pages/play/enter-choose-entry-count-page'
import { EffectType } from '../../../types'
import { fetchPreset } from '../../../utils/api/wrappers'

export const openEnterChooseEntryCount: ActionDef<number> = withPayload(
	{
		encode: (presetId) => presetId.toString(),
		decode: (raw) => parsePresetId(raw),
	},
	async (_session, presetId) => {
		const availablePreset = await fetchPreset(presetId)

		return {
			flow: toFlow('enter', 'choosing-entry-count', { availablePreset }),
			effect: {
				type: EffectType.NAVIGATE,
				page: EnterChooseEntryCountPage.renderFreshDraft(
					availablePreset,
				),
			},
		}
	},
)

export const openEnterChooseEntryCountFromCheckout: ActionDef<void> = noPayload(
	(session) => {
		assertFlow(session, 'enter', 'choosing-payment-token', 'at-checkout')

		const { availablePreset } = session.flow.data

		return {
			flow: toHold(),
			effect: {
				type: EffectType.NAVIGATE,
				page: EnterChooseEntryCountPage.renderDraftEdit(
					availablePreset,
				),
			},
		}
	},
)
