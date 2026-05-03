import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { swapBreadcrumb } from '../../utils/breadcrumb'
import { formatAmountWithUsd } from '../../utils/currency'

export class SwapFailedPage {
	static render(args: {
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
			keyboard: new InlineKeyboard().text('Home', actionIds.openHome),
		}
	}
}
