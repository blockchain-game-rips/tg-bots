import { ActionDef, noPayload } from '../../action-def'
import { toReset } from '../../flows'
import { WithdrawChooseChainPage } from '../../pages/wallet/withdraw-choose-chain-page'
import { EffectType } from '../../types'

export const openWithdrawChooseChain: ActionDef<void> = noPayload(() => ({
	flow: toReset(),
	effect: { type: EffectType.EDIT, page: WithdrawChooseChainPage.render() },
}))
