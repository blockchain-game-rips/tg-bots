import { InlineKeyboard } from 'grammy'
import { CurrencyDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { chainToName } from '../../utils/chain'
import { findCurrencyIndex } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'

export class WithdrawChooseCurrencyPage {
	static render(currencies: CurrencyDto[]): PageContent {
		const chain = currencies[0].chainAddress.chain

		const lines = [
			`<b>💸 Withdraw › ${chainToName(chain)}</b>`,
			'',
			'Select a token:',
		]

		const keyboard = new InlineKeyboard()

		currencies.forEach((currency) => {
			const currencyIndex = findCurrencyIndex(currency.id)

			keyboard
				.text(
					currency.symbol,
					buildActionData(
						actionIds.showWithdraw,
						currencyIndex.toString(),
					),
				)
				.row()
		})

		addNav(keyboard, {
			parent: actionIds.showWithdraw,
			home: actionIds.showHome,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
