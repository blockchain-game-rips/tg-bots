import { AvailablePresetDto, CurrencyAmountDto } from '@rips/api-client'
import { joinLines } from '@rips/grammy-kit'
import { configName, formatAmountWithUsd, resolveConfig } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { enterBreadcrumb } from '../../utils/display/breadcrumb'

export const ZapFailedPage = {
	render(args: {
		availablePreset: AvailablePresetDto
		entryCount: number
		amountIn: CurrencyAmountDto
		refund: CurrencyAmountDto
	}): PageContent {
		const { availablePreset, entryCount, amountIn, refund } = args

		const config = resolveConfig(availablePreset)
		const { currency } = amountIn
		const chain = currency.chainAddress.chain

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
