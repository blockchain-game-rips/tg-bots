import { BuyEntriesPurchaseResponseDtoOutput, RipDto } from '@rips/api-client'
import { configName, formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { buyEntriesBreadcrumb } from '../../utils/display/breadcrumb'

export const BuySuccessPage = {
	render(
		purchase: BuyEntriesPurchaseResponseDtoOutput,
		rip?: RipDto,
	): PageContent {
		const lines = [
			buyEntriesBreadcrumb(
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
		lines.push(`Transaction: <code>${purchase.transaction.id}</code>`)

		return {
			message: lines.join('\n'),
			keyboard: new InlineKeyboard().appendHomeButton(),
		}
	},
}
