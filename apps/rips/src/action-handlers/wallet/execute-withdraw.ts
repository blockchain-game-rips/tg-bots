import { walletsControllerCreateWithdrawal } from '../../../generated/api-client'
import { NATIVE_ON_BASE } from '../../constants'
import { WithdrawSuccessPage } from '../../pages/content/wallet/withdraw-success-page'
import { Effect, EffectType, SessionData } from '../../types'
import { ErrorToRender } from '../../utils/error-to-render'
import { assertFlow, resetFlow } from '../../utils/session-utils'

export async function executeWithdraw(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	assertFlow(session, 'withdraw', 'on-withdraw-page')
	const { amount, recipientAddress } = session.flow.data

	if (amount === undefined || recipientAddress === undefined) {
		throw new ErrorToRender(
			'Please set both recipient address and amount before withdrawing',
		)
	}

	const { data } = await walletsControllerCreateWithdrawal({
		headers: { 'x-telegram-id': session.telegramId },
		body: {
			amountIn: {
				amount,
				currencyChainAddress: NATIVE_ON_BASE,
			},
			recipientAddress,
			currencyOutChainAddress: NATIVE_ON_BASE,
		},
	})

	resetFlow(session)

	return { type: EffectType.EDIT, page: WithdrawSuccessPage.render(data) }
}
