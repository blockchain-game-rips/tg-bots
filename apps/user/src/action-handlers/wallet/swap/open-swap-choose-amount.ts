import { ChainAddressDtoOutput } from '@rips/api-client'
import { assertFlow, isFlow, SessionData } from '@rips/grammy-kit'
import { ActionDef, withPayload } from '../../../action-def'
import { balanceCache } from '../../../cache/balance-cache'
import { Flow, toHold, toStep } from '../../../flows'
import { SwapChooseAmountPage } from '../../../pages/swap/swap-choose-amount-page'
import { EffectType, HandlerResult } from '../../../types'
import { currencyCache } from '../../../cache/currency-cache'
import { currencyChainAddressCodec } from '../../../utils/currency'

export const openSwapChooseAmount: ActionDef<ChainAddressDtoOutput> =
	withPayload(currencyChainAddressCodec, handler)

async function handler(
	session: SessionData<Flow>,
	dstChainAddress: ChainAddressDtoOutput,
): Promise<HandlerResult<Flow>> {
	if (isFlow(session, 'swap', 'src-dst-amount-chosen')) {
		const { srcChainAddress, dstCurrency } = session.flow.data

		const srcBalance = await balanceCache.getOne(
			session.telegramId,
			srcChainAddress,
		)

		return {
			flow: toHold(),
			effect: {
				type: EffectType.NAVIGATE,
				page: SwapChooseAmountPage.render({ srcBalance, dstCurrency }),
			},
		}
	}

	assertFlow(session, 'swap', 'src-chosen', 'src-dst-chosen')

	const { srcChainAddress } = session.flow.data

	const [srcBalance, dstCurrency] = await Promise.all([
		balanceCache.getOne(session.telegramId, srcChainAddress),
		currencyCache.getOne(dstChainAddress),
	])

	return {
		flow: toStep(session.flow, 'src-dst-chosen', {
			srcChainAddress,
			dstCurrency,
		}),
		effect: {
			type: EffectType.NAVIGATE,
			page: SwapChooseAmountPage.render({ srcBalance, dstCurrency }),
		},
	}
}
