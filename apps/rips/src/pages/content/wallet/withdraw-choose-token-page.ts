import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../../actions'
import { SUPPORTED_CHAINS, SUPPORTED_CURRENCIES } from '../../../constants'
import { PageContent } from '../../../types'
import { buildActionData } from '../../../utils/action-data'
import { addNav } from '../../../utils/keyboard'
import { messageFromLines } from '../../../utils/message'

export class WithdrawChooseTokenPage {
	static render(args: { chainIndex: number }): PageContent {
		const { chainIndex } = args
		const chain = SUPPORTED_CHAINS[chainIndex]

		const chainCurrencies = SUPPORTED_CURRENCIES.filter(
			(c) =>
				c.chainAddress.chain.namespace === chain.namespace &&
				c.chainAddress.chain.reference === chain.reference,
		)

		const lines = [
			`Chain: ${chain.name}`,
			'',
			'Choose a token to withdraw:',
		]

		const keyboard = new InlineKeyboard()

		chainCurrencies.forEach((currency) => {
			const currencyIndex = SUPPORTED_CURRENCIES.indexOf(currency)

			keyboard
				.text(
					currency.symbol,
					buildActionData(
						actionIds.showWithdrawChooseAmount,
						currencyIndex.toString(),
					),
				)
				.row()
		})

		addNav(keyboard, {
			parent: actionIds.showWithdrawChooseChain,
			home: actionIds.showHome,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
