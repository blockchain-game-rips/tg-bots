import { InputFile } from 'grammy'
import { fetchEligibilityTerms } from '../utils/api/wrappers'

/** Telegram shows this name to the user. */
export const TERMS_FILENAME = 'terms.pdf'

/** The document the consent screen attaches, ready to render. */
export async function fetchTermsInputFile(): Promise<InputFile> {
	return new InputFile(await fetchEligibilityTerms(), TERMS_FILENAME)
}
