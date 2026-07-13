import { assertFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { toHold } from '../../flows'
import { ZapChooseChainPage } from '../../pages/play/zap-choose-chain-page'
import { EffectType } from '../../types'
import { fetchPreset } from '../../utils/api/wrappers'

export const openZapChooseChain: ActionDef<void> = noPayload(
	async (session) => {
		assertFlow(session, 'buyEntries', 'entry-count-chosen')

		const { presetId, entryCount } = session.flow.data

		const availablePreset = await fetchPreset(presetId)

		return {
			flow: toHold(),
			effect: {
				type: EffectType.EDIT,
				page: ZapChooseChainPage.render({
					availablePreset,
					entryCount,
				}),
			},
		}
	},
)
