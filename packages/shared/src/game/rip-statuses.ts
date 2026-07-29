import { RipDto } from '@rips/api-client'

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
