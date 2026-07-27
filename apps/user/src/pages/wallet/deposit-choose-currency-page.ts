import { CurrencyDto } from '@rips/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { depositBreadcrumb } from '../../utils/display/breadcrumb'
import {
	buildChooseCurrencyPage,
	chainBreadcrumbSegment,
} from '../choose-chain-currency'

export const DepositChooseCurrencyPage = {
	render(currencies: CurrencyDto[]): PageContent {
		return buildChooseCurrencyPage({
			lines: [
				depositBreadcrumb(chainBreadcrumbSegment(currencies)),
				'',
				'Select a token:',
			],
			currencies,
			currencyActionId: actionIds.openDepositAddress,
			currencyPayload: (currency) => currency.chainAddress,
			nav: {
				parent: actionIds.openDeposit,
				home: actionIds.openHome,
			},
		})
	},
}
