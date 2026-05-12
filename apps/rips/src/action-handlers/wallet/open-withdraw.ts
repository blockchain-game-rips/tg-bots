import { ChainAddressDto } from '../../../generated/api-client'
import { ActionDef, withPayload } from '../../action-def'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { WithdrawPage } from '../../pages/wallet/withdraw-page'
import { EffectType } from '../../types'
import { fetchBalances } from '../../utils/api'
import { toCurrencyId } from '../../utils/currency'
import { setFlow } from '../../utils/session-utils'
import { parseCurrencyChainAddress } from '../../validation/currency-index'

export const openWithdraw: ActionDef<ChainAddressDto> = withPayload(
	(currencyChainAddress) =>
		SUPPORTED_CURRENCIES.findIndex(
			(c) =>
				c.address === currencyChainAddress.address &&
				c.chain.reference === currencyChainAddress.chain.reference,
		).toString(),
	(raw) => parseCurrencyChainAddress(raw),
	async (session, currencyChainAddress) => {
		const balances = await fetchBalances(session.telegramId, [
			toCurrencyId(currencyChainAddress),
		])

		const currencyBalance = balances[0]

		if (currencyBalance === undefined) throw new Error('Balance not found')

		setFlow(session, 'withdraw', 'currency-chosen', {
			currency: currencyBalance.currency,
		})

		return {
			type: EffectType.EDIT,
			page: WithdrawPage.render(currencyBalance, undefined, undefined),
		}
	},
)
