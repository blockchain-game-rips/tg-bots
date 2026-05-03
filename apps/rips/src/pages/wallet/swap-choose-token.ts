import { InlineKeyboard } from 'grammy'
import { CurrencyDto } from '../../../generated/api-client'
import { SwapSelecting } from '../../flows'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { swapBreadcrumb } from '../../utils/breadcrumb'
import { chainToName, findChainIndex } from '../../utils/chain'
import { findCurrencyIndex } from '../../utils/currency'

export class SwapChooseTokenPage {
	static render(currencies: CurrencyDto[], selecting: SwapSelecting): PageContent {
		const chain = currencies[0].chainAddress.chain
		const chainIndex = findChainIndex(chain)
		const label = selecting === 'in' ? 'token in' : 'token out'

		const lines = [
			swapBreadcrumb(chainToName(chain)),
			'',
			`Choose ${label}:`,
		]

		const keyboard = new InlineKeyboard()

		currencies.forEach((currency) => {
			const currencyIndex = findCurrencyIndex(currency.id)

			keyboard
				.text(
					currency.symbol,
					buildActionData(actionIds.showSwap, currencyIndex.toString()),
				)
				.row()
		})

		keyboard
			.row()
			.text(
				'Back',
				buildActionData(actionIds.showSwapChooseChain, selecting),
			)
			.text('Home', buildActionData(actionIds.showHome))

		return { message: lines.join('\n'), keyboard }
	}
}
