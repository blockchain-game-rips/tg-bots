import {
	AdminWalletResponseDtoOutput,
	GetRipsStateResponseDtoOutput,
} from '@rips/api-client'
import { fmt, FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { actionIds } from '../action-ids'
import { EIP155_NAMESPACE } from '../constants'
import { PageContent } from '../types'
import { keyboardFromLayout } from '../utils/keyboard'

export const HomePage = {
	render(
		state: GetRipsStateResponseDtoOutput,
		adminWallet: AdminWalletResponseDtoOutput,
	): PageContent {
		const statusLine = state.isPaused
			? fmt`⏸ ${FormattedString.b('PAUSED')}`
			: fmt`▶ ${FormattedString.b('RUNNING')}`

		const evmAddress =
			adminWallet.wallet.namespaceToAddress[EIP155_NAMESPACE] ?? ''
		const balanceDisplay = formatAmountWithUsd(adminWallet.balance)

		const lines: Line[] = [
			fmt`${FormattedString.b('Rips Admin')}  ${statusLine}`,
			fmt`Admin: ${FormattedString.code(evmAddress)}`,
			`Balance: ${balanceDisplay}`,
		]

		return {
			message: joinLines(lines),
			keyboard: keyboardFromLayout([
				[{ label: 'State', actionId: actionIds.openState }],
				[
					{ label: 'Pause', actionId: actionIds.openConfirmPause },
					{
						label: 'Unpause',
						actionId: actionIds.openConfirmUnpause,
					},
				],
				[
					{
						label: 'Set Default Fee',
						actionId: actionIds.openSetDefaultFee,
					},
				],
				[
					{
						label: 'Freeze Referrer',
						actionId: actionIds.openFreezeReferrer,
					},
					{
						label: 'Unfreeze Referrer',
						actionId: actionIds.openUnfreezeReferrer,
					},
				],
				[
					{
						label: 'Set Tiers',
						actionId: actionIds.openSetTiers,
					},
				],
				[
					{
						label: 'Update Preset Config',
						actionId: actionIds.openUpdatePresetConfig,
					},
				],
				[
					{
						label: 'Blocked Countries',
						actionId: actionIds.openSetBlockedCountries,
					},
					{
						label: 'Upload Terms',
						actionId: actionIds.openUploadTerms,
					},
				],
			]),
		}
	},
}
