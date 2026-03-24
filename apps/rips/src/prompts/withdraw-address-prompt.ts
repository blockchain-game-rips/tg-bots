import { PromptContent } from '../types'

export class WithdrawAddressPrompt {
	static render(): PromptContent {
		return {
			message: 'Enter the recipient address',
			placeholder: '0x...',
		}
	}
}
