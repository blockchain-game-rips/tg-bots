import { assertFlow } from '@rips/grammy-kit'
import { parsePresetId } from '@rips/shared'
import { ActionDef, noPayload, withPayload } from '../../../action-def'
import { presetCache } from '../../../cache/preset-cache'
import { toFlow, toHold } from '../../../flows'
import { EnterChooseEntryCountPage } from '../../../pages/play/enter-choose-entry-count-page'
import { EffectType } from '../../../types'

export const openEnterChooseEntryCount: ActionDef<number> = withPayload(
	{
		encode: (presetId) => presetId.toString(),
		decode: (raw) => parsePresetId(raw),
	},
	async (_session, presetId) => {
		const availablePreset = await presetCache.getOne(presetId)

		return {
			flow: toFlow('enter', 'choosing-entry-count', { presetId }),
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
	async (session) => {
		assertFlow(session, 'enter', 'choosing-payment-token', 'at-checkout')

		const availablePreset = await presetCache.getOne(
			session.flow.data.presetId,
		)

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
