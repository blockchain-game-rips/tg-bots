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
			tokenActionId: actionIds.openWithdraw,
			tokenPayload: (currencyIndex) => currencyIndex,
			nav: {
				parent: actionIds.openWithdrawChooseChain,
				home: actionIds.openHome,
			},
		})
	}
}
