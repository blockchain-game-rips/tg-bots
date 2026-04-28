import { InlineKeyboard } from 'grammy'
import {
	AvailableStakeDto,
	CurrencyAmountDto,
	QuoteZapResponseDtoOutput,
} from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { fundsBreakdown } from '../../ui-utils'
import {
	addNav,
	configName,
	messageFromLines,
	resolveConfig,
} from '../../utils'

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

		const lines = [
			`${configName(config)} stake`,
			`Ticket count: ${ticketCount}`,
			'',
			...fundsBreakdown(
				[
					{
						label: 'Ticket cost',
						amount: zapQuote.amountIn,
					},
					{
						label: 'Zap service fee',
						amount: zapQuote.fee,
					},
					{
						label: 'Blockchain fee',
						amount: zapQuote.blockchainFee,
					},
				],
				[nativeBalance, currencyInBalance],
			),
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
