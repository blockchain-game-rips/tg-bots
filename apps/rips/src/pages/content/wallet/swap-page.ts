import { InlineKeyboard } from 'grammy'
import { buildCommand } from '../../../button-handler/utils'
import { PageContent } from '../../../types'
import { pageIds } from '../../page-ids'
import { addNav } from '../../utils'
import { TokenSelection, tokenLabel } from './swap-utils'

export class SwapPage {
	static render(args: {
		in?: TokenSelection
		out?: TokenSelection
	}): PageContent {
		const tokenIn = args.in
		const tokenOut = args.out

		const lines = [
			`Token in: ${tokenIn ? tokenLabel(tokenIn) : '—'}`,
			`Token out: ${tokenOut ? tokenLabel(tokenOut) : '—'}`,
		]

		const keyboard = new InlineKeyboard()
			.text(
				tokenIn ? `Change token in` : 'Choose token in',
				buildCommand({
					pageId: pageIds.swapChooseChain,
					type: 'open',
					payloads: [],
				}),
			)
			.row()
			.text(
				tokenOut ? `Change token out` : 'Choose token out',
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
