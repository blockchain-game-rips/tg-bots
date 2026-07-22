import { fmt } from '@rips/grammy-kit'
import { PromptContent } from '../types'

export const ImportKeyPrompt = {
	render(): PromptContent {
		return {
			message: fmt`Paste your private key.\n\n⚠️ This is permanent and can’t be changed later.`,
			placeholder: '0x...',
		}
	},
}
