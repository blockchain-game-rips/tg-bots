import {
	AvailablePresetDto,
	CurrencyAmountDto,
	QuotePurchaseResponseDtoOutput,
} from '@rips/api-client'
import { buildActionData } from '@rips/grammy-kit'
import { configName, fundsBreakdown, resolveConfig } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { buyEntriesBreadcrumb } from '../../utils/display/breadcrumb'

export const BuyCheckoutPage = {
	render(args: {
		availablePreset: AvailablePresetDto
		entryCount: number
		currencyInAmount: CurrencyAmountDto
		purchaseQuote: QuotePurchaseResponseDtoOutput
		nativeBalance: CurrencyAmountDto
		currencyInBalance: CurrencyAmountDto
		userEvmAddress: string
	}): PageContent {
		const {
			availablePreset,
			entryCount,
			currencyInAmount,
			purchaseQuote,
			nativeBalance,
			currencyInBalance,
			userEvmAddress,
		} = args

		const config = resolveConfig(availablePreset)

		const { lines: breakdownLines, insufficientAmounts } = fundsBreakdown(
			[
				{ label: 'Entry cost', amount: currencyInAmount },
				{
					label: 'Blockchain fee',
					amount: purchaseQuote.blockchainFee,
				},
			],
			[nativeBalance, currencyInBalance],
			chainToName,
		)

		const lines = [
			buyEntriesBreadcrumb(configName(config)),
			'',
			`Entry count: ${entryCount.toString()}`,
			'',
			...breakdownLines,
		]

		const insufficient = insufficientAmounts.length > 0

		const keyboard = new InlineKeyboard()

		if (insufficient) {
			keyboard
				.text(
					'Update',
					buildActionData(actionIds.openBuyCheckout, entryCount),
				)
				.row()
				.text(
					'Enter from another token',
					buildActionData(actionIds.openZapChooseChain, undefined),
				)
				.row()

			lines.push('')
			lines.push('Option 1: Deposit ETH on Base to')
			lines.push(`<code>${userEvmAddress}</code>`)
			lines.push('then press <b>Update</b>')
			lines.push('')
			lines.push('Option 2: <b>Enter from another token</b>')
		} else {
			lines.push('')
			lines.push('Confirm to proceed')
			keyboard
				.text(
					'Confirm',
					buildActionData(actionIds.executeBuyEntries, undefined),
				)
				.row()
		}

		keyboard
			.text(
				'Back',
				buildActionData(
					actionIds.openChooseEntryAmount,
					availablePreset.preset.id,
				),
			)
			.appendHomeButton()

		return { message: lines.join('\n'), keyboard }
	},
}
