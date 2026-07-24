import { assertFlow } from '@rips/grammy-kit'
import { parsePresetId } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { nativeChainAddress, SUPPORTED_CHAINS } from '../../constants'
import { toStep } from '../../flows'
import { EnterChoosePaymentWalletPage } from '../../pages/play/enter-choose-payment-wallet-page'
import { EffectType } from '../../types'
import { fetchBalances, fetchPreset } from '../../utils/api/wrappers'

export const openEnterChoosePaymentWallet: ActionDef<number> = withPayload(
	{
		encode: (presetId) => presetId.toString(),
		decode: (raw) => parsePresetId(raw),
	},
	async (session, presetId) => {
		// TODO: revisit this handler — it wasn't checked after the change.
		assertFlow(
			session,
			'enter',
			'entry-count-chosen',
			'zap-currency-chosen',
		)

		const { entryCount } = session.flow.data

		const [availablePreset, balances] = await Promise.all([
			fetchPreset(presetId),
			fetchBalances(
				session.telegramId,
				SUPPORTED_CHAINS.map((chain) => nativeChainAddress(chain)),
			),
		])

		const flow = toStep(session.flow, 'entry-count-chosen', {
			presetId,
			entryCount,
		})

		return {
			flow,
			effect: {
				type: EffectType.EDIT,
				page: EnterChoosePaymentWalletPage.render({
					availablePreset,
					entryCount,
					balances,
				}),
			},
		}
	},
)
