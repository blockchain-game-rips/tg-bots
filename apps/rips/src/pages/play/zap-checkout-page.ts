import { InlineKeyboard } from 'grammy'
import {
	AvailableStakeDto,
	CurrencyAmountDto,
	QuoteZapResponseDtoOutput,
} from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { Chain, PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { buyTicketsBreadcrumb } from '../../utils/breadcrumb'
import { chainToName } from '../../utils/chain'
import {
	fundsBreakdown,
	insufficientFundsDepositLines,
} from '../../utils/currency'
import { addNav } from '../../utils/keyboard'
import { configName, resolveConfig } from '../../utils/stake'

export class ZapCheckoutPage {
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
			buyTicketsBreadcrumb(
				configName(config),
				chainToName(chain),
				currency.symbol,
			),
			'',
			`Ticket count: ${ticketCount}`,
			'',
			...breakdownLines,
		]

		if (insufficient) {
			lines.push('', ...insufficientFundsDepositLines(userEvmAddress))
		} else {
			lines.push('')
			lines.push('Confirm to proceed with zap')
		}

		const keyboard = new InlineKeyboard()

		if (insufficient) {
			keyboard
				.text(
					'Update',
					buildActionData(actionIds.refreshZapConfirm, undefined),
				)
				.row()
		} else {
			keyboard
				.text(
					'Confirm',
					buildActionData(actionIds.executeZap, undefined),
				)
				.row()
		}

		addNav(keyboard, {
			parent: actionIds.openZapChooseToken,
			parentPayload: chain as Chain,
			home: actionIds.openHome,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
