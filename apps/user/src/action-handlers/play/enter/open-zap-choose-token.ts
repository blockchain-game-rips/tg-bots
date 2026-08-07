import { assertFlow } from '@rips/grammy-kit'
import { ActionDef, withPayload } from '../../../action-def'
import { toHold } from '../../../flows'
import { ZapChooseTokenPage } from '../../../pages/play/zap-choose-token-page'
import { Chain, EffectType } from '../../../types'
import { fetchCurrencies } from '../../../utils/api/wrappers'
import { chainCodec, getCurrenciesForChain } from '../../../utils/chain'

export const openZapChooseToken: ActionDef<Chain> = withPayload(
	chainCodec,
	async (session, chain) => {
		assertFlow(session, 'enter', 'choosing-payment-token', 'at-checkout')

		const { availablePreset } = session.flow.data

		const currencies = await fetchCurrencies(getCurrenciesForChain(chain))

		return {
			flow: toHold(),
			effect: {
				type: EffectType.EDIT,
				page: ZapChooseTokenPage.render({
					availablePreset,
					currencies,
				}),
			},
		}
	},
)
