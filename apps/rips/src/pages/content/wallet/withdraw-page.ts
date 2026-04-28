import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { formatUnits, toUsd } from '../../../utils/units'
import { addNav } from '../../utils'

export class WithdrawPage {
	static render(
		balance: CurrencyAmountDto,
		amount?: string,
		recipientAddress?: string,
	): PageContent {
		const formattedBalance = formatUnits(
			BigInt(balance.amount),
			balance.currency.decimals,
		)

		let message = `Balance: ${formattedBalance} ${balance.currency.symbol} ${toUsd(balance)}\n\n`

		message += recipientAddress
			? `Recipient: <code>${recipientAddress}</code>\n`
			: `Recipient: —\n`

		if (amount !== undefined) {
			const formattedAmount = formatUnits(
				BigInt(amount),
				balance.currency.decimals,
			)
			message += `Amount: ${formattedAmount} ${balance.currency.symbol} ${toUsd(balance)}\n`
		} else {
			message += `Amount: —\n`
		}

		const keyboard = new InlineKeyboard()

		if (amount !== undefined && recipientAddress !== undefined) {
			keyboard.text('Confirm', actionIds.executeWithdraw).row()
		}

		keyboard
			.text('Choose recipient', actionIds.requestWithdrawRecipient)
			.row()
			.text('Choose amount', actionIds.showChooseWithdrawAmount)

		return {
			message,
			keyboard: addNav(keyboard, {
				home: actionIds.showHome,
				parent: actionIds.showWallet,
			}),
		}
	}
}
