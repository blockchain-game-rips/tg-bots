import { fmt } from '@rips/grammy-kit'
import { PromptContent } from '../types'

export const WithdrawAddressPrompt = {
	render(): PromptContent {
		return {
			message: fmt`Enter the recipient address`,
			placeholder: '0x...',
		}
	},
}
