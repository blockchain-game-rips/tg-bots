import { PromptContent } from '../types'

export const WithdrawAddressPrompt = {
	render(): PromptContent {
		return {
			message: 'Enter the recipient address',
			placeholder: '0x...',
		}
	},
}
