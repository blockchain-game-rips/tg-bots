import { Chain } from '@rips/shared'
import { assertFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload, withPayload } from '../../../action-def'
import { presetCache } from '../../../cache/preset-cache'
import { SUPPORTED_CHAINS } from '../../../constants'
import { toHold } from '../../../flows'
import {
	EnterChoosePaymentTokenPage,
	EnterChoosePaymentChainPage,
} from '../../../pages/play/enter-choose-payment-chain-token-pages'
import { EffectType } from '../../../types'
import { fetchCurrencies } from '../../../utils/api/wrappers'
import { chainCodec, getCurrenciesForChain } from '../../../utils/chain'

export const openEnterChoosePaymentChain: ActionDef<void> = noPayload(
	async (session) => {
		assertFlow(session, 'enter', 'choosing-payment-token', 'at-checkout')

		const availablePreset = await presetCache.getOne(
			session.flow.data.presetId,
		)

		return {
			flow: toHold(),
			effect: {
				type: EffectType.NAVIGATE,
				page: EnterChoosePaymentChainPage.render({
					availablePreset,
					chains: [...SUPPORTED_CHAINS],
				}),
			},
		}
	},
)

export const openEnterChoosePaymentToken: ActionDef<Chain> = withPayload(
	chainCodec,
	async (session, chain) => {
		assertFlow(session, 'enter', 'choosing-payment-token', 'at-checkout')

		const [availablePreset, currencies] = await Promise.all([
			presetCache.getOne(session.flow.data.presetId),
			fetchCurrencies(getCurrenciesForChain(chain)),
		])

		return {
			flow: toHold(),
			effect: {
				type: EffectType.NAVIGATE,
				page: EnterChoosePaymentTokenPage.render({
					availablePreset,
					chain,
					currencies,
				}),
			},
		}
	},
)
