import { CurrencyAmountDto } from '@rips/api-client'
import { buildActionData } from '@rips/grammy-kit'
import { formatAmountWithUsd, formatPercent } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../actions'
import { PageContent } from '../types'

const WELCOME_HEADER = '👋 <b>Welcome to Rips</b>'

interface HomePageArgs {
	unopenedPulls: number
	baseBalance: CurrencyAmountDto
	referralFee: number
}

function statsLines(args: HomePageArgs): string[] {
	const lines: string[] = []

	if (args.unopenedPulls > 0) {
		lines.push(`🎁 Unopened pulls: ${args.unopenedPulls.toString()}`)
	}

	lines.push(`💰 Base balance: ${formatAmountWithUsd(args.baseBalance)}`)
	lines.push(`👥 Referral tier: ${formatPercent(args.referralFee)}`)

	return lines
}

function messageLines(args: HomePageArgs): string[] {
	if (args.unopenedPulls > 0) {
		return [
			WELCOME_HEADER,
			'',
			'Your pulls are ready and waiting. Open them to reveal your cards.',
			'',
			...statsLines(args),
		]
	}

	const hasFunds = Number(args.baseBalance.amount) > 0

	if (hasFunds) {
		return [
			WELCOME_HEADER,
			'',
			"You're ready to go. Enter a live Rip to collect cards.",
			'',
			...statsLines(args),
		]
	}

	return [
		WELCOME_HEADER,
		'',
		'Enter live Rips, open your pulls, and collect cards.',
		'',
		'To get started, fund your wallet with ETH on Base.',
	]
}

export const HomePage = {
	render(args: HomePageArgs): PageContent {
		const lines = messageLines(args)

		const keyboard = new InlineKeyboard()
			.text(
				'Buy Entries',
				buildActionData(actionIds.openChoosePreset, undefined),
			)
			.row()
			.text(
				'🎁 Open Pulls',
				buildActionData(actionIds.openOpenPulls, undefined),
			)
			.row()
			.text('Status', buildActionData(actionIds.openStatus, undefined))
			.row()
			.text(
				'Card Collection',
				buildActionData(actionIds.openCardCollection, undefined),
			)
			.text('Wallet', buildActionData(actionIds.openWallet, undefined))
			.row()
			.text(
				'Referral System',
				buildActionData(actionIds.openReferral, undefined),
			)
			.row()
			.text('About', buildActionData(actionIds.openAbout, undefined))

		return { message: lines.join('\n'), keyboard }
	},
}
