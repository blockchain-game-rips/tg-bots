import {
	AvailablePresetDto,
	CurrencyAmountDto,
	QuoteZapResponseDtoOutput,
} from '@rips/api-client'
import { addNav, buildActionData, joinLines, Line } from '@rips/grammy-kit'
import {
	configName,
	fundsBreakdown,
	insufficientFundsDepositLines,
	resolveConfig,
	toShortDurationFormat,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { buyEntriesBreadcrumb } from '../../utils/display/breadcrumb'

const TRANSACTION_SEND_OVERHEAD_SECONDS = 4

export const ZapCheckoutPage = {
	render(args: {
		availablePreset: AvailablePresetDto
		entryCount: number
		nativeBalance: CurrencyAmountDto
		currencyInBalance: CurrencyAmountDto
		zapQuote: QuoteZapResponseDtoOutput
		userEvmAddress: string
	}): PageContent {
		const {
			availablePreset,
			entryCount,
			nativeBalance,
			currencyInBalance,
			zapQuote,
			userEvmAddress,
		} = args

		const config = resolveConfig(availablePreset)
		const { currency } = zapQuote.amountIn
		const chain = currency.chainAddress.chain

		const { insufficientAmounts } = fundsBreakdown(
			[
				{ label: 'Entry cost', amount: zapQuote.amountIn },
				{ label: 'Zap fee', amount: zapQuote.fee },
				{ label: 'Blockchain fee', amount: zapQuote.blockchainFee },
			],
			[currencyInBalance, nativeBalance],
		)

		const insufficient = insufficientAmounts.length > 0

		const lines: Line[] = [
			buyEntriesBreadcrumb(
				configName(config),
				chainToName(chain),
				currency.symbol,
			),
			'',
			`Entry count: ${entryCount.toString()}`,
			`Estimated time: ${toShortDurationFormat(zapQuote.durationMs / 1000 + TRANSACTION_SEND_OVERHEAD_SECONDS)}`,
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
			parentPayload: chain,
			home: actionIds.openHome,
		})

		return { message: joinLines(lines), keyboard }
	},
}
