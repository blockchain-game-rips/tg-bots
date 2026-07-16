import { addNav } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

export const ExportKeyPage = {
	render(privateKey: string): PageContent {
		const lines = [
			'Your private key (tap to copy):',
			'',
			`<code>${privateKey}</code>`,
			'',
			'⚠️ Delete this message once you have saved the key.',
		]

		const keyboard = new InlineKeyboard()

		addNav(keyboard, {
			home: actionIds.openHome,
			parent: actionIds.openWallet,
		})

		return { message: lines.join('\n'), keyboard }
	},
}
