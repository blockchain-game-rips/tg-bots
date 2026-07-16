import { buildActionData } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

export const WelcomePage = {
	render(): PageContent {
		const lines = [
			'👋 <b>Welcome to Rips</b>',
			'',
			'Choose how to set up your account:',
			'',
			'• <b>Create new account</b> — we generate a fresh wallet for you.',
			'• <b>Import private key</b> — bring your own wallet.',
			'',
			'<b>This choice is permanent.</b> Your account can’t be changed or replaced later.',
		]

		const keyboard = new InlineKeyboard()
			.text(
				'Create new account',
				buildActionData(actionIds.chooseCreateAccount, undefined),
			)
			.row()
			.text(
				'Import private key',
				buildActionData(actionIds.startImportKey, undefined),
			)

		return { message: lines.join('\n'), keyboard }
	},
}
