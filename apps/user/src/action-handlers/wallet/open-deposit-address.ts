import { ChainAddressDtoOutput, usersControllerGetUser } from '@rips/api-client'
import { buildActionData } from '@rips/grammy-kit'
import { ActionDef, withPayload } from '../../action-def'
import { actionIds } from '../../action-ids'
import { Flow, toHold } from '../../flows'
import { DepositAddressPage } from '../../pages/wallet/deposit-address-page'
import { EffectType, HandlerResult } from '../../types'
import { balanceCache } from '../../cache/balance-cache'
import { currencyChainAddressCodec } from '../../utils/currency'
import { addressQrInputFile } from '../../utils/qr'
import { evmAddressFromUser } from '../../utils/wallet'

/**
 * Showing, hiding and refreshing the QR are states of one page, so all four
 * actions record the same entry and dedupe against each other. Without this the
 * back trail grows by one entry per toggle and back walks those instead of
 * leaving the page.
 */
async function renderDepositAddress(
	telegramId: number,
	currencyChainAddress: ChainAddressDtoOutput,
	showQr: boolean,
): Promise<HandlerResult<Flow>> {
	const [balance, { data: user }] = await Promise.all([
		balanceCache.getOne(telegramId, currencyChainAddress),
		usersControllerGetUser({ path: { telegramId: telegramId.toString() } }),
	])

	const depositAddress = evmAddressFromUser(user)

	const qr = showQr ? await addressQrInputFile(depositAddress) : undefined

	return {
		flow: toHold(),
		effect: {
			type: EffectType.NAVIGATE,
			page: DepositAddressPage.render({ balance, depositAddress, qr }),
			history: {
				replayWith: buildActionData(
					actionIds.openDepositAddress,
					currencyChainAddress,
				),
			},
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

/**
 * The only signal the bot gets that a deposit landed, since nothing tells it
 * when funds arrive on chain. Only the currency on screen is dropped: it is the
 * one the user was told to send, and the only one this page shows.
 */
function refreshDepositAddress(
	showQr: boolean,
): ActionDef<ChainAddressDtoOutput> {
	return withPayload(
		currencyChainAddressCodec,
		async (session, currencyChainAddress) => {
			await balanceCache.invalidate(session.telegramId, [
				currencyChainAddress,
			])

			return renderDepositAddress(
				session.telegramId,
				currencyChainAddress,
				showQr,
			)
		},
	)
}

export const refreshDepositBalance = refreshDepositAddress(false)

export const refreshDepositBalanceQr = refreshDepositAddress(true)
