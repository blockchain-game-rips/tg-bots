import { Filter } from 'grammy'
import { pageIds } from '../../pages/page-ids'
import { Context } from '../../types'
import { handleAboutPageId } from './handlers/about'
import { handleActiveRoundsPageId } from './handlers/active-rounds'
import { handleChooseStakePageId } from './handlers/choose-stake'
import { handleChooseTicketAmountPageId } from './handlers/choose-ticket-amount'
import { handleChooseWithdrawAmountPageId } from './handlers/choose-withdraw-amount'
import { handleConfirmPurchasePageId } from './handlers/confirm-purchase'
import { handleConfirmWithdrawPageId } from './handlers/confirm-withdraw'
import { handleFinishedRoundsPageId } from './handlers/finished-rounds'
import { handleHomePageId } from './handlers/home'
import { handleOpenRipsPageId } from './handlers/open-rips'
import { handlePlayPageId } from './handlers/play'
import { handleRevealPrizesPageId } from './handlers/reveal-prizes'
import { handleStatusPageId } from './handlers/status'
import { handleSuccessPurchasePageId } from './handlers/success-purchase'
import { handleSuccessWithdrawPageId } from './handlers/success-withdraw'
import { handleWalletPageId } from './handlers/wallet'

export async function handleOpenCommand(
	ctx: Filter<Context, 'callback_query:data'>,
	pageId: string,
	payloads: string[],
): Promise<void> {
	switch (pageId) {
		case pageIds.home:
			return await handleHomePageId(ctx)

		case pageIds.about:
			return await handleAboutPageId(ctx)

		case pageIds.wallet:
			return await handleWalletPageId(ctx)

		case pageIds.chooseWithdrawAmount:
			return await handleChooseWithdrawAmountPageId(ctx, payloads)

		case pageIds.confirmWithdraw:
			return await handleConfirmWithdrawPageId(ctx)

		case pageIds.successWithdraw:
			return await handleSuccessWithdrawPageId(ctx)

		case pageIds.play:
			return await handlePlayPageId(ctx)

		case pageIds.chooseStake:
			return await handleChooseStakePageId(ctx)

		case pageIds.chooseTicketAmount:
			return await handleChooseTicketAmountPageId(ctx, payloads)

		case pageIds.confirmPurchase:
			return await handleConfirmPurchasePageId(ctx, payloads)

		case pageIds.openRips:
			return await handleOpenRipsPageId(ctx)

		case pageIds.revealPrizes:
			return await handleRevealPrizesPageId(ctx, payloads)

		case pageIds.status:
			return await handleStatusPageId(ctx)

		case pageIds.activeRounds:
			return await handleActiveRoundsPageId(ctx)

		case pageIds.finishedRounds:
			return await handleFinishedRoundsPageId(ctx)

		case pageIds.successPurchase:
			return await handleSuccessPurchasePageId(ctx)

		default:
			throw Error(`unknown pageId: ${pageId}`)
	}
}
