import { parsePresetId } from '@rips/shared'
import { ActionDef, withPayload } from '../../../action-def'
import { toFlow } from '../../../flows'
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

		const flow = toFlow('enter', 'choosing-entry-count', {
			availablePreset,
		})

		return {
			flow,
			effect: {
				type: EffectType.EDIT,
				page: EnterChooseEntryCountPage.render(availablePreset),
			},
		}
	},
)
