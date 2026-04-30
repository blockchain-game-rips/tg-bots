import { InlineKeyboard } from 'grammy'
import {
	AvailableStakeDto,
	CurrencyAmountDto,
	QuoteZapResponseDtoOutput,
} from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { formatAmountWithUsd } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'
import { messageFromLines } from '../../utils/message'
import { configName, resolveConfig } from '../../utils/stake'

export class ZapConfirmPage {
	static render(args: {
		availableStake: AvailableStakeDto
		ticketCount: number
		nativeBalance: CurrencyAmountDto
		currencyInBalance: CurrencyAmountDto
		zapQuote: QuoteZapResponseDtoOutput
	}): PageContent {
		const {
			availableStake,
			ticketCount,
			nativeBalance,
			currencyInBalance,
			zapQuote,
		} = args

		const config = resolveConfig(availableStake)

		const lines = [
			`${configName(config)} stake`,
			`Ticket count: ${ticketCount}`,
			'',
			`Pay: ${formatAmountWithUsd(zapQuote.amountIn)}`,
			`Your balance: ${formatAmountWithUsd(currencyInBalance)}`,
			'',
			`Network fee: ${formatAmountWithUsd(zapQuote.fee)}`,
			`Native balance: ${formatAmountWithUsd(nativeBalance)}`,
			'',
			'Confirm to proceed with zap',
		]

		const keyboard = new InlineKeyboard().text(
			'Confirm',
			actionIds.executeZap,
		)

		addNav(keyboard, {
			parent: actionIds.showZapChooseToken,
			home: actionIds.showHome,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
