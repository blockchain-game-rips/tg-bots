import { FormattedString } from '@rips/grammy-kit'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildChooseChainPage } from '../choose-chain-token'

export const WithdrawChooseChainPage = {
	render(): PageContent {
		return buildChooseChainPage({
			lines: [FormattedString.b('💸 Withdraw'), '', 'Select a chain:'],
			chainActionId: actionIds.openWithdrawChooseToken,
			chainPayload: (chain) => chain,
			nav: { parent: actionIds.openWallet, home: actionIds.openHome },
		})
	},
}
