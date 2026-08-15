import { ActionDef, noPayload } from '../../action-def'
import { getSupportedChains } from '../../supported-currencies'
import { toReset } from '../../flows'
import { WithdrawChooseChainPage } from '../../pages/wallet/withdraw-choose-chain-page'
import { EffectType } from '../../types'

export const openWithdrawChooseChain: ActionDef<void> = noPayload(() => ({
	flow: toReset(),
	effect: {
		type: EffectType.NAVIGATE,
		page: WithdrawChooseChainPage.render({ chains: getSupportedChains() }),
	},
}))
