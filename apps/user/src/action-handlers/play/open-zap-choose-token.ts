import { assertFlow } from '@rips/grammy-kit'
import { parseChain } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { SUPPORTED_CHAINS } from '../../constants'
import { toHold } from '../../flows'
import { ZapChooseTokenPage } from '../../pages/play/zap-choose-token-page'
import { Chain, EffectType } from '../../types'
import { fetchCurrencies, fetchPreset } from '../../utils/api/wrappers'
import { findChainIndex, getCurrenciesForChain } from '../../utils/chain'

export const openZapChooseToken: ActionDef<Chain> = withPayload(
	(chain) => findChainIndex(chain).toString(),
	(raw) => parseChain(raw, SUPPORTED_CHAINS),
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
