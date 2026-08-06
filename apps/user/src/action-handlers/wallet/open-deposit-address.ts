import { ChainAddressDtoOutput, usersControllerGetUser } from '@rips/api-client'
import { ActionDef, withPayload } from '../../action-def'
import { Flow, toHold } from '../../flows'
import { DepositAddressPage } from '../../pages/wallet/deposit-address-page'
import { EffectType, HandlerResult } from '../../types'
import { fetchSingleBalance } from '../../utils/api/wrappers'
import { currencyChainAddressCodec } from '../../utils/currency'
import { addressQrInputFile } from '../../utils/qr'
import { evmAddressFromUser } from '../../utils/wallet'

async function renderDepositAddress(
	telegramId: string,
	currencyChainAddress: ChainAddressDtoOutput,
	showQr: boolean,
): Promise<HandlerResult<Flow>> {
	const [balance, { data: user }] = await Promise.all([
		fetchSingleBalance(telegramId, currencyChainAddress),
		usersControllerGetUser({ path: { telegramId } }),
	])

	const depositAddress = evmAddressFromUser(user)

	const qr = showQr ? await addressQrInputFile(depositAddress) : undefined

	return {
		flow: toHold(),
		effect: {
			type: EffectType.EDIT,
			page: DepositAddressPage.render({ balance, depositAddress, qr }),
		},
	}
}

export const openDepositAddress: ActionDef<ChainAddressDtoOutput> = withPayload(
	currencyChainAddressCodec,
	(session, currencyChainAddress) =>
		renderDepositAddress(session.telegramId, currencyChainAddress, false),
)

export const openDepositAddressQr: ActionDef<ChainAddressDtoOutput> =
	withPayload(currencyChainAddressCodec, (session, currencyChainAddress) =>
		renderDepositAddress(session.telegramId, currencyChainAddress, true),
	)
