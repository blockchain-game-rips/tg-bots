import { InlineKeyboard } from 'grammy'
import {
	AvailableStakeDto,
	CurrencyAmountDto,
	QuotePurchaseResponseDtoOutput,
} from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { fundsBreakdown } from '../../utils/currency'
import { messageFromLines } from '../../utils/message'
import { configName, resolveConfig } from '../../utils/stake'

export class BuyCheckoutPage {
	static render(args: {
		availableStake: AvailableStakeDto
		ticketCount: number
		currencyInAmount: CurrencyAmountDto
		purchaseQuote: QuotePurchaseResponseDtoOutput
		nativeBalance: CurrencyAmountDto
		currencyInBalance: CurrencyAmountDto
		userEvmAddress: string
	}): PageContent {
		const {
			availableStake,
			ticketCount,
			currencyInAmount,
			purchaseQuote,
			nativeBalance,
			currencyInBalance,
			userEvmAddress,
		} = args

		const config = resolveConfig(availableStake)

		const { lines: breakdownLines, insufficientAmounts } = fundsBreakdown(
			[
				{ label: 'Ticket cost', amount: currencyInAmount },
				{
					label: 'Blockchain fee',
					amount: purchaseQuote.blockchainFee,
				},
			],
			[nativeBalance, currencyInBalance],
		)

		const lines = [
			`<b>🎮 Buy Tickets › ${configName(config)}</b>`,
			'',
			`Ticket count: ${ticketCount}`,
			'',
			...breakdownLines,
		]

		const insufficient = insufficientAmounts.length > 0

		const keyboard = new InlineKeyboard()

		if (insufficient) {
			keyboard
				.text(
					'Update',
					buildActionData(
						actionIds.showBuyCheckout,
						ticketCount.toString(),
					),
				)
				.row()
				.text('Enter from another token', actionIds.showZapChooseChain)
				.row()

			lines.push('')
			lines.push('Option 1: Deposit ETH on Base to')
			lines.push(`<code>${userEvmAddress}</code>`)
			lines.push('then press <b>Update</b>')
			lines.push('')
			lines.push('Option 2: <b>Enter from another token</b>')
		} else {
			lines.push('')
			lines.push('Confirm to proceed')
			keyboard.text('Confirm', actionIds.buyTickets).row()
		}

		keyboard
			.text(
				'Back',
				buildActionData(
					actionIds.showChooseTicketAmount,
					availableStake.stake.id.toString(),
				),
			)
			.text('Home', actionIds.showHome)

		return { message: messageFromLines(lines), keyboard }
	}
}
