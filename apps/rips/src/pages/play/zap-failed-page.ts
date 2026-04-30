import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { formatAmountWithUsd } from '../../utils/currency'
import { messageFromLines } from '../../utils/message'

export class ZapFailedPage {
	static render(refund: CurrencyAmountDto): PageContent {
		const lines = [
			'❌ Zap failed',
			'',
			`Refund: ${formatAmountWithUsd(refund)}`,
		]

		return {
			message: messageFromLines(lines),
			keyboard: new InlineKeyboard().text('Home', actionIds.showHome),
		}
	}
}
