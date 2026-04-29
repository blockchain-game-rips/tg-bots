import { InlineKeyboard } from 'grammy'
import {
	AvailableStakeDto,
	CurrencyAmountDto,
	QuoteZapResponseDtoOutput,
} from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { fundsBreakdown } from '../../../utils/currency'
import { addNav } from '../../../utils/keyboard'
import { messageFromLines } from '../../../utils/message'
import { configName, resolveConfig } from '../../../utils/stake'

export class ZapInsufficientFundsPage {
	static render(args: {
		currencyInBalance: CurrencyAmountDto
		nativeBalance: CurrencyAmountDto

		zapQuote: QuoteZapResponseDtoOutput

		availableStake: AvailableStakeDto
		ticketCount: number

		userEvmAddress: string
	}): PageContent {
		const {
			availableStake,
			ticketCount,
			currencyInBalance,
			zapQuote,
			userEvmAddress,
			nativeBalance,
		} = args

		const config = resolveConfig(availableStake)

		const { lines: breakdownLines } = fundsBreakdown(
			[
				{
					label: 'Ticket',
					amount: zapQuote.amountIn,
				},
				{
					label: 'Zap fee',
					amount: zapQuote.fee,
				},
				{
					label: 'Net fee',
					amount: zapQuote.blockchainFee,
				},
			],
			[nativeBalance, currencyInBalance],
		)

		const lines = [
			`${configName(config)} stake`,
			`Ticket count: ${ticketCount}`,
			'',
			...breakdownLines,
			'',
			`Address: ${userEvmAddress}`,
		]

		const keyboard = new InlineKeyboard().text(
			'Update balance and continue',
			actionIds.showZapConfirm,
		)

		addNav(keyboard, {
			parent: actionIds.showZapChooseToken,
			home: actionIds.showHome,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
