import {
	buildActionData,
	fmt,
	FormattedString,
	joinLines,
} from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../action-ids'
import { PageContent } from '../../types'
import * as labels from '../../utils/button-labels'

export const WelcomePage = {
	render(): PageContent {
		const lines = [
			fmt`👋 ${FormattedString.b('Welcome to Rips')}`,
			'',
			'Choose how to set up your account:',
			'',
			fmt`• ${FormattedString.b('Create new account')} — we generate a fresh wallet for you.`,
			fmt`• ${FormattedString.b('Import private key')} — bring your own wallet.`,
			'',
			fmt`${FormattedString.b('This choice is permanent.')} Your account can’t be changed or replaced later.`,
		]

		const keyboard = new InlineKeyboard()
			.text(
				labels.CREATE_NEW_ACCOUNT,
				buildActionData(actionIds.chooseCreateAccount, undefined),
			)
			.row()
			.text(
				labels.IMPORT_PRIVATE_KEY,
				buildActionData(actionIds.startImportKey, undefined),
			)

		return { message: joinLines(lines), keyboard }
	},
}
