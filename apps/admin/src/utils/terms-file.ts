import { ErrorToRender, getEnvSafe } from '@rips/grammy-kit'
import { Api } from 'grammy'

const TELEGRAM_FILE_BASE_URL = 'https://api.telegram.org/file/bot'

interface TelegramFile {
	file_path?: string
}

/**
 * The pieces of Telegram a download needs, injected so the flow can be tested
 * without a bot. Action handlers are given only the flow and the operator id,
 * so the token is read here rather than threaded through every screen.
 */
export interface TermsFileSource {
	token: string
	getFile: (fileId: string) => Promise<TelegramFile>
	fetchFile: (url: string) => Promise<Response>
}

let defaultSource: TermsFileSource | null = null

function getDefaultSource(): TermsFileSource {
	if (defaultSource === null) {
		const token = getEnvSafe('BOT_TOKEN')
		const api = new Api(token)

		defaultSource = {
			token,
			getFile: (fileId) => api.getFile(fileId),
			fetchFile: (url) => fetch(url),
		}
	}

	return defaultSource
}

export async function downloadTermsFile(
	fileId: string,
	source: TermsFileSource = getDefaultSource(),
): Promise<Blob> {
	const { file_path: filePath } = await source.getFile(fileId)

	if (filePath === undefined) {
		throw new ErrorToRender(
			'Telegram would not release that file. Try uploading it again.',
		)
	}

	const response = await source.fetchFile(
		`${TELEGRAM_FILE_BASE_URL}${source.token}/${filePath}`,
	)

	if (!response.ok) {
		throw new ErrorToRender(
			'The uploaded document could not be downloaded. Try uploading it again.',
		)
	}

	return response.blob()
}
