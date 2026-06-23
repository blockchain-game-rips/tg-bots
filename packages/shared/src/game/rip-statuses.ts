import { RipDto } from '@rips/api-client'

type RipStatus = RipDto['status']

export const ACTIVE_STATUSES: RipStatus[] = ['FILLING']
export const DEFINING_PAYOUTS_STATUSES: RipStatus[] = [
	'SEALED',
	'VRF_REQUESTED',
	'CLAIMING',
]
export const REFUNDING_STATUSES: RipStatus[] = ['REFUNDING']
export const CLAIMED_STATUSES: RipStatus[] = ['CLAIMED']
export const REFUNDED_STATUSES: RipStatus[] = ['REFUNDED']

export const ONGOING_STATUSES: RipStatus[] = [
	...ACTIVE_STATUSES,
	...DEFINING_PAYOUTS_STATUSES,
	...REFUNDING_STATUSES,
]

export const COMPLETED_STATUSES: RipStatus[] = [
	...CLAIMED_STATUSES,
	...REFUNDED_STATUSES,
]

export function displayStatus(status: RipStatus): string {
	if (ACTIVE_STATUSES.includes(status)) return 'ACTIVE'
	if (DEFINING_PAYOUTS_STATUSES.includes(status)) return 'DEFINING PAYOUTS'
	if (REFUNDING_STATUSES.includes(status)) return 'REFUNDING'
	if (CLAIMED_STATUSES.includes(status)) return 'FINISHED'
	if (REFUNDED_STATUSES.includes(status)) return 'REFUNDED'
	return status
}
