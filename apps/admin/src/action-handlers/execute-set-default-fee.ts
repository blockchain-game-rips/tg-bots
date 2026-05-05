import { adminControllerSetDefaultReferralFee } from '../../generated/api-client'
import { actionIds } from '../actions'
import { TransactionPage } from '../pages/transaction-page'
import { Effect, EffectType, SessionData } from '../types'
import { parseFeeBp } from '../validation/fee-bp'

const FEE_PROMPT_MESSAGE = [
	'Enter the default referral fee in basis points (bp).',
	'',
	'<code>1000 bp</code> = 10%',
	'<code>100 bp</code> = 1%',
	'<code>1 bp</code> = 0.01%',
].join('\n')

const FEE_PLACEHOLDER = 'e.g. 1000 for 10%'

export function openSetDefaultFee(
	_session: SessionData,
	_payload: string | undefined,
): Effect {
	return {
		type: EffectType.ASK,
		prompt: {
			message: FEE_PROMPT_MESSAGE,
			placeholder: FEE_PLACEHOLDER,
		},
		onSubmit: actionIds.submitSetDefaultFee,
	}
}

export async function submitSetDefaultFee(
	_session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	const bp = parseFeeBp(payload)

	const { data: tx } = await adminControllerSetDefaultReferralFee({
		body: { feePercent: bp },
	})

	return {
		type: EffectType.EDIT,
		page: TransactionPage.render(`Default fee set to ${bp} bp`, tx),
	}
}
