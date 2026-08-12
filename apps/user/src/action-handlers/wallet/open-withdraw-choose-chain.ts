import { ActionDef, noPayload } from '../../action-def'
import { SUPPORTED_CHAINS } from '../../constants'
import { toReset } from '../../flows'
import { WithdrawChooseChainPage } from '../../pages/wallet/withdraw-choose-chain-page'
import { EffectType } from '../../types'

export const openWithdrawChooseChain: ActionDef<void> = noPayload(() => ({
	flow: toReset(),
	effect: {
		type: EffectType.NAVIGATE,
		page: WithdrawChooseChainPage.render({ chains: [...SUPPORTED_CHAINS] }),
	},
}))
