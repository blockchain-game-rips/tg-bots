import { AvailablePresetDto } from '@rips/api-client'
import { addNav, buildActionData } from '@rips/grammy-kit'
import { configName, resolveConfig } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

export const BuyChoosePresetPage = {
	render(availablePresets: AvailablePresetDto[]): PageContent {
		const keyboard = new InlineKeyboard()

		for (const availablePreset of availablePresets) {
			const config = resolveConfig(availablePreset)

			keyboard
				.text(
					configName(config),
					buildActionData(
						actionIds.openChooseEntryAmount,
						availablePreset.preset.id,
					),
				)
				.row()
		}

		return {
			message: ['<b>🎮 Buy Entries</b>', '', 'Select a preset:'].join(
				'\n',
			),
			keyboard: addNav(keyboard, {
				home: actionIds.openHome,
				parent: actionIds.openHome,
			}),
		}
	},
}
