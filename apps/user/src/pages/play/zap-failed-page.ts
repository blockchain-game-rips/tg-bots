import {
	AvailablePresetDtoOutput,
	CurrencyAmountDtoOutput,
} from '@rips/api-client'
import { joinLines } from '@rips/grammy-kit'
import { configName, formatAmountWithUsd, resolveConfig } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { chainToName, currencyToChain } from '../../utils/chain'
import { enterBreadcrumb } from '../../utils/display/breadcrumb'

export const ZapFailedPage = {
	render(args: {
		availablePreset: AvailablePresetDtoOutput
		entryCount: number
		amountIn: CurrencyAmountDtoOutput
		refund: CurrencyAmountDtoOutput
	}): PageContent {
		const { availablePreset, entryCount, amountIn, refund } = args

		const config = resolveConfig(availablePreset)
		const { currency } = amountIn
		const chain = currencyToChain(currency)

		const lines = [
			enterBreadcrumb(
				configName(config),
				chainToName(chain),
				currency.symbol,
			),
			'',
			'❌ Zap failed',
			'',
			`Entry count: ${entryCount.toString()}`,
			`Paid: ${formatAmountWithUsd(amountIn)}`,
			`Refund: ${formatAmountWithUsd(refund)}`,
		]

		return {
			message: joinLines(lines),
			keyboard: new InlineKeyboard().appendHomeButton(),
		}
	},
}
