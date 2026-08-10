import { InlineKeyboard } from 'grammy'

const PLAY_BUTTON_LABEL = '🎮 Play Rips'

export function playRipsKeyboard(playLink: string): InlineKeyboard {
	return new InlineKeyboard().url(PLAY_BUTTON_LABEL, playLink)
}
