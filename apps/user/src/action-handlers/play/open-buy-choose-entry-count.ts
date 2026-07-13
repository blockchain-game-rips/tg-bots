import { parsePresetId } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { toFlow } from '../../flows'
import { BuyChooseEntryCountPage } from '../../pages/play/buy-choose-entry-count-page'
import { EffectType } from '../../types'
import { fetchPreset } from '../../utils/api/wrappers'

export const openBuyChooseEntryCount: ActionDef<number> = withPayload(
	{
		encode: (presetId) => presetId.toString(),
		decode: (raw) => parsePresetId(raw),
	},
	async (_session, presetId) => {
		const availablePreset = await fetchPreset(presetId)

		const flow = toFlow('buyEntries', 'preset-chosen', { presetId })

		return {
			flow,
			effect: {
				type: EffectType.EDIT,
				page: BuyChooseEntryCountPage.render(availablePreset),
			},
		}
	},
)
