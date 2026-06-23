import { setFlow } from '@rips/grammy-kit'
import { parsePresetId } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { BuyChooseEntryCountPage } from '../../pages/play/buy-choose-entry-count-page'
import { EffectType } from '../../types'
import { fetchPreset } from '../../utils/api/wrappers'

export const openBuyChooseEntryCount: ActionDef<number> = withPayload(
	(presetId) => presetId.toString(),
	(raw) => parsePresetId(raw),
	async (session, presetId) => {
		const availablePreset = await fetchPreset(presetId)

		setFlow(session, 'buyEntries', 'preset-chosen', { presetId })

		return {
			type: EffectType.EDIT,
			page: BuyChooseEntryCountPage.render(availablePreset),
		}
	},
)
