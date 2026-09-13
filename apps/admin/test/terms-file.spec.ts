import { ErrorToRender } from '@rips/grammy-kit'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../src/utils/api', () => ({ adminApiKey: 'test-admin-api-key' }))

import { downloadTermsFile } from '../src/utils/terms-file'

const FILE_ID = 'BQACAgIAAxkBAAitermsfile'
const FILE_PATH = 'documents/file_1.pdf'
const TOKEN = 'test-bot-token'
const BYTES = new Uint8Array([1, 2, 3])

const okResponse = (): Response =>
	new Response(BYTES, { status: 200, headers: { 'x-ok': '1' } })

const messageOf = async (download: () => Promise<unknown>): Promise<string> => {
	try {
		await download()
	} catch (error) {
		if (error instanceof ErrorToRender) return error.messageToRender.text

		throw error
	}

	throw new Error('expected the download to be rejected')
}

describe('downloading an uploaded terms document', () => {
	it('resolves the file path, then fetches it, returning the bytes', async () => {
		const getFile = vi.fn().mockResolvedValue({ file_path: FILE_PATH })
		const fetchFile = vi.fn().mockResolvedValue(okResponse())

		const blob = await downloadTermsFile(FILE_ID, {
			token: TOKEN,
			getFile,
			fetchFile,
		})

		expect(getFile).toHaveBeenCalledWith(FILE_ID)
		expect(fetchFile).toHaveBeenCalledWith(
			`https://api.telegram.org/file/bot${TOKEN}/${FILE_PATH}`,
		)
		expect(await blob.bytes()).toEqual(BYTES)
	})

	it('reports a file Telegram will not name a path for', async () => {
		const message = await messageOf(() =>
			downloadTermsFile(FILE_ID, {
				token: TOKEN,
				getFile: vi.fn().mockResolvedValue({ file_path: undefined }),
				fetchFile: vi.fn(),
			}),
		)

		expect(message).toBeTruthy()
	})

	it('reports a download that fails', async () => {
		const message = await messageOf(() =>
			downloadTermsFile(FILE_ID, {
				token: TOKEN,
				getFile: vi.fn().mockResolvedValue({ file_path: FILE_PATH }),
				fetchFile: vi
					.fn()
					.mockResolvedValue(new Response('', { status: 404 })),
			}),
		)

		expect(message).toBeTruthy()
	})
})
