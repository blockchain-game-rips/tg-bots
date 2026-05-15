import { CurrencyDto } from '../../../generated/api-client'
import { SwapSelecting } from '../../flows'
import { actionIds } from '../../grammy-kit/action/actions'
import { PageContent } from '../../types'
import { swapBreadcrumb } from '../../utils/breadcrumb'
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
