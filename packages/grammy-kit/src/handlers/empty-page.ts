import { FormattedString } from '@grammyjs/parse-mode'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../types'

/** Fallback for entry points with no page on screen to recover content from. */
export const EMPTY_PAGE: PageContent = {
	message: new FormattedString('', []),
	keyboard: new InlineKeyboard(),
}
