import { CurrencyAmountDto } from '@rips/api-client'
import { buildActionData } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { swapBreadcrumb } from '../../utils/display/breadcrumb'
import { formatAmountWithUsd } from '../../utils/format/currency'

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
