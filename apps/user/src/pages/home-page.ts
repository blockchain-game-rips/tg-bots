import { CurrencyAmountDtoOutput } from '@rips/api-client'
import {
	buildActionData,
	fmt,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import { formatAmountWithUsd, formatPercent } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../action-ids'
import { PageContent } from '../types'
import * as labels from '../utils/button-labels'

const WELCOME_HEADER = fmt`👋 ${FormattedString.b('Welcome to Rips')}`

interface HomePageArgs {
	unopenedPulls: number
	baseBalance: CurrencyAmountDtoOutput
	referralFee: number
}

function statsLines(args: HomePageArgs): Line[] {
	const lines: Line[] = []

	if (args.unopenedPulls > 0) {
		lines.push(`🎁 Unopened pulls: ${args.unopenedPulls.toString()}`)
	}

	lines.push(`💰 Base balance: ${formatAmountWithUsd(args.baseBalance)}`)
	lines.push(`👥 Referral tier: ${formatPercent(args.referralFee)}`)

	return lines
}

function messageLines(args: HomePageArgs): Line[] {
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
				labels.ENTER_RIPS,
				buildActionData(actionIds.openChoosePreset, undefined),
			)
			.row()
			.text(
				labels.OPEN_PULLS,
				buildActionData(actionIds.openOpenPulls, undefined),
			)
			.row()
			.text(
				labels.MY_RIPS,
				buildActionData(actionIds.openMyRips, undefined),
			)
			.row()
			.text(
				labels.COLLECTION,
				buildActionData(actionIds.openCardCollection, undefined),
			)
			.row()
			.text(
				labels.WALLET,
				buildActionData(actionIds.openWallet, undefined),
			)
			.row()
			.text(
				labels.REFERRALS,
				buildActionData(actionIds.openReferral, undefined),
			)
			.row()
			.text(labels.ABOUT, buildActionData(actionIds.openAbout, undefined))

		return { message: joinLines(lines), keyboard }
	},
}
