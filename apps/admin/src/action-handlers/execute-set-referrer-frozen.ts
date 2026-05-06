import { adminControllerSetReferrerFrozen } from '../../generated/api-client'
import { actionIds } from '../actions'
import { ConfirmationPage } from '../pages/confirmation-page'
import { TransactionPage } from '../pages/transaction-page'
import { Effect, EffectType, SessionData } from '../types'
import { assertFlow, setFlow } from '../utils/session-utils'
import { parseEvmAddress } from '../validation/evm-address'

const ADDRESS_PROMPT_MESSAGE = 'Enter the referrer EVM address to update.'
const ADDRESS_PLACEHOLDER = '0x...'

function openSetReferrerFrozen(
	frozen: boolean,
): (_session: SessionData, _payload: string | undefined) => Effect {
	return (_session, _payload): Effect => ({
		type: EffectType.ASK,
		prompt: {
			message: ADDRESS_PROMPT_MESSAGE,
			placeholder: ADDRESS_PLACEHOLDER,
		},
		onSubmit: frozen
			? actionIds.submitConfirmFreezeReferrer
			: actionIds.submitConfirmUnfreezeReferrer,
	})
}

function submitConfirmSetReferrerFrozen(
	frozen: boolean,
): (session: SessionData, payload: string | undefined) => Effect {
	return (session, payload): Effect => {
		const address = parseEvmAddress(payload)

		setFlow(session, 'setReferrerFrozen', 'confirm', { address, frozen })

		const description = frozen
			? `This will <b>freeze</b> referrer <code>${address}</code>.`
			: `This will <b>unfreeze</b> referrer <code>${address}</code>.`

		return {
			type: EffectType.EDIT,
			page: ConfirmationPage.render(
				description,
				actionIds.executeConfirmReferrerFrozen,
			),
		}
	}
}

export const openFreezeReferrer = openSetReferrerFrozen(true)
export const openUnfreezeReferrer = openSetReferrerFrozen(false)

export const submitConfirmFreezeReferrer = submitConfirmSetReferrerFrozen(true)
export const submitConfirmUnfreezeReferrer =
	submitConfirmSetReferrerFrozen(false)

export async function executeConfirmReferrerFrozen(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	assertFlow(session, 'setReferrerFrozen', 'confirm')

	const { address, frozen } = session.flow.data

	return {
		type: EffectType.SEND_LOADING,
		message: frozen ? 'Freezing referrer...' : 'Unfreezing referrer...',
		next: async () => {
			const { data: tx } = await adminControllerSetReferrerFrozen({
				path: { address },
				body: { frozen },
			})

			const title = frozen
				? `Referrer ${address} frozen`
				: `Referrer ${address} unfrozen`

			return {
				type: EffectType.EDIT,
				page: TransactionPage.render(title, tx),
			}
		},
	}
}
