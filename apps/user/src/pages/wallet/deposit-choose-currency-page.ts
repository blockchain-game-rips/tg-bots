import { CurrencyDto } from '@rips/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { depositBreadcrumb } from '../../utils/display/breadcrumb'
import {
	buildChooseTokenPage,
	chainBreadcrumbSegment,
} from '../choose-chain-token'

export const DepositChooseCurrencyPage = {
	render(currencies: CurrencyDto[]): PageContent {
		return buildChooseTokenPage({
			lines: [
				depositBreadcrumb(chainBreadcrumbSegment(currencies)),
				'',
				'Select a token:',
			],
			currencies,
			tokenActionId: actionIds.openDepositAddress,
			tokenPayload: (currency) => currency.chainAddress,
			nav: {
				parent: actionIds.openDeposit,
				home: actionIds.openHome,
			},
		})
	},
}
