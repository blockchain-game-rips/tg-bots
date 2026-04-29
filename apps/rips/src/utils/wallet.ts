import { UserDtoOutput } from '../../generated/api-client'
import { EIP155_NAMESPACE } from '../constants'

export function evmAddressFromUser(user: UserDtoOutput) {
	const userEvmAddress = user.wallets[EIP155_NAMESPACE]

	if (userEvmAddress === undefined) {
		throw new Error('User has no EVM wallet')
	}

	return userEvmAddress
}
