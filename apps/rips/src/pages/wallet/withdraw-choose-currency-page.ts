import { CurrencyDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { withdrawBreadcrumb } from '../../utils/breadcrumb'
import {
	buildChooseTokenPage,
	chainBreadcrumbSegment,
} from '../choose-chain-token'

export class WithdrawChooseCurrencyPage {
	static render(currencies: CurrencyDto[]): PageContent {
		return buildChooseTokenPage({
			lines: [
				withdrawBreadcrumb(chainBreadcrumbSegment(currencies)),
				'',
				'Select a token:',
			],
			currencies,
			tokenActionId: actionIds.showWithdraw,
			tokenPayload: (currencyIndex) => currencyIndex.toString(),
			nav: {
				parent: actionIds.showWithdrawChooseChain,
				home: actionIds.showHome,
			},
		})
	}
}
