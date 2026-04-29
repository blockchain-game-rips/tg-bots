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

export class BuyInsufficientFundsPage {
	static render(args: {
		currencyInBalance: CurrencyAmountDto
		nativeBalance: CurrencyAmountDto

		purchaseQuote: QuotePurchaseResponseDtoOutput
		currencyInAmount: CurrencyAmountDto

		availableStake: AvailableStakeDto
		ticketCount: number
	}): PageContent {
		const {
			availableStake,
			currencyInAmount,
			currencyInBalance,
			purchaseQuote,
			nativeBalance,
			ticketCount,
		} = args

		const config = resolveConfig(availableStake)

		const { lines: breakdownLines } = fundsBreakdown(
			[
				{
					label: 'Ticket cost',
					amount: currencyInAmount,
				},
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

		return {
			message: messageFromLines(lines),
			keyboard: new InlineKeyboard()
				.text('Enter from another token', actionIds.showZapChooseChain)
				.row()
				.text(
					'Back',
					buildActionData(
						actionIds.showChooseTicketAmount,
						availableStake.stake.id.toString(),
					),
				)
				.text('Home', actionIds.showHome),
		}
	}
}
