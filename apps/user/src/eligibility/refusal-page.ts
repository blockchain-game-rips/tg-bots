import { toHold, type Flow } from '../flows'
import { ConsentPage } from '../pages/eligibility/consent-page'
import { EffectType, HandlerResult } from '../types'
import { getEnvSafe } from '../utils/common'
import { fetchTermsInputFile } from './terms-document'

/**
 * The single page every refused press ends on, whatever the verdict's reason.
 * Its Agree button re-runs the whole flow, which is what lets a user who has
 * moved re-check their region and a user behind a terms bump clear it with one
 * tap.
 *
 * Asynchronous because the terms PDF rides along on the message: the document
 * is fetched per render rather than held, so a freshly uploaded one is what the
 * user reads.
 *
 * The trail is cleared, since the action the user pressed is deliberately not
 * resumed after the gate.
 */
export async function renderRefusal(): Promise<HandlerResult<Flow>> {
	const termsDocument = await fetchTermsInputFile()

	return {
		flow: toHold(),
		effect: {
			type: EffectType.NAVIGATE,
			page: ConsentPage.render({
				gateUrl: getEnvSafe('GATE_URL'),
				termsDocument,
			}),
			history: { clears: true },
		},
	}
}
