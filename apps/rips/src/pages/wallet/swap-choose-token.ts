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

export class SwapChooseTokenPage {
	static render(currencies: CurrencyDto[]): PageContent {
		const chain = currencies[0].chainAddress.chain

		const lines = [`Chain: ${chainToName(chain)}`, '', 'Choose a token:']

		const keyboard = new InlineKeyboard()

		currencies.forEach((currency) => {
			const currencyIndex = SUPPORTED_CURRENCIES.findIndex(
				(c) => toCurrencyId(c) === currency.id,
			)

			keyboard
				.text(
					currency.symbol,
					buildActionData(
						actionIds.showSwapChooseChain,
						currencyIndex.toString(),
					),
				)
				.row()
		})

		addNav(keyboard, {
			parent: actionIds.showSwapChooseChain,
			home: actionIds.showHome,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
