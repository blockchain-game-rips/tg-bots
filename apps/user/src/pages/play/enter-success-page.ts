import { BuyEntriesPurchaseResponseDtoOutput, RipDto } from '@rips/api-client'
import { fmt, FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { configName, formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { enterBreadcrumb } from '../../utils/display/breadcrumb'

export const EnterSuccessPage = {
	render(
		purchase: BuyEntriesPurchaseResponseDtoOutput,
		rip?: RipDto,
	): PageContent {
		const lines: Line[] = [
			enterBreadcrumb(
				rip !== undefined ? configName(rip.config) : undefined,
			),
			'',
			'✅ Purchase successful!',
			'',
			`Rip: #${purchase.ripId.toString()}`,
			`Entries: ${purchase.entryCount.toString()}`,
		]

		if (rip !== undefined) {
			const entryCost =
				BigInt(purchase.entryCount) *
				BigInt(rip.config.entryPrice.amount)

			const currency = rip.config.entryPrice.currency

			lines.push(
				`Entries cost: ${formatAmountWithUsd({ amount: entryCost.toString(), currency })}`,
			)
		}

		const cost = purchase.transaction.cost
		if (cost !== undefined) {
			lines.push('')
			lines.push(`Blockchain fee: ${formatAmountWithUsd(cost)}`)
		}

		lines.push('')
		lines.push(
			fmt`Transaction: ${FormattedString.code(purchase.transaction.id)}`,
		)

		return {
			message: joinLines(lines),
			keyboard: new InlineKeyboard().appendHomeButton(),
		}
	},
}
