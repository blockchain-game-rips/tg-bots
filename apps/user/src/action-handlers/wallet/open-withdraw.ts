import { ChainAddressDto } from '@rips/api-client'
import { ActionDef, withPayload } from '../../action-def'
import { toFlow } from '../../flows'
import { WithdrawPage } from '../../pages/wallet/withdraw-page'
import { EffectType } from '../../types'
import { fetchSingleBalance } from '../../utils/api/wrappers'
import { currencyChainAddressCodec } from '../../utils/currency'
import { noPayload } from '@rips/grammy-kit'

export const openWithdraw = noPayload(() => {
	throw new Error('Not implemented')
})

export const openWithdrawStale: ActionDef<ChainAddressDto> = withPayload(
	currencyChainAddressCodec,
	async (session, currencyChainAddress) => {
		const currencyBalance = await fetchSingleBalance(
			session.telegramId,
			currencyChainAddress,
		)

		const flow = toFlow('withdraw', 'currency-chosen', {
			currency: currencyBalance.currency,
		})

		return {
			flow,
			effect: {
				type: EffectType.EDIT,
				page: WithdrawPage.render({
					kind: 'pending',
					currencyBalance,
				}),
			},
		}
	},
)
