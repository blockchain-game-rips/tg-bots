import { InlineKeyboard } from 'grammy'
import { buildCommand } from '../../commands'
import { Context } from '../../types'
import { Page, Renderable } from '../interfaces'

export class CustomAmountPage implements Renderable {
	constructor() {}

	render(args: { ctx: Context; params: string[] }): Page {
		const stakeId = args.params[0]

		return {
			message: 'Send tickets amount to buy',
			keyboard: new InlineKeyboard()
				.text(
					'Back',
					buildCommand({
						pageId: 'choose-t-a',
						type: 'open',
						payloads: [stakeId],
					}),
				)
				.text('Home', buildCommand({ pageId: 'home', type: 'open' })),
		}
	}
}
