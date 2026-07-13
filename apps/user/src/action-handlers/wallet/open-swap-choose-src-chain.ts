import { isFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { SUPPORTED_CHAINS } from '../../constants'
import { toHold, toReset } from '../../flows'
import { SwapChooseSrcChainPage } from '../../pages/swap/swap-choose-src-chain-page'
import { EffectType } from '../../types'

export const openSwapChooseSrcChain: ActionDef<void> = noPayload((session) => {
	const chains = [...SUPPORTED_CHAINS]

	if (isFlow(session, 'swap', 'src-dst-amount-chosen')) {
		const { dstCurrency, amountIn } = session.flow.data

		return {
			flow: toHold(),
			effect: {
				type: EffectType.EDIT,
				page: SwapChooseSrcChainPage.renderDraftEdit({
					chains,
					dstCurrency,
					amount: amountIn,
				}),
			},
		}
	}

	return {
		flow: toReset(),
		effect: {
			type: EffectType.EDIT,
			page: SwapChooseSrcChainPage.renderFreshDraft({ chains }),
		},
	}
})
