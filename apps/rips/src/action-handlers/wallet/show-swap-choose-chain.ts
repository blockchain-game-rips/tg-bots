import { SwapChooseChainPage } from '../../pages/wallet/swap-choose-chain'
import { Effect, EffectType, SessionData } from '../../types'
import { parseSwapSelecting } from '../../validation/swap-selecting'

export function showSwapChooseChain(
	_session: SessionData,
	payload: string | undefined,
): Effect {
	const selecting = parseSwapSelecting(payload)

	return {
		type: EffectType.EDIT,
		page: SwapChooseChainPage.render(selecting),
	}
}
