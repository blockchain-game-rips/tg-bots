import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { WithdrawChooseChainPage } from '../../pages/wallet/withdraw-choose-chain-page'
import { EffectType } from '../../types'

export const openWithdrawChooseChain: ActionDef<void> = noPayload(() => ({
	type: EffectType.EDIT,
	page: WithdrawChooseChainPage.render(),
}))
