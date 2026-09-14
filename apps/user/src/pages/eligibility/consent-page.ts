import { fmt, FormattedString, joinLines } from '@rips/grammy-kit'
import { InlineKeyboard, InputFile } from 'grammy'
import { PageContent } from '../../types'
import * as labels from '../../utils/button-labels'

interface ConsentPageVariant {
	/**
	 * Where `Agree & Continue` opens the region check. Supplied rather than
	 * imported because the gate service owns the URL and the page only shows it.
	 */
	gateUrl: string

	/**
	 * The terms PDF, attached to this message rather than offered behind a
	 * button: the user reads what they are agreeing to without leaving the
	 * screen that asks for the agreement.
	 */
	termsDocument: InputFile
}

/**
 * The single screen the gate talks through — first-time consent, re-consent
 * after a terms bump, and what a blocked user sees instead of home. The closing
 * line announces the region check so the mini app window does not appear
 * unannounced.
 */
export const ConsentPage = {
	render({ gateUrl, termsDocument }: ConsentPageVariant): PageContent {
		const lines = [
			fmt`📋 ${FormattedString.b('Before You Play')}`,
			'',
			'Before you start, please confirm:',
			'',
			fmt`• You are ${FormattedString.b('18 or older')}`,
			fmt`• You accept the ${FormattedString.b('Terms of Service')}`,
			'',
			"Tap Agree to continue. We'll check that Rips is available in your region.",
		]

		const keyboard = new InlineKeyboard().webApp(
			labels.AGREE_AND_CONTINUE,
			gateUrl,
		)

		return {
			message: joinLines(lines),
			keyboard,
			media: { kind: 'document', file: termsDocument },
		}
	},
}
