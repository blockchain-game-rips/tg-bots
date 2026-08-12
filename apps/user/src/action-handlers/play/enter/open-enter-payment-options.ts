import { AvailablePresetDtoOutput } from '@rips/api-client'
import { assertFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload, withPayload } from '../../../action-def'
import { SUPPORTED_CURRENCIES } from '../../../constants'
import { Flow, toFlow } from '../../../flows'
import { EnterPaymentOptionsPage } from '../../../pages/play/enter-payment-options-page'
import { EffectType, HandlerResult } from '../../../types'
import { fetchBalances } from '../../../utils/api/wrappers'
import { entryCountCodec } from '../../../utils/codecs'

export const openEnterPaymentOptions: ActionDef<void> = noPayload((session) => {
	assertFlow(session, 'enter', 'choosing-payment-token', 'at-checkout')

	const { availablePreset, entryCount } = session.flow.data

	return renderPaymentOptions(session.telegramId, availablePreset, entryCount)
})

export const openEnterPaymentOptionsFromEntryCount: ActionDef<number> =
	withPayload(entryCountCodec, (session, entryCount) => {
		assertFlow(
			session,
			'enter',
			'choosing-entry-count',
			'choosing-payment-token',
			'at-checkout',
		)

		const { availablePreset } = session.flow.data

		return renderPaymentOptions(
			session.telegramId,
			availablePreset,
			entryCount,
		)
	})

async function renderPaymentOptions(
	telegramId: string,
	availablePreset: AvailablePresetDtoOutput,
	entryCount: number,
): Promise<HandlerResult<Flow>> {
	const balances = await fetchBalances(telegramId, SUPPORTED_CURRENCIES)

	return {
		flow: toFlow('enter', 'choosing-payment-token', {
			availablePreset,
			entryCount,
			balances,
		}),
		effect: {
			type: EffectType.NAVIGATE,
			page: EnterPaymentOptionsPage.render({
				availablePreset,
				entryCount,
				balances,
			}),
		},
	}
}
