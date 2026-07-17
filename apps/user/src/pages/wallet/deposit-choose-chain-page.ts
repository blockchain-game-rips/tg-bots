import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { depositBreadcrumb } from '../../utils/display/breadcrumb'
import { buildChooseChainPage } from '../choose-chain-token'

export const DepositChooseChainPage = {
	render(): PageContent {
		return buildChooseChainPage({
			lines: [depositBreadcrumb(), '', 'Select a chain:'],
			chainActionId: actionIds.openDepositChooseToken,
			chainPayload: (chain) => chain,
			nav: { parent: actionIds.openWallet, home: actionIds.openHome },
		})
	},
}
