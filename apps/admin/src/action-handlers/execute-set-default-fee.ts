import { adminControllerSetDefaultReferralFee } from '../../generated/api-client'
import { actionIds } from '../actions'
import { ConfirmationPage } from '../pages/confirmation-page'
import { TransactionPage } from '../pages/transaction-page'
import { Effect, EffectType, SessionData } from '../types'
import { adminApiHeader } from '../utils/api'
import { assertFlow, setFlow } from '../utils/session-utils'
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
		onSubmit: actionIds.submitConfirmSetDefaultFee,
	}
}

export function submitConfirmSetDefaultFee(
	session: SessionData,
	payload: string | undefined,
): Effect {
	const bp = parseFeeBp(payload)

	setFlow(session, 'setDefaultFee', 'confirm', { bp })

	return {
		type: EffectType.EDIT,
		page: ConfirmationPage.render(
			`This will set the default referral fee to <b>${bp} bp</b>.`,
			actionIds.executeConfirmSetDefaultFee,
		),
	}
}

export function executeConfirmSetDefaultFee(
	session: SessionData,
	_payload: string | undefined,
): Effect {
	assertFlow(session, 'setDefaultFee', 'confirm')

	const { bp } = session.flow.data

	return {
		type: EffectType.SEND_LOADING,
		message: 'Setting default fee...',
		next: async () => {
			const { data: tx } = await adminControllerSetDefaultReferralFee({
				headers: adminApiHeader,
				body: { feePercent: bp },
			})

			return {
				type: EffectType.EDIT,
				page: TransactionPage.render(`Default fee set to ${bp} bp`, tx),
			}
		},
	}
}
