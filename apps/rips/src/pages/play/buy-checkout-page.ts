import { buildActionData } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import {
	AvailableStakeDto,
	CurrencyAmountDto,
	QuotePurchaseResponseDtoOutput,
} from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { fundsBreakdown } from '../../utils/display/balance'
import { buyTicketsBreadcrumb } from '../../utils/display/breadcrumb'
import { configName, resolveConfig } from '../../utils/stake'

export const BuyCheckoutPage = {
	render(args: {
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
			buyTicketsBreadcrumb(configName(config)),
			'',
			`Ticket count: ${ticketCount.toString()}`,
			'',
			...breakdownLines,
		]

		const insufficient = insufficientAmounts.length > 0

		const keyboard = new InlineKeyboard()

		if (insufficient) {
			keyboard
				.text(
					'Update',
					buildActionData(actionIds.openBuyCheckout, ticketCount),
				)
				.row()
				.text(
					'Enter from another token',
					buildActionData(actionIds.openZapChooseChain, undefined),
				)
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
			keyboard
				.text(
					'Confirm',
					buildActionData(actionIds.executeBuyTickets, undefined),
				)
				.row()
		}

		keyboard
			.text(
				'Back',
				buildActionData(
					actionIds.openChooseTicketAmount,
					availableStake.stake.id,
				),
			)
			.text('Home', buildActionData(actionIds.openHome, undefined))

		return { message: lines.join('\n'), keyboard }
	},
}
