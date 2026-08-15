import { InlineKeyboard } from 'grammy'
import { PLAY_RIPS } from '../../utils/button-labels'

export function playRipsKeyboard(playLink: string): InlineKeyboard {
	return new InlineKeyboard().url(PLAY_RIPS, playLink)
}
