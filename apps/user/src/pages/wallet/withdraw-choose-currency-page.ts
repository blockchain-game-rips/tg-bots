import { CurrencyDto } from '@rips/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { withdrawBreadcrumb } from '../../utils/display/breadcrumb'
import {
	buildChooseCurrencyPage,
	chainBreadcrumbSegment,
} from '../choose-chain-currency'

export const WithdrawChooseCurrencyPage = {
	render(currencies: CurrencyDto[]): PageContent {
		return buildChooseCurrencyPage({
			lines: [
				withdrawBreadcrumb(chainBreadcrumbSegment(currencies)),
				'',
				'Choose token to withdraw',
			],
			currencies,
			currencyActionId: actionIds.openWithdraw,
			currencyPayload: (currency) => currency.chainAddress,
			nav: {
				parent: actionIds.openWithdrawChooseChain,
				home: actionIds.openHome,
			},
		})
	},
}
