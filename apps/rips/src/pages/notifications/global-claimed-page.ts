import { InlineKeyboard } from 'grammy'
import { RoundDto } from '../../../generated/api-client'
import { PageContent } from '../../types'

export class GlobalClaimedRoundPage {
	static render(round: RoundDto): PageContent {
		const lines = ['round is claimed']

		return {
			message: lines.join('\n'),
			keyboard: new InlineKeyboard(),
		}
	}
}
