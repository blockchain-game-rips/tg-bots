import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { addNav } from '../../utils/keyboard'
import { messageFromLines } from '../../utils/message'
import { TokenSelection, tokenLabel } from '../../utils/swap-utils'

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
				tokenIn ? 'Change token in' : 'Choose token in',
				actionIds.showSwapChooseChain,
			)
			.row()
			.text(
				tokenOut ? 'Change token out' : 'Choose token out',
				actionIds.showSwapChooseChain,
			)
			.row()

		if (tokenIn !== undefined && tokenOut !== undefined) {
			keyboard.text('Choose amount', actionIds.showSwapChooseAmount).row()
		}

		addNav(keyboard, {
			parent: actionIds.showWallet,
			home: actionIds.showHome,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
