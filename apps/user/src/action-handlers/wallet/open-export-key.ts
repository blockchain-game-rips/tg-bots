import { usersControllerExportKey } from '@rips/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { toReset } from '../../flows'
import { ExportKeyPage } from '../../pages/wallet/export-key-page'
import { ExportKeyWarningPage } from '../../pages/wallet/export-key-warning-page'
import { EffectType } from '../../types'

export const openExportKeyWarning: ActionDef<void> = noPayload(() => ({
	flow: toReset(),
	effect: {
		type: EffectType.EDIT,
		page: ExportKeyWarningPage.render(),
	},
}))

export const openExportKey: ActionDef<void> = noPayload(async (session) => {
	const { telegramId } = session

	const { data } = await usersControllerExportKey({ path: { telegramId } })

	return {
		flow: toReset(),
		effect: {
			type: EffectType.EDIT,
			page: ExportKeyPage.render(data.privateKey),
		},
	}
})
