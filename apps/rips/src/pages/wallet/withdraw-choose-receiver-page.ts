import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { SUPPORTED_CHAINS, SUPPORTED_CURRENCIES } from '../../constants'
import { PageContent } from '../../types'
import { addNav } from '../../utils/keyboard'
import { messageFromLines } from '../../utils/message'

export class WithdrawChooseReceiverPage {
	static render(args: {
		chainIndex: number
		currencyIndex: number
		amount: string
	}): PageContent {
		const { chainIndex, currencyIndex, amount } = args
		const chain = SUPPORTED_CHAINS[chainIndex]
		const currency = SUPPORTED_CURRENCIES[currencyIndex]

		const lines = [
			`Chain: ${chain.name}`,
			`Token: ${currency.symbol}`,
			`Amount: ${amount}`,
			'',
			'Enter recipient address:',
		]

		const keyboard = new InlineKeyboard().text(
			'Enter address',
			actionIds.askWithdrawRecipient,
		)

		addNav(keyboard, {
			parent: actionIds.showWithdrawChooseAmount,
			home: actionIds.showHome,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
