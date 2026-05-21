import { CurrencyAmountDto } from '@rips/api-client'
import { buildActionData } from '@rips/grammy-kit'
import { formatAmountWithUsd, swapBreadcrumb } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

export const SwapSuccessPage = {
	render(args: {
		amountIn: CurrencyAmountDto
		amountOut: CurrencyAmountDto
		transactionId: string
	}): PageContent {
		const { amountIn, amountOut, transactionId } = args

		const lines = [
			swapBreadcrumb(),
			'',
			'✅ Swap successful!',
			'',
			`Paid: ${formatAmountWithUsd(amountIn)}`,
			`Received: ${formatAmountWithUsd(amountOut)}`,
			'',
			`Transaction: <code>${transactionId}</code>`,
		]

		return {
			message: lines.join('\n'),
			keyboard: new InlineKeyboard().text(
				'Home',
				buildActionData(actionIds.openHome, undefined),
			),
		}
	},
}
