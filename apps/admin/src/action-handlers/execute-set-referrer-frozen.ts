import { adminControllerSetReferrerFrozen } from '../../generated/api-client'
import { actionIds } from '../actions'
import { TransactionPage } from '../pages/transaction-page'
import { Effect, EffectType, SessionData } from '../types'
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
			? actionIds.submitFreezeReferrer
			: actionIds.submitUnfreezeReferrer,
	})
}

async function submitSetReferrerFrozen(
	frozen: boolean,
	payload: string | undefined,
): Promise<Effect> {
	const address = parseEvmAddress(payload)

	const { data: tx } = await adminControllerSetReferrerFrozen({
		path: { address },
		body: { frozen },
	})

	const title = frozen
		? `Referrer ${address} frozen`
		: `Referrer ${address} unfrozen`

	return { type: EffectType.EDIT, page: TransactionPage.render(title, tx) }
}

export const openFreezeReferrer = openSetReferrerFrozen(true)
export const openUnfreezeReferrer = openSetReferrerFrozen(false)

export function submitFreezeReferrer(
	_session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	return submitSetReferrerFrozen(true, payload)
}

export function submitUnfreezeReferrer(
	_session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	return submitSetReferrerFrozen(false, payload)
}
