import { RoundDto } from '@rips/api-client'

type RoundStatus = RoundDto['status']

export const ACTIVE_STATUSES: RoundStatus[] = ['FILLING']
export const DEFINING_PRIZES_STATUSES: RoundStatus[] = [
	'SEALED',
	'VRF_REQUESTED',
	'CLAIMING',
]
export const REFUNDING_STATUSES: RoundStatus[] = ['REFUNDING']
export const CLAIMED_STATUSES: RoundStatus[] = ['CLAIMED']
export const REFUNDED_STATUSES: RoundStatus[] = ['REFUNDED']

export const ONGOING_STATUSES: RoundStatus[] = [
	...ACTIVE_STATUSES,
	...DEFINING_PRIZES_STATUSES,
	...REFUNDING_STATUSES,
]

export const COMPLETED_STATUSES: RoundStatus[] = [
	...CLAIMED_STATUSES,
	...REFUNDED_STATUSES,
]

export function displayStatus(status: RoundStatus): string {
	if (ACTIVE_STATUSES.includes(status)) return 'ACTIVE'
	if (DEFINING_PRIZES_STATUSES.includes(status)) return 'DEFINING PRIZES'
	if (REFUNDING_STATUSES.includes(status)) return 'REFUNDING'
	if (CLAIMED_STATUSES.includes(status)) return 'FINISHED'
	if (REFUNDED_STATUSES.includes(status)) return 'REFUNDED'
	return status
}
