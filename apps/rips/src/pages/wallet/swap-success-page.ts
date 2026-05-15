import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { buildActionData } from '../../grammy-kit/action/action-data'
import { actionIds } from '../../grammy-kit/action/actions'
import { PageContent } from '../../types'
import { swapBreadcrumb } from '../../utils/breadcrumb'
import { formatAmountWithUsd } from '../../utils/currency'

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
