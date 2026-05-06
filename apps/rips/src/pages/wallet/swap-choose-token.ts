import { CurrencyDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { SwapSelecting } from '../../flows'
import { PageContent } from '../../types'
import { swapBreadcrumb } from '../../utils/breadcrumb'
import {
	buildChooseTokenPage,
	chainBreadcrumbSegment,
} from '../choose-chain-token'

export class SwapChooseTokenPage {
	static render(
		currencies: CurrencyDto[],
		selecting: SwapSelecting,
	): PageContent {
		const label = selecting === 'in' ? 'token in' : 'token out'

		return buildChooseTokenPage({
			lines: [
				swapBreadcrumb(chainBreadcrumbSegment(currencies)),
				'',
				`Choose ${label}:`,
			],
			currencies,
			tokenActionId: actionIds.submitSwapCurrency,
			tokenPayload: (currencyIndex) => ({
				selecting,
				value: SUPPORTED_CURRENCIES[currencyIndex],
			}),
			nav: {
				parent: actionIds.openSwapChooseChain,
				parentPayload: selecting,
				home: actionIds.openHome,
			},
		})
	}
}
