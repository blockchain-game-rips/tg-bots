import { InlineKeyboard } from 'grammy'
import {
	CurrencyAmountDto,
	QuoteWithdrawResponseDtoOutput,
} from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { addNav } from '../../utils/keyboard'
import { messageFromLines } from '../../utils/message'

export class WithdrawCheckoutPage {
	static render(args: {
		currencyBalance: CurrencyAmountDto
		nativeBalance: CurrencyAmountDto
		currencyAmount: CurrencyAmountDto
		withdrawQuote: QuoteWithdrawResponseDtoOutput
		recipientAddress: string
	}): PageContent {
		// do something like fundsBreakdown if there is amount to withdraw, we need logic if there is not enough currency amount or it's not enough native currency
		// we need button choose amount (even if there is amount)
		// we need button choose recipient (even if there is a recipient)
		// we need confirm if there are amount, recipient and fundsBreakdown (or similar function) doesn't return insufficient
		const lines = []
		lines.push('withdraw checkout page')

		const keyboard = new InlineKeyboard()
			.text('Choose amount', actionIds.showWithdrawChooseAmount)
			.row()
			.text('Enter recipient', actionIds.askWithdrawRecipient)
			.row()

		addNav(keyboard, {
			home: actionIds.showHome,
			parent: actionIds.showWallet,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
