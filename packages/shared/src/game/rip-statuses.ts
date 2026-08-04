import { RipDto } from '@rips/api-client'
import { sameEvmAddress } from '../validation/evm-address'

const MILLISECONDS_PER_SECOND = 1000

export function entryCountFor(rip: RipDto, userEvmAddress: string): number {
	return rip.actions.purchases
		.filter((purchase) =>
			sameEvmAddress(purchase.userAddress, userEvmAddress),
		)
		.reduce((sum, purchase) => sum + purchase.entryCount, 0)
}

export function secondsUntilRipClose(rip: RipDto): number {
	const closesAt =
		new Date(rip.startTime).getTime() +
		rip.config.durationSeconds * MILLISECONDS_PER_SECOND

	const secondsLeft = Math.floor(
		(closesAt - Date.now()) / MILLISECONDS_PER_SECOND,
	)

	return Math.max(0, secondsLeft)
}

export enum RipStatusGroup {
	FILLING = 'FILLING',
	FINALIZING = 'FINALIZING',
	FINALIZED = 'FINALIZED',
	REFUNDING = 'REFUNDING',
	REFUNDED = 'REFUNDED',
}

export function groupRipStatus(status: RipDto['status']): RipStatusGroup {
	switch (status) {
		case 'FILLING':
			return RipStatusGroup.FILLING
		case 'SEALED':
		case 'VRF_REQUESTED':
		case 'CLAIMING':
			return RipStatusGroup.FINALIZING
		case 'CLAIMED':
			return RipStatusGroup.FINALIZED
		case 'REFUNDING':
			return RipStatusGroup.REFUNDING
		case 'REFUNDED':
			return RipStatusGroup.REFUNDED
	}
}
