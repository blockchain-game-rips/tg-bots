import { InlineKeyboard } from 'grammy'
import { buildCommand } from '../../../button-handler/utils'
import { SUPPORTED_CURRENCIES } from '../../../constants'
import { PageContent } from '../../../types'
import { pageIds } from '../../page-ids'
import { addNav } from '../../utils'

export class SwapPage {
	static render(args: {
		tokenInIndex?: number
		tokenOutIndex?: number
	}): PageContent {
		const { tokenInIndex, tokenOutIndex } = args

		const tokenIn =
			tokenInIndex !== undefined
				? SUPPORTED_CURRENCIES[tokenInIndex]
				: undefined
		const tokenOut =
			tokenOutIndex !== undefined
				? SUPPORTED_CURRENCIES[tokenOutIndex]
				: undefined

		const lines = [
			`Token in: ${tokenIn ? tokenIn.symbol : '—'}`,
			`Token out: ${tokenOut ? tokenOut.symbol : '—'}`,
		]

		const keyboard = new InlineKeyboard()
			.text(
				tokenIn
					? `Change token in (${tokenIn.symbol})`
					: 'Choose token in',
				buildCommand({
					pageId: pageIds.swapChooseChain,
					type: 'open',
					payloads: [],
				}),
			)
			.row()
			.text(
				tokenOut
					? `Change token out (${tokenOut.symbol})`
					: 'Choose token out',
				buildCommand({
					pageId: pageIds.swapChooseChain,
					type: 'open',
					payloads: [],
				}),
			)
			.row()

		if (tokenIn !== undefined && tokenOut !== undefined) {
			keyboard
				.text(
					'Choose amount',
					buildCommand({
						pageId: pageIds.swapChooseAmount,
						type: 'open',
						payloads: [],
					}),
				)
				.row()
		}

		addNav(keyboard, { parent: pageIds.wallet, home: pageIds.home })

		return { message: lines.join('\n'), keyboard }
	}
}
