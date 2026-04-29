import { InlineKeyboard } from 'grammy'
import {
	AvailableStakeDto,
	CurrencyAmountDto,
	QuotePurchaseResponseDtoOutput,
} from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { fundsBreakdown } from '../../ui-utils'
import {
	buildActionData,
	configName,
	messageFromLines,
	resolveConfig,
} from '../../utils'

export class BuyCheckoutPage {
	static render(args: {
		availableStake: AvailableStakeDto
		ticketCount: number
		currencyInAmount: CurrencyAmountDto
		purchaseQuote: QuotePurchaseResponseDtoOutput
		nativeBalance: CurrencyAmountDto
		currencyInBalance: CurrencyAmountDto
	}): PageContent {
		const {
			availableStake,
			ticketCount,
			currencyInAmount,
			purchaseQuote,
			nativeBalance,
			currencyInBalance,
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
			`${configName(config)} stake`,
			`Ticket count: ${ticketCount}`,
			'',
			...breakdownLines,
		]

		const insufficient = insufficientAmounts.length > 0

		const keyboard = new InlineKeyboard()

		if (insufficient) {
			keyboard
				.text('Enter from another token', actionIds.showZapChooseChain)
				.row()
		} else {
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
