import { adminControllerSetReferrerFrozen } from '@rips/api-client'
import {
	ActionDef,
	assertFlow,
	fmt,
	FormattedString,
	toFlow,
	toReset,
} from '@rips/grammy-kit'
import { parseEvmAddress } from '@rips/shared'
import { noPayload, withPayload } from '../action-def'
import { actionIds } from '../action-ids'
import { Flow } from '../flows'
import { ConfirmationPage } from '../pages/confirmation-page'
import { TransactionPage } from '../pages/transaction-page'
import { EffectType } from '../types'
import { adminApiKey } from '../utils/api'

const ADDRESS_PROMPT_MESSAGE = fmt`Enter the referrer EVM address to update.`
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
				? fmt`This will ${FormattedString.b('freeze')} referrer ${FormattedString.code(address)}.`
				: fmt`This will ${FormattedString.b('unfreeze')} referrer ${FormattedString.code(address)}.`

			return {
				flow,
				effect: {
					type: EffectType.NAVIGATE,
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
			effect: {
				type: EffectType.LOADING,
				message: frozen
					? fmt`Freezing referrer...`
					: fmt`Unfreezing referrer...`,
				next: async () => {
					const { data: tx } = await adminControllerSetReferrerFrozen(
						{
							headers: { 'x-admin-api-key': adminApiKey },
							path: { address },
							body: { frozen },
						},
					)

					const titles = frozen
						? {
								succeeded: `Referrer ${address} frozen`,
								operation: 'Freezing the referrer',
							}
						: {
								succeeded: `Referrer ${address} unfrozen`,
								operation: 'Unfreezing the referrer',
							}

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
	},
)
