import { FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

export const ExportKeyPage = {
	render(privateKey: string): PageContent {
		const lines: Line[] = [
			'Your private key (tap to copy):',
			'',
			FormattedString.code(privateKey),
			'',
			'⚠️ Delete this message once you have saved the key.',
		]

		const keyboard = new InlineKeyboard()

		keyboard.appendNavButtons({
			home: actionIds.openHome,
			parent: actionIds.openWallet,
		})

		return { message: joinLines(lines), keyboard }
	},
}
