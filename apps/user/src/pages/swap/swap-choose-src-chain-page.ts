import { CurrencyDtoOutput } from '@rips/api-client'
import { FormattedString, joinLines, Line } from '@rips/grammy-kit'
import {
	Chain,
	currencyAmountDisplayParts,
	toCurrencyAmount,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { ActionId, PageContent } from '../../types'
import { currencyToChainName } from '../../utils/chain'
import { swapBreadcrumb } from '../../utils/display/breadcrumb'
import { buildChainKeyboard } from '../../utils/chain-currency-keyboard'

export const SwapChooseSrcChainPage = {
	renderFreshDraft(args: { chains: Chain[] }): PageContent {
		return {
			message: buildMessage(['Move funds between your bot wallets.']),
			keyboard: buildKeyboard(args.chains, actionIds.openWallet),
		}
	},

	renderDraftEdit(args: {
		chains: Chain[]
		srcCurrency: CurrencyDtoOutput
		dstCurrency: CurrencyDtoOutput
		amountIn: bigint
	}): PageContent {
		const { chains, srcCurrency, dstCurrency, amountIn } = args

		return {
			message: buildMessage(
				draftLines(srcCurrency, dstCurrency, amountIn),
			),
			keyboard: buildKeyboard(chains, actionIds.openSwapCheckout),
		}
	},
}

function buildMessage(contextLines: string[]): FormattedString {
	const lines: Line[] = [
		swapBreadcrumb(),
		'',
		...contextLines,
		'',
		'Choose source chain:',
	]

	return joinLines(lines)
}

function draftLines(
	srcCurrency: CurrencyDtoOutput,
	dstCurrency: CurrencyDtoOutput,
	amountIn: bigint,
): string[] {
	const amount = toCurrencyAmount(amountIn, srcCurrency)
	const { displayAmount } = currencyAmountDisplayParts(amount)
	const dstChainName = currencyToChainName(dstCurrency)

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

	return keyboard.appendNavButtons({
		parent: parentActionId,
		home: actionIds.openHome,
	})
}
