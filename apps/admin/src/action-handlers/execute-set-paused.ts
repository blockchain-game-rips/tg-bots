import { adminControllerSetPaused } from '@rips/api-client'
import {
	ActionDef,
	assertFlow,
	toFlow,
	toHold,
	toReset,
} from '@rips/grammy-kit'
import { noPayload } from '../action-def'
import { actionIds } from '../actions'
import { Flow } from '../flows'
import { ConfirmationPage } from '../pages/confirmation-page'
import { TransactionPage } from '../pages/transaction-page'
import { EffectType } from '../types'
import { adminApiHeader } from '../utils/api'

function openConfirmPaused(isPaused: boolean): ActionDef<void> {
	const description = isPaused
		? 'This will <b>pause</b> the protocol.'
		: 'This will <b>unpause</b> the protocol.'

	return noPayload(() => {
		const flow = toFlow<Flow, 'setPaused', 'confirm'>(
			'setPaused',
			'confirm',
			{ isPaused },
		)

		return {
			flow,
			effect: {
				type: EffectType.EDIT,
				page: ConfirmationPage.render(
					description,
					actionIds.executeConfirmPaused,
				),
			},
		}
	})
}

export const openConfirmPause = openConfirmPaused(true)
export const openConfirmUnpause = openConfirmPaused(false)

export const executeConfirmPaused: ActionDef<void> = noPayload((session) => {
	assertFlow(session, 'setPaused', 'confirm')

	const { isPaused } = session.flow.data

	return {
		flow: toHold(),
		effect: {
			type: EffectType.SEND_LOADING,
			message: isPaused ? 'Pausing...' : 'Unpausing...',
			next: async () => {
				const { data: tx } = await adminControllerSetPaused({
					headers: adminApiHeader,
					body: { isPaused },
				})
				const title = isPaused ? '⏸ Paused' : '▶ Unpaused'
				return {
					flow: toReset(),
					effect: {
						type: EffectType.EDIT,
						page: TransactionPage.render(title, tx),
					},
				}
			},
		},
	}
})
