import { CurrencyAmountDto } from '@rips/api-client'
import {
	buildActionData,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { BASE_CHAIN, isNativeChainAddress } from '../../constants'
import { Chain, PageContent } from '../../types'
import { chainToEmoji, chainToName, currencyToChain } from '../../utils/chain'

function isZeroAmount(balance: CurrencyAmountDto): boolean {
	return BigInt(balance.amount) === 0n
}

function isBaseChain(chain: Chain): boolean {
	return (
		chain.namespace === BASE_CHAIN.namespace &&
		chain.reference === BASE_CHAIN.reference
	)
}

function groupBalancesByChain(
	balances: CurrencyAmountDto[],
): Map<string, CurrencyAmountDto[]> {
	const groups = new Map<string, CurrencyAmountDto[]>()

	for (const balance of balances) {
		const { namespace, reference } = currencyToChain(balance.currency)
		const key = `${namespace}:${reference}`

		const group = groups.get(key) ?? []
		group.push(balance)
		groups.set(key, group)
	}

	return groups
}

function nativeLine(nativeBalance: CurrencyAmountDto): string {
	if (isZeroAmount(nativeBalance)) {
		return `0 ${nativeBalance.currency.symbol}`
	}

	return formatAmountWithUsd(nativeBalance)
}

function chainBalanceLines(chainBalances: CurrencyAmountDto[]): string[] {
	const nativeBalance = chainBalances.find((balance) =>
		isNativeChainAddress(balance.currency.chainAddress),
	)

	if (nativeBalance === undefined) {
		throw new Error('Native balance not found for chain')
	}

	const chain = currencyToChain(nativeBalance.currency)

	const tokenLines = chainBalances
		.filter(
			(balance) =>
				!isNativeChainAddress(balance.currency.chainAddress) &&
				!isZeroAmount(balance),
		)
		.map((balance) => formatAmountWithUsd(balance))

	return [
		`${chainToEmoji(chain)} ${chainToName(chain)}`,
		nativeLine(nativeBalance),
		...tokenLines,
		'',
	]
}

export const WalletPage = {
	render(balances: CurrencyAmountDto[]): PageContent {
		const settlementHeader = `${chainToEmoji(BASE_CHAIN)} ${chainToName(BASE_CHAIN)}`

		const groups = [...groupBalancesByChain(balances).values()]

		// Base is the settlement chain and is always listed first.
		const baseGroup = groups.find((group) =>
			group.some((balance) =>
				isBaseChain(currencyToChain(balance.currency)),
			),
		)

		const orderedGroups =
			baseGroup === undefined
				? groups
				: [baseGroup, ...groups.filter((group) => group !== baseGroup)]

		const balanceLines = orderedGroups.flatMap((group) =>
			chainBalanceLines(group),
		)

		const lines: Line[] = [
			FormattedString.b('💼 Wallet'),
			'',
			'Main settlement chain:',
			settlementHeader,
			'',
			'Balances:',
			'',
			...balanceLines,
		]

		const keyboard = new InlineKeyboard()
			.text('Deposit', buildActionData(actionIds.openDeposit, undefined))
			.row()
			.text(
				'Withdraw',
				buildActionData(actionIds.openWithdrawChooseChain, undefined),
			)
			.row()
			.text(
				'Bridge / Swap',
				buildActionData(actionIds.openSwapChooseSrcChain, undefined),
			)
			.row()
			.text(
				'Export Private Key',
				buildActionData(actionIds.openExportKeyWarning, undefined),
			)
			.row()
			.text(
				'Refresh Balances',
				buildActionData(actionIds.openWallet, undefined),
			)
			.row()

		keyboard.appendNavButtons({
			home: actionIds.openHome,
			parent: actionIds.openHome,
		})

		return { message: joinLines(lines), keyboard }
	},
}
