import { assertFlow } from '@rips/grammy-kit'
import { ActionDef, withPayload } from '../../action-def'
import { toHold } from '../../flows'
import { ZapChooseTokenPage } from '../../pages/play/zap-choose-token-page'
import { Chain, EffectType } from '../../types'
import { fetchCurrencies, fetchPreset } from '../../utils/api/wrappers'
import { chainCodec, getCurrenciesForChain } from '../../utils/chain'

export const openZapChooseToken: ActionDef<Chain> = withPayload(
	chainCodec,
	async (session, chain) => {
		assertFlow(session, 'buyEntries', 'entry-count-chosen')

		const { presetId, entryCount } = session.flow.data

		const [availablePreset, currencies] = await Promise.all([
			fetchPreset(presetId),
			fetchCurrencies(getCurrenciesForChain(chain)),
		])

		return {
			flow: toHold(),
			effect: {
				type: EffectType.EDIT,
				page: ZapChooseTokenPage.render({
					availablePreset,
					entryCount,
					currencies,
				}),
			},
		}
	},
)
