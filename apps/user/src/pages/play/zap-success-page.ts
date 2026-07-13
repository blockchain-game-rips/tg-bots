import {
	AvailablePresetDto,
	CurrencyAmountDto,
	GetZapResultResponseDtoOutput,
} from '@rips/api-client'
import {
	buyEntriesBreadcrumb,
	configName,
	formatAmountWithUsd,
	resolveConfig,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'

export const ZapSuccessPage = {
	render(args: {
		availablePreset: AvailablePresetDto
		entryCount: number
		amountIn: CurrencyAmountDto
		zapSuccessResult: NonNullable<GetZapResultResponseDtoOutput['success']>
	}): PageContent {
		const { availablePreset, entryCount, amountIn, zapSuccessResult } = args

		const config = resolveConfig(availablePreset)
		const { currency } = amountIn
		const chain = currency.chainAddress.chain

		const lines = [
			buyEntriesBreadcrumb(
				configName(config),
				chainToName(chain),
				currency.symbol,
			),
			'',
			'✅ Zap successful!',
			'',
			`Rip: #${zapSuccessResult.ripId.toString()}`,
			`Entry count: ${entryCount.toString()}`,
			`Paid: ${formatAmountWithUsd(amountIn)}`,
		]

		if (zapSuccessResult.dstTransaction.cost !== undefined) {
			lines.push(
				`Blockchain fee: ${formatAmountWithUsd(zapSuccessResult.dstTransaction.cost)}`,
			)
		}

		return {
			message: lines.join('\n'),
			keyboard: new InlineKeyboard().appendHomeButton(),
		}
	},
}
