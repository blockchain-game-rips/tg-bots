import { CurrencyDto } from '@rips/api-client'
import { actionIds } from '../../actions'
import { SwapSelecting } from '../../flows'
import { PageContent } from '../../types'
import { swapBreadcrumb } from '../../utils/display/breadcrumb'
import {
	buildChooseTokenPage,
	chainBreadcrumbSegment,
} from '../choose-chain-token'

export const SwapChooseTokenPage = {
	render(currencies: CurrencyDto[], selecting: SwapSelecting): PageContent {
		const label = selecting === 'in' ? 'token in' : 'token out'
		const tokenActionId =
			selecting === 'in'
				? actionIds.submitSwapCurrencyIn
				: actionIds.submitSwapCurrencyOut
		const parentActionId =
			selecting === 'in'
				? actionIds.openSwapChooseChainIn
				: actionIds.openSwapChooseChainOut

		return buildChooseTokenPage({
			lines: [
				swapBreadcrumb(chainBreadcrumbSegment(currencies)),
				'',
				`Choose ${label}:`,
			],
			currencies,
			tokenActionId,
			tokenPayload: (currency) => currency.chainAddress,
			nav: {
				parent: parentActionId,
				home: actionIds.openHome,
			},
		})
	},
}
