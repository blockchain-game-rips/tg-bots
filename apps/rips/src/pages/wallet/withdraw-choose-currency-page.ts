import { InlineKeyboard } from 'grammy'
import { CurrencyDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { chainToName } from '../../utils/chain'
import { toCurrencyId } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'
import { messageFromLines } from '../../utils/message'

export class WithdrawChooseCurrencyPage {
	static render(currencies: CurrencyDto[]): PageContent {
		const chain = currencies[0].chainAddress.chain

		const lines = [
			`Chain: ${chainToName(chain)}`,
			'',
			'Choose a token to withdraw:',
		]

		const keyboard = new InlineKeyboard()

		currencies.forEach((currency) => {
			const currencyIndex = SUPPORTED_CURRENCIES.findIndex(
				(chainAddress) => toCurrencyId(chainAddress) === currency.id,
			)

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

		return { message: messageFromLines(lines), keyboard }
	}
}
