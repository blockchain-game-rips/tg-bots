import { ErrorPageToRender, ErrorToRender } from '@rips/grammy-kit'
import { PageContent } from '../../types'
import { STALE_SCREEN_NOTE } from './transaction-outcome-copy'

/**
 * Ends a failed action on a freshly rendered page, so the amounts beside the
 * error are current and the user can retry. Throwing rather than navigating
 * keeps the flow and leaves no step in the back trail.
 *
 * A null page means the flow has nothing left to show, so the error falls back
 * to whatever was on screen.
 */
export async function errorOnFreshPage(
	renderPage: () => Promise<PageContent | null>,
	message: string,
): Promise<ErrorToRender> {
	try {
		const page = await renderPage()

		if (page === null) return new ErrorToRender(message)

		return new ErrorPageToRender(page, message)
	} catch {
		// the screen behind the error is whatever was there before the attempt
		return new ErrorToRender(`${message}\n\n${STALE_SCREEN_NOTE}`)
	}
}
