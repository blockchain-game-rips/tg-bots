import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { buildActionData } from '../../grammy-kit/action/action-data'
import { actionIds } from '../../grammy-kit/action/actions'
import { PageContent } from '../../types'
import { swapBreadcrumb } from '../../utils/breadcrumb'
import { formatAmountWithUsd } from '../../utils/currency'

export const SwapFailedPage = {
	render(args: {
		amountIn: CurrencyAmountDto
		refund: CurrencyAmountDto
	}): PageContent {
		const { amountIn, refund } = args

		const lines = [
			swapBreadcrumb(),
			'',
			'❌ Swap failed',
			'',
			`Attempted: ${formatAmountWithUsd(amountIn)}`,
			`Refunded: ${formatAmountWithUsd(refund)}`,
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
