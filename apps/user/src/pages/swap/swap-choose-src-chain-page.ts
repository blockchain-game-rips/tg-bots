import { CurrencyAmountDto, CurrencyDto } from '@rips/api-client'
import { addNav } from '@rips/grammy-kit'
import { currencyAmountDisplayParts, swapBreadcrumb } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { ActionId, Chain, PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { buildChainKeyboard } from '../choose-chain-token'

export const SwapChooseSrcChainPage = {
	renderFreshDraft(args: { chains: Chain[] }): PageContent {
		return {
			message: buildMessage(['Move funds between your bot wallets.']),
			keyboard: buildKeyboard(args.chains, actionIds.openWallet),
		}
	},

	renderDraftEdit(args: {
		chains: Chain[]
		dstCurrency: CurrencyDto
		amount: CurrencyAmountDto
	}): PageContent {
		const { chains, dstCurrency, amount } = args

		return {
			message: buildMessage(draftLines(dstCurrency, amount)),
			keyboard: buildKeyboard(chains, actionIds.openSwapCheckout),
		}
	},
}

function buildMessage(contextLines: string[]): string {
	return [
		swapBreadcrumb(),
		'',
		...contextLines,
		'',
		'Choose source chain:',
	].join('\n')
}

function draftLines(
	dstCurrency: CurrencyDto,
	amount: CurrencyAmountDto,
): string[] {
	const { displayAmount } = currencyAmountDisplayParts(amount)
	const dstChainName = chainToName(dstCurrency.chainAddress.chain)

	return [
		`To: ${dstChainName} ${dstCurrency.symbol}`,
		`Amount: ${displayAmount}`,
	]
}

function buildKeyboard(
	chains: Chain[],
	parentActionId: ActionId,
): InlineKeyboard {
	const keyboard = buildChainKeyboard(
		chains,
		actionIds.openSwapChooseSrcToken,
	)

	return addNav(keyboard, {
		parent: parentActionId,
		home: actionIds.openHome,
	})
}
