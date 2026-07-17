import { ChainAddressDto, usersControllerGetUser } from '@rips/api-client'
import { ActionDef, withPayload } from '../../action-def'
import { toHold } from '../../flows'
import { DepositAddressPage } from '../../pages/wallet/deposit-address-page'
import { EffectType } from '../../types'
import { fetchSingleBalance } from '../../utils/api/wrappers'
import { currencyChainAddressCodec } from '../../utils/currency'
import { evmAddressFromUser } from '../../utils/wallet'

export const openDepositAddress: ActionDef<ChainAddressDto> = withPayload(
	currencyChainAddressCodec,
	async (session, currencyChainAddress) => {
		const { telegramId } = session

		const [balance, { data: user }] = await Promise.all([
			fetchSingleBalance(telegramId, currencyChainAddress),
			usersControllerGetUser({ path: { telegramId } }),
		])

		const depositAddress = evmAddressFromUser(user)

		return {
			flow: toHold(),
			effect: {
				type: EffectType.EDIT,
				page: DepositAddressPage.render(balance, depositAddress),
			},
		}
	},
)
