import { InlineKeyboard } from 'grammy'
import {
	AvailableStakeDto,
	CurrencyAmountDto,
	QuoteZapResponseDtoOutput,
} from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { fundsBreakdown } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'
import { configName, resolveConfig } from '../../utils/stake'

export class ZapConfirmPage {
	static render(args: {
		availableStake: AvailableStakeDto
		ticketCount: number
		nativeBalance: CurrencyAmountDto
		currencyInBalance: CurrencyAmountDto
		zapQuote: QuoteZapResponseDtoOutput
		userEvmAddress: string
	}): PageContent {
		const {
			availableStake,
			ticketCount,
			nativeBalance,
			currencyInBalance,
			zapQuote,
			userEvmAddress,
		} = args

		const config = resolveConfig(availableStake)
		const { currency } = zapQuote.amountIn
		const chain = currency.chainAddress.chain

		const { lines: breakdownLines, insufficientAmounts } = fundsBreakdown(
			[
				{ label: 'Ticket cost', amount: zapQuote.amountIn },
				{ label: 'Zap fee', amount: zapQuote.fee },
				{ label: 'Blockchain fee', amount: zapQuote.blockchainFee },
			],
			[currencyInBalance, nativeBalance],
		)

		const insufficient = insufficientAmounts.length > 0

		const lines = [
			`<b>🎮 Buy Tickets › ${configName(config)} › ${chainToName(chain)} › ${currency.symbol}</b>`,
			'',
			`Ticket count: ${ticketCount}`,
			'',
			...breakdownLines,
		]

		if (insufficient) {
			lines.push('')
			lines.push(`⚠️ <b>Insufficient funds</b>`)
			lines.push('')
			lines.push('Deposit to:')
			lines.push(`<code>${userEvmAddress}</code>`)
			lines.push('')
			lines.push('Then press Update')
		} else {
			lines.push('')
			lines.push('Confirm to proceed with zap')
		}

		const keyboard = new InlineKeyboard()

		if (insufficient) {
			keyboard.text('Update', actionIds.showZapConfirm).row()
		} else {
			keyboard.text('Confirm', actionIds.executeZap).row()
		}

		addNav(keyboard, {
			parent: actionIds.showZapChooseToken,
			home: actionIds.showHome,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
