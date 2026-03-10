import { Reply, Replyable } from '../pages/interfaces'
import { Context } from '../types'

export class CustomTicketAmountReplyable implements Replyable {
	reply(args: { ctx: Context }): Reply {
		const session = args.ctx.session

		if (session.activeFlow !== 'ticket-purchase') {
			throw new Error('activeFlow should be ticket-purchase')
		}

		args.ctx.session = {
			activeFlow: 'ticket-purchase',
			step: 'waiting-for-input',
			//TODO: figure out how not to use !
			messageIdToEdit:
				args.ctx.update.callback_query!.message!.message_id,
			stakeId: session.stakeId,
		}

		return {
			inputPlaceHolder: '10',
			message: 'Specify the ticket amount',
		}
	}
}
