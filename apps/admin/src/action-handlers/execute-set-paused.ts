import { adminControllerSetPaused } from '../../generated/api-client'
import { TransactionPage } from '../pages/transaction-page'
import { Effect, EffectType, SessionData } from '../types'

async function executeSetPaused(isPaused: boolean): Promise<Effect> {
	const { data: tx } = await adminControllerSetPaused({ body: { isPaused } })

	const title = isPaused ? '⏸ Paused' : '▶ Unpaused'

	return { type: EffectType.EDIT, page: TransactionPage.render(title, tx) }
}

export function executePause(
	_session: SessionData,
	_payload: string | undefined,
): Effect {
	return {
		type: EffectType.SEND_LOADING,
		message: 'Pausing...',
		next: () => executeSetPaused(true),
	}
}

export function executeUnpause(
	_session: SessionData,
	_payload: string | undefined,
): Effect {
	return {
		type: EffectType.SEND_LOADING,
		message: 'Unpausing...',
		next: () => executeSetPaused(false),
	}
}
