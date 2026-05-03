import { WithdrawChooseChainPage } from '../../pages/wallet/withdraw-choose-chain-page'
import { Effect, EffectType, SessionData } from '../../types'

export function openWithdrawChooseChain(
	_session: SessionData,
	_payload: string | undefined,
): Effect {
	return {
		type: EffectType.EDIT,
		page: WithdrawChooseChainPage.render(),
	}
}
