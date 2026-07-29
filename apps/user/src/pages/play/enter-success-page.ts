import {
	BuyEntriesPurchaseResponseDtoOutput,
	BuyEntriesZapResponseDtoOutput,
	BuyEntriesZapSamechainResponseDtoOutput,
	GetZapResultResponseDtoOutput,
	RipDto,
} from '@rips/api-client'
import { Chain } from '../../types'
import {
	buildActionData,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import { configName, formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { enterBreadcrumb } from '../../utils/display/breadcrumb'

type ZapSuccess = NonNullable<GetZapResultResponseDtoOutput['success']>

interface DirectResult {
	kind: 'direct'
	result: BuyEntriesPurchaseResponseDtoOutput
	rip: RipDto
}

interface SamechainResult {
	kind: 'samechain'
	result: BuyEntriesZapSamechainResponseDtoOutput
	rip: RipDto
}

interface CrosschainResult {
	kind: 'crosschain'
	submit: BuyEntriesZapResponseDtoOutput
	result: ZapSuccess
	rip: RipDto
}

type SingleChainResult = DirectResult | SamechainResult

type SuccessResult = SingleChainResult | CrosschainResult

function isSingleChain(args: SuccessResult): args is SingleChainResult {
	return args.kind === 'direct' || args.kind === 'samechain'
}

export const EnterSuccessPage = {
	render(args: SuccessResult): PageContent {
		const { rip, result } = args

		const { ripId, entryCount, startEntryIndex } = result

		const lines: Line[] = [
			enterBreadcrumb(configName(rip.config)),
			'',
			'✅ Entry confirmed',
			'',
			`Rip: #${ripId.toString()}`,
			`Entries: ${entryCount.toString()}`,
			entryTotalLine(rip, entryCount),
			'',
			'Status:',
			statusLine(startEntryIndex, entryCount, rip.config.entryCap),
			'',
			...transactionLines(args),
		]

		return {
			message: joinLines(lines),
			keyboard: buildKeyboard(ripId),
		}
	},
}

function entryTotalLine(rip: RipDto, entryCount: number): string {
	const { entryPrice } = rip.config

	const total = BigInt(entryCount) * BigInt(entryPrice.amount)

	const formatted = formatAmountWithUsd({
		amount: total.toString(),
		currency: entryPrice.currency,
	})

	return `Entry total: ${formatted}`
}

function statusLine(
	startEntryIndex: number,
	entryCount: number,
	entryCap: number,
): string {
	const filled = startEntryIndex + entryCount === entryCap

	if (filled) return 'Rip filled — finalizing results.'

	return 'Waiting for Rip to fill.'
}

function transactionLines(args: SuccessResult): Line[] {
	if (isSingleChain(args)) {
		return [
			'Transaction:',
			FormattedString.code(args.result.transaction.id),
		]
	}

	const srcChain = args.submit.amountIn.currency.chainAddress.chain
	const dstChain = args.rip.currency.chainAddress.chain

	return [
		...transactionOnChainLines(srcChain, args.submit.srcTransaction.id),
		...transactionOnChainLines(dstChain, args.result.dstTransaction.id),
	]
}

function transactionOnChainLines(chain: Chain, transactionId: string): Line[] {
	return [
		`Transaction on ${chainToName(chain)}:`,
		FormattedString.code(transactionId),
	]
}

function buildKeyboard(ripId: number): InlineKeyboard {
	return new InlineKeyboard()
		.text(
			'View Rip Status',
			buildActionData(actionIds.openRipStatus, ripId),
		)
		.row()
		.text(
			'Enter Again',
			buildActionData(actionIds.openChoosePreset, undefined),
		)
		.row()
		.text('Open Pulls', buildActionData(actionIds.openOpenPulls, undefined))
		.row()
		.appendHomeButton()
}
