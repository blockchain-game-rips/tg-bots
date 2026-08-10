import { ActionDef, noPayload } from '../../action-def'
import { SUPPORTED_CHAINS } from '../../constants'
import { toReset } from '../../flows'
import { DepositChooseChainPage } from '../../pages/wallet/deposit-choose-chain-page'
import { EffectType } from '../../types'

export const openDeposit: ActionDef<void> = noPayload(() => ({
	flow: toReset(),
	effect: {
		type: EffectType.EDIT,
		page: DepositChooseChainPage.render({ chains: [...SUPPORTED_CHAINS] }),
	},
}))
