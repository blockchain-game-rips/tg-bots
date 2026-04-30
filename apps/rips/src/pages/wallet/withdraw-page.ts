import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { formatAmountWithUsd } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'
import { messageFromLines } from '../../utils/message'

export class WithdrawPage {
	static render(
		currencyBalance: CurrencyAmountDto,
		amountToWithdraw?: CurrencyAmountDto,
		recipientAddress?: string,
	): PageContent {
		const { currency } = currencyBalance
		const chain = currency.chainAddress.chain

		const lines = [
			`Chain: ${chainToName(chain)}`,
			`Token: ${currency.symbol}`,
			`Balance: ${formatAmountWithUsd(currencyBalance)}`,
		]

		if (amountToWithdraw !== undefined) {
			lines.push(`Amount: ${formatAmountWithUsd(amountToWithdraw)}`)
		}

		if (recipientAddress !== undefined) {
			lines.push(`Recipient: ${recipientAddress}`)
		}

		const keyboard = new InlineKeyboard()
			.text('Choose amount', actionIds.showWithdrawChooseAmount)
			.row()
			.text('Enter recipient', actionIds.askWithdrawRecipient)
			.row()

		addNav(keyboard, {
			parent: actionIds.showWithdrawChooseToken,
			home: actionIds.showHome,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
