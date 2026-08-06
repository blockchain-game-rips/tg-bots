import { RipDtoOutput } from '@rips/api-client'
import { sameEvmAddress } from '../validation/evm-address'

const MILLISECONDS_PER_SECOND = 1000

export function entryCountFor(
	rip: RipDtoOutput,
	userEvmAddress: string,
): number {
	return rip.actions.purchases
		.filter((purchase) =>
			sameEvmAddress(purchase.userAddress, userEvmAddress),
		)
		.reduce((sum, purchase) => sum + purchase.entryCount, 0)
}

export function soldEntriesFor(rip: RipDtoOutput): number {
	return rip.actions.purchases.reduce(
		(sum, purchase) => sum + purchase.entryCount,
		0,
	)
}

export function secondsUntilRipClose(rip: RipDtoOutput): number {
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
	COMPLETING = 'COMPLETING',
	COMPLETED = 'COMPLETED',
	REFUNDING = 'REFUNDING',
	REFUNDED = 'REFUNDED',
}

export function groupRipStatus(status: RipDtoOutput['status']): RipStatusGroup {
	switch (status) {
		case 'FILLING':
			return RipStatusGroup.FILLING
		case 'SEALED':
		case 'VRF_REQUESTED':
		case 'CLAIMING':
		case 'CLAIM_SETTLING':
			return RipStatusGroup.COMPLETING
		case 'CLAIMED':
			return RipStatusGroup.COMPLETED
		case 'REFUNDING':
		case 'REFUND_SETTLING':
			return RipStatusGroup.REFUNDING
		case 'REFUNDED':
			return RipStatusGroup.REFUNDED
	}
}

export const RIP_STATUS_LABEL: Record<RipStatusGroup, string> = {
	[RipStatusGroup.FILLING]: '🟢 Filling',
	[RipStatusGroup.COMPLETING]: '⏳ Completing',
	[RipStatusGroup.COMPLETED]: '✅ Completed',
	[RipStatusGroup.REFUNDING]: '↩️ Refunding',
	[RipStatusGroup.REFUNDED]: '↩️ Refunded',
}

export function isFinalized(status: RipDtoOutput['status']): boolean {
	const group = groupRipStatus(status)

	return (
		group === RipStatusGroup.COMPLETED || group === RipStatusGroup.REFUNDED
	)
}
