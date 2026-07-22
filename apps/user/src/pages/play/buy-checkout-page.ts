import {
	AvailablePresetDto,
	CurrencyAmountDto,
	QuotePurchaseResponseDtoOutput,
} from '@rips/api-client'
import {
	buildActionData,
	fmt,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import { configName, fundsBreakdown, resolveConfig } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
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

		const { insufficientAmounts } = fundsBreakdown(
			[
				{ label: 'Entry cost', amount: currencyInAmount },
				{
					label: 'Blockchain fee',
					amount: purchaseQuote.blockchainFee,
				},
			],
			[nativeBalance, currencyInBalance],
		)

		const lines: Line[] = [
			buyEntriesBreadcrumb(configName(config)),
			'',
			`Entry count: ${entryCount.toString()}`,
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
			lines.push(FormattedString.code(userEvmAddress))
			lines.push(fmt`then press ${FormattedString.b('Update')}`)
			lines.push('')
			lines.push(
				fmt`Option 2: ${FormattedString.b('Enter from another token')}`,
			)
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

		return { message: joinLines(lines), keyboard }
	},
}
