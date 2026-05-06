import { adminControllerSetPaused } from '../../generated/api-client'
import { SetPausedFlow } from '../flows'
import { ConfirmationPage } from '../pages/confirmation-page'
import { TransactionPage } from '../pages/transaction-page'
import { Effect, EffectType, SessionData } from '../types'

function openConfirmPaused(
	isPaused: boolean,
): (session: SessionData, _payload: string | undefined) => Effect {
	const description = isPaused
		? 'This will <b>pause</b> the protocol.'
		: 'This will <b>unpause</b> the protocol.'

	return (session, _payload): Effect => {
		session.flow = {
			flowType: 'setPaused',
			step: 'confirm',
			data: { isPaused },
		} satisfies SetPausedFlow

		return {
			type: EffectType.EDIT,
			page: ConfirmationPage.render(description),
		}
	}
}

export const openConfirmPause = openConfirmPaused(true)
export const openConfirmUnpause = openConfirmPaused(false)

export function executeConfirmPaused(
	session: SessionData,
	_payload: string | undefined,
): Effect {
	const flow = session.flow

	if (flow?.flowType !== 'setPaused' || flow.step !== 'confirm') {
		return {
			type: EffectType.EDIT,
			page: ConfirmationPage.render(
				'No pending action. Please go back and try again.',
			),
		}
	}

	const { isPaused } = flow.data

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
