import { toFlow } from '@rips/grammy-kit'
import { parsePresetId } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { Flow } from '../../flows'
import { BuyChooseEntryCountPage } from '../../pages/play/buy-choose-entry-count-page'
import { EffectType } from '../../types'
import { fetchPreset } from '../../utils/api/wrappers'

export const openBuyChooseEntryCount: ActionDef<number> = withPayload(
	(presetId) => presetId.toString(),
	(raw) => parsePresetId(raw),
	async (_session, presetId) => {
		const availablePreset = await fetchPreset(presetId)

		const flow = toFlow<Flow, 'buyEntries', 'preset-chosen'>(
			'buyEntries',
			'preset-chosen',
			{ presetId },
		)

		return {
			flow,
			effect: {
				type: EffectType.EDIT,
				page: BuyChooseEntryCountPage.render(availablePreset),
			},
		}
	},
)
