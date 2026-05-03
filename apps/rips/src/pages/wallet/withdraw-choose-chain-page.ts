import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildChooseChainPage } from '../choose-chain-token'

export class WithdrawChooseChainPage {
	static render(): PageContent {
		return buildChooseChainPage({
			lines: ['<b>💸 Withdraw</b>', '', 'Select a chain:'],
			chainActionId: actionIds.openWithdrawChooseToken,
			chainPayload: (chainIndex) => chainIndex.toString(),
			nav: { parent: actionIds.openWallet, home: actionIds.openHome },
		})
	}
}
