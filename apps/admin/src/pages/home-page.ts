import {
	AdminWalletResponseDtoOutput,
	GetRipsStateResponseDtoOutput,
} from '../../generated/api-client'
import { actionIds } from '../actions'
import { EIP155_NAMESPACE } from '../constants'
import { PageContent } from '../types'
import { formatAmountWithUsd } from '../utils/currency'
import { keyboardFromLayout } from '../utils/keyboard'

export class HomePage {
	static render(
		state: GetRipsStateResponseDtoOutput,
		adminWallet: AdminWalletResponseDtoOutput,
	): PageContent {
		const statusLine = state.isPaused
			? '⏸ <b>PAUSED</b>'
			: '▶ <b>RUNNING</b>'

		const evmAddress =
			adminWallet.wallet.namespaceToAddress[EIP155_NAMESPACE]
		const balanceDisplay = formatAmountWithUsd(adminWallet.balance)

		const lines = [
			`<b>Rips Admin</b>  ${statusLine}`,
			`Admin: <code>${evmAddress}</code>`,
			`Balance: ${balanceDisplay}`,
		]

		return {
			message: lines.join('\n'),
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
			]),
		}
	}
}
