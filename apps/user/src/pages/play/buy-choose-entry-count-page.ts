import { AvailablePresetDto } from '@rips/api-client'
import { addNav, buildActionData } from '@rips/grammy-kit'
import { configName, resolveConfig } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

export const BuyChooseEntryCountPage = {
	render(availablePreset: AvailablePresetDto): PageContent {
		const config = resolveConfig(availablePreset)

		const keyboard = new InlineKeyboard()
			.text('1 Entry', buildActionData(actionIds.openBuyCheckout, 1))
			.row()
			.text('3 Entries', buildActionData(actionIds.openBuyCheckout, 3))
			.row()
			.text(
				'Custom Amount',
				buildActionData(actionIds.promptEntryCount, undefined),
			)

		return {
			message: [
				'<b>🎮 Enter Rip</b>',
				'',
				`Preset: ${configName(config)}`,
				'',
				'Select entry count:',
			].join('\n'),
			keyboard: addNav(keyboard, {
				home: actionIds.openHome,
				parent: actionIds.openChoosePreset,
			}),
		}
	},
}
