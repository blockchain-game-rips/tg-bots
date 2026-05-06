import { adminControllerSetPaused } from '../../generated/api-client'
import { actionIds } from '../actions'
import { ConfirmationPage } from '../pages/confirmation-page'
import { TransactionPage } from '../pages/transaction-page'
import { Effect, EffectType, SessionData } from '../types'
import { assertFlow, setFlow } from '../utils/session-utils'

function openConfirmPaused(
	isPaused: boolean,
): (session: SessionData, _payload: string | undefined) => Effect {
	const description = isPaused
		? 'This will <b>pause</b> the protocol.'
		: 'This will <b>unpause</b> the protocol.'

	return (session, _payload): Effect => {
		setFlow(session, 'setPaused', 'confirm', { isPaused })

		return {
			type: EffectType.EDIT,
			page: ConfirmationPage.render(
				description,
				actionIds.executeConfirmPaused,
			),
		}
	}
}

export const openConfirmPause = openConfirmPaused(true)
export const openConfirmUnpause = openConfirmPaused(false)

export function executeConfirmPaused(
	session: SessionData,
	_payload: string | undefined,
): Effect {
	assertFlow(session, 'setPaused', 'confirm')

	const { isPaused } = session.flow.data

	return {
		type: EffectType.SEND_LOADING,
		message: isPaused ? 'Pausing...' : 'Unpausing...',
		next: async () => {
			const { data: tx } = await adminControllerSetPaused({
				body: { isPaused },
			})
			const title = isPaused ? '⏸ Paused' : '▶ Unpaused'
			return {
				type: EffectType.EDIT,
				page: TransactionPage.render(title, tx),
			}
		},
	}
}
