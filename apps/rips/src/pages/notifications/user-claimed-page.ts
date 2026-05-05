import { InlineKeyboard } from 'grammy'
import { RoundDto } from '../../../generated/api-client'
import { PageContent } from '../../types'

export class UserClaimedRoundPage {
	static render(round: RoundDto): PageContent {
		const lines = ['round is claimed, go and check']

		return {
			message: lines.join('\n'),
			//TODO: button to open rips without back button
			keyboard: new InlineKeyboard(),
		}
	}
}
