import { adminControllerSetReferrerFrozen } from '@rips/api-client'
import {
	ActionDef,
	assertFlow,
	toFlow,
	toHold,
	toReset,
} from '@rips/grammy-kit'
import { parseEvmAddress } from '@rips/shared'
import { noPayload, withPayload } from '../action-def'
import { actionIds } from '../actions'
import { Flow } from '../flows'
import { ConfirmationPage } from '../pages/confirmation-page'
import { TransactionPage } from '../pages/transaction-page'
import { EffectType } from '../types'
import { adminApiHeader } from '../utils/api'

const ADDRESS_PROMPT_MESSAGE = 'Enter the referrer EVM address to update.'
const ADDRESS_PLACEHOLDER = '0x...'

function openSetReferrerFrozen(frozen: boolean): ActionDef<void> {
	return noPayload(() => ({
		flow: toReset(),
		effect: {
			type: EffectType.ASK,
			prompt: {
				message: ADDRESS_PROMPT_MESSAGE,
				placeholder: ADDRESS_PLACEHOLDER,
			},
			onSubmit: frozen
				? actionIds.submitConfirmFreezeReferrer
				: actionIds.submitConfirmUnfreezeReferrer,
		},
	}))
}

function submitConfirmSetReferrerFrozen(frozen: boolean): ActionDef<string> {
	return withPayload<string>(
		(v) => v,
		(v) => v,
		(_session, payload) => {
			const address = parseEvmAddress(payload)

			const flow = toFlow<Flow, 'setReferrerFrozen', 'confirm'>(
				'setReferrerFrozen',
				'confirm',
				{ address, frozen },
			)

			const description = frozen
				? `This will <b>freeze</b> referrer <code>${address}</code>.`
				: `This will <b>unfreeze</b> referrer <code>${address}</code>.`

			return {
				flow,
				effect: {
					type: EffectType.EDIT,
					page: ConfirmationPage.render(
						description,
						actionIds.executeConfirmReferrerFrozen,
					),
				},
			}
		},
	)
}

export const openFreezeReferrer = openSetReferrerFrozen(true)
export const openUnfreezeReferrer = openSetReferrerFrozen(false)

export const submitConfirmFreezeReferrer = submitConfirmSetReferrerFrozen(true)
export const submitConfirmUnfreezeReferrer =
	submitConfirmSetReferrerFrozen(false)

export const executeConfirmReferrerFrozen: ActionDef<void> = noPayload(
	(session) => {
		assertFlow(session, 'setReferrerFrozen', 'confirm')

		const { address, frozen } = session.flow.data

		return {
			flow: toHold(),
			effect: {
				type: EffectType.SEND_LOADING,
				message: frozen
					? 'Freezing referrer...'
					: 'Unfreezing referrer...',
				next: async () => {
					const { data: tx } = await adminControllerSetReferrerFrozen(
						{
							headers: adminApiHeader,
							path: { address },
							body: { frozen },
						},
					)

					const title = frozen
						? `Referrer ${address} frozen`
						: `Referrer ${address} unfrozen`

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
	},
)
