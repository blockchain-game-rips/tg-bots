import { FormattedString } from '@rips/grammy-kit'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildChooseChainPage } from '../choose-chain-currency'

export const WithdrawChooseChainPage = {
	render(): PageContent {
		return buildChooseChainPage({
			lines: [FormattedString.b('💸 Withdraw'), '', 'Select a chain:'],
			chainActionId: actionIds.openWithdrawChooseCurrency,
			chainPayload: (chain) => chain,
			nav: { parent: actionIds.openWallet, home: actionIds.openHome },
		})
	},
}
