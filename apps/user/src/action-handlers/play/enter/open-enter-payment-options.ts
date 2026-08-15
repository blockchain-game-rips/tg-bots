import { assertFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload, withPayload } from '../../../action-def'
import { balanceCache } from '../../../cache/balance-cache'
import { presetCache } from '../../../cache/preset-cache'
import { getSupportedCurrencies } from '../../../supported-currencies'
import { Flow, toFlow } from '../../../flows'
import { EnterPaymentOptionsPage } from '../../../pages/play/enter-payment-options-page'
import { EffectType, HandlerResult } from '../../../types'
import { entryCountCodec } from '../../../utils/codecs'

export const openEnterPaymentOptions: ActionDef<void> = noPayload((session) => {
	assertFlow(session, 'enter', 'choosing-payment-token', 'at-checkout')

	const { presetId, entryCount } = session.flow.data

	return renderPaymentOptions(session.telegramId, presetId, entryCount)
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

		const { presetId } = session.flow.data

		return renderPaymentOptions(session.telegramId, presetId, entryCount)
	})

async function renderPaymentOptions(
	telegramId: string,
	presetId: number,
	entryCount: number,
): Promise<HandlerResult<Flow>> {
	const [availablePreset, balances] = await Promise.all([
		presetCache.getOne(presetId),
		balanceCache.get(telegramId, getSupportedCurrencies()),
	])

	return {
		flow: toFlow('enter', 'choosing-payment-token', {
			presetId,
			entryCount,
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
