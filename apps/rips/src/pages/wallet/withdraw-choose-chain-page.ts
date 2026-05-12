import { actionIds } from '../../actions'
import { SUPPORTED_CHAINS } from '../../constants'
import { PageContent } from '../../types'
import { buildChooseChainPage } from '../choose-chain-token'

export const WithdrawChooseChainPage = {
	render(): PageContent {
		return buildChooseChainPage({
			lines: ['<b>💸 Withdraw</b>', '', 'Select a chain:'],
			chainActionId: actionIds.openWithdrawChooseToken,
			chainPayload: (chainIndex) => SUPPORTED_CHAINS[chainIndex],
			nav: { parent: actionIds.openWallet, home: actionIds.openHome },
		})
	},
}
