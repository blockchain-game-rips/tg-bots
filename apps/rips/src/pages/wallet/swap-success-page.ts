import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { swapBreadcrumb } from '../../utils/breadcrumb'
import { formatAmountWithUsd } from '../../utils/currency'

export class SwapSuccessPage {
	static render(args: {
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
			keyboard: new InlineKeyboard().text('Home', actionIds.openHome),
		}
	}
}
