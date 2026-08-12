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
import { actionIds } from '../actions'
import { Flow } from '../flows'
import { ConfirmationPage } from '../pages/confirmation-page'
import { TransactionPage } from '../pages/transaction-page'
import { EffectType } from '../types'
import { adminApiHeader } from '../utils/api'

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
					headers: adminApiHeader,
					body: { isPaused },
				})
				const title = isPaused ? '⏸ Paused' : '▶ Unpaused'
				return {
					flow: toReset(),
					effect: {
						type: EffectType.NAVIGATE,
						page: TransactionPage.render(title, tx),
					},
				}
			},
		},
	}
})
