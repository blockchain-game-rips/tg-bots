import { CurrencyAmountDto, CurrencyDto } from '@rips/api-client'
import { addNav } from '@rips/grammy-kit'
import { currencyAmountDisplayParts, swapBreadcrumb } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { ActionId, Chain, PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { buildTokenKeyboard } from '../choose-chain-token'

export const SwapChooseSrcTokenPage = {
	renderFreshDraft(args: {
		srcChain: Chain
		currencies: CurrencyDto[]
	}): PageContent {
		const { srcChain, currencies } = args

		return {
			message: buildMessage([`From: ${chainToName(srcChain)}`]),
			keyboard: buildKeyboard(currencies, actionIds.openSwap),
		}
	},

	renderDraftEdit(args: {
		srcChain: Chain
		currencies: CurrencyDto[]
		dstCurrency: CurrencyDto
		amount: CurrencyAmountDto
	}): PageContent {
		const { srcChain, currencies, dstCurrency, amount } = args

		return {
			message: buildMessage(draftLines(srcChain, dstCurrency, amount)),
			keyboard: buildKeyboard(currencies, actionIds.openSwapCheckout),
		}
	},
}

function buildMessage(contextLines: string[]): string {
	return [swapBreadcrumb(), '', ...contextLines, '', 'Choose token:'].join(
		'\n',
	)
}

function draftLines(
	srcChain: Chain,
	dstCurrency: CurrencyDto,
	amount: CurrencyAmountDto,
): string[] {
	const { displayAmount } = currencyAmountDisplayParts(amount)
	const dstChainName = chainToName(dstCurrency.chainAddress.chain)

	return [
		`From: ${chainToName(srcChain)}`,
		`To: ${dstChainName} ${dstCurrency.symbol}`,
		`Amount: ${displayAmount}`,
	]
}

function buildKeyboard(
	currencies: CurrencyDto[],
	parentActionId: ActionId,
): InlineKeyboard {
	const keyboard = buildTokenKeyboard(
		currencies,
		actionIds.openSwapChooseDstChain,
	)

	return addNav(keyboard, {
		parent: parentActionId,
		home: actionIds.openHome,
	})
}
