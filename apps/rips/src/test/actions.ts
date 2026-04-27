import { requestCustomCountAction } from './action-handlers/request-custom-count'
import { showChooseTickets } from './action-handlers/show-choose-tickets'
import { showConfirm } from './action-handlers/show-confirm'
import { showTestHome } from './action-handlers/show-test-home'
import { ActionId, actionIds } from './action-ids'
import { ActionHandler } from './types'

export const actions: Record<ActionId, ActionHandler> = {
	[actionIds.showTestHome]: showTestHome,
	[actionIds.showChooseTickets]: showChooseTickets,
	[actionIds.showConfirm]: showConfirm,
	[actionIds.requestCustomCount]: requestCustomCountAction,
}
