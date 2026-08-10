import { Chain } from '@rips/shared'
import { assertFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload, withPayload } from '../../../action-def'
import { toHold } from '../../../flows'
import {
	EnterChoosePaymentTokenPage,
	EnterChoosePaymentChainPage,
} from '../../../pages/play/enter-choose-payment-chain-token-pages'
import { EffectType } from '../../../types'
import { fetchCurrencies } from '../../../utils/api/wrappers'
import { chainCodec, getCurrenciesForChain } from '../../../utils/chain'

export const openEnterChoosePaymentChain: ActionDef<void> = noPayload(
	(session) => {
		assertFlow(session, 'enter', 'choosing-payment-token', 'at-checkout')

		const { availablePreset } = session.flow.data

		return {
			flow: toHold(),
			effect: {
				type: EffectType.EDIT,
				page: EnterChoosePaymentChainPage.render({ availablePreset }),
			},
		}
	},
)

export const openEnterChoosePaymentToken: ActionDef<Chain> = withPayload(
	chainCodec,
	async (session, chain) => {
		assertFlow(session, 'enter', 'choosing-payment-token', 'at-checkout')

		const { availablePreset } = session.flow.data

		const currencies = await fetchCurrencies(getCurrenciesForChain(chain))

		return {
			flow: toHold(),
			effect: {
				type: EffectType.EDIT,
				page: EnterChoosePaymentTokenPage.render({
					availablePreset,
					currencies,
				}),
			},
		}
	},
)
