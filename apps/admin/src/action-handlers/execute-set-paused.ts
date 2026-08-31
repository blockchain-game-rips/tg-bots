import { adminControllerSetPaused } from '@rips/api-client'
import {
	ActionDef,
	assertFlow,
	fmt,
	FormattedString,
	toFlow,
	toReset,
} from '@rips/grammy-kit'
import { noPayload } from '../action-def'
import { actionIds } from '../action-ids'
import { Flow } from '../flows'
import { ConfirmationPage } from '../pages/confirmation-page'
import { TransactionPage } from '../pages/transaction-page'
import { EffectType } from '../types'
import { adminApiKey } from '../utils/api'

function openConfirmPaused(isPaused: boolean): ActionDef<void> {
	const description = isPaused
		? fmt`This will ${FormattedString.b('pause')} the protocol.`
		: fmt`This will ${FormattedString.b('unpause')} the protocol.`

	return noPayload(() => {
		const flow = toFlow<Flow, 'setPaused', 'confirm'>(
			'setPaused',
			'confirm',
			{ isPaused },
		)

		return {
			flow,
			effect: {
				type: EffectType.NAVIGATE,
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
		effect: {
			type: EffectType.LOADING,
			message: isPaused ? fmt`Pausing...` : fmt`Unpausing...`,
			next: async () => {
				const { data: tx } = await adminControllerSetPaused({
					headers: { 'x-admin-api-key': adminApiKey },
					body: { isPaused },
				})
				const titles = isPaused
					? { succeeded: '⏸ Paused', operation: 'Pausing' }
					: { succeeded: '▶ Unpaused', operation: 'Unpausing' }

				return {
					flow: toReset(),
					effect: {
						type: EffectType.NAVIGATE,
						page: TransactionPage.render(titles, tx),
						history: { kind: 'page' },
					},
				}
			},
		},
	}
})
