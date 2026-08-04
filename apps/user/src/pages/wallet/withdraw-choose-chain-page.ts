import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildChooseChainPage } from '../choose-chain-currency'
import { withdrawBreadcrumb } from '../../utils/display/breadcrumb'

export const WithdrawChooseChainPage = {
	render(): PageContent {
		const lines = [
			withdrawBreadcrumb(),
			'',
			'Choose the chain you want to withdraw from:',
		]

		return buildChooseChainPage({
			lines,
			chainActionId: actionIds.openWithdrawChooseCurrency,
			chainPayload: (chain) => chain,
			nav: { parent: actionIds.openWallet, home: actionIds.openHome },
		})
	},
}
