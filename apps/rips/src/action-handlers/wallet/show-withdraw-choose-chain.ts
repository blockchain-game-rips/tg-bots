import { WithdrawChooseChainPage } from '../../pages/wallet/withdraw-choose-chain-page'
import { Effect, EffectType, SessionData } from '../../types'

export function showWithdrawChooseChain(
	_session: SessionData,
	_payload: string | undefined,
): Effect {
	return {
		type: EffectType.EDIT,
		page: WithdrawChooseChainPage.render(),
	}
}
