import { walletsControllerGetBalances } from '../../../generated/api-client'
import { createQuerySerializer } from '../../../generated/api-client/client/utils.gen'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { AllBalancesPage } from '../../pages/wallet/all-balances-page'
import { Effect, EffectType, SessionData } from '../../types'
import { chainAddressToString } from '../../utils/currency'

export function openAllBalances(
	session: SessionData,
	_payload: string | undefined,
): Effect {
	const { telegramId } = session

	return {
		type: EffectType.SEND_LOADING,
		message: 'Fetching balances...',
		next: async () => {
			const chainAddresses =
				SUPPORTED_CURRENCIES.map(chainAddressToString)

			const { data } = await walletsControllerGetBalances({
				headers: { 'x-telegram-id': telegramId },
				query: { chainAddress: chainAddresses },
				querySerializer: createQuerySerializer({ allowReserved: true }),
			})

			return {
				type: EffectType.EDIT,
				page: AllBalancesPage.render(data.balances),
			}
		},
	}
}
