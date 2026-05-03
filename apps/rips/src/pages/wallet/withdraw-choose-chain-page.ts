import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildChooseChainPage } from '../choose-chain-token'

export class WithdrawChooseChainPage {
	static render(): PageContent {
		return buildChooseChainPage({
			lines: ['<b>💸 Withdraw</b>', '', 'Select a chain:'],
			chainActionId: actionIds.showWithdrawChooseToken,
			chainPayload: (chainIndex) => chainIndex.toString(),
			nav: { parent: actionIds.showWallet, home: actionIds.showHome },
		})
	}
}
