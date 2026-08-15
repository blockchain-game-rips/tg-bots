import { ActionDef, noPayload } from '../../action-def'
import { getSupportedChains } from '../../supported-currencies'
import { toReset } from '../../flows'
import { DepositChooseChainPage } from '../../pages/wallet/deposit-choose-chain-page'
import { EffectType } from '../../types'

export const openDeposit: ActionDef<void> = noPayload(() => ({
	flow: toReset(),
	effect: {
		type: EffectType.NAVIGATE,
		page: DepositChooseChainPage.render({ chains: getSupportedChains() }),
	},
}))
