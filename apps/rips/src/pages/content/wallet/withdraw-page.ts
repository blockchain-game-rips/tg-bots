import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../../generated/api-client'
import { buildCommand } from '../../../button-handler/utils'
import { promptIds } from '../../../prompts/prompt-ids'
import { PageContent } from '../../../types'
import { formatUnits, toUsd } from '../../../utils/units'
import { pageIds } from '../../page-ids'
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
			keyboard
				.text(
					'Confirm',
					buildCommand({
						type: 'open',
						pageId: pageIds.successWithdraw,
						payloads: [],
					}),
				)
				.row()
		}

		keyboard
			.text(
				'Choose recipient',
				buildCommand({
					type: 'reply',
					promptId: promptIds.withdrawRecipient,
				}),
			)
			.row()
			.text(
				'Choose amount',
				buildCommand({
					type: 'open',
					pageId: pageIds.chooseWithdrawAmount,
					payloads: [],
				}),
			)

		return {
			message,
			keyboard: addNav(keyboard, {
				home: pageIds.home,
				parent: pageIds.wallet,
			}),
		}
	}
}
