import {
	createQuerySerializer,
	ripsControllerGetPresets,
	RipsControllerGetPresetsResponse,
	walletsControllerGetBalances,
} from '@rips/api-client'
import { getEnvSafe, toCurrencyId } from '@rips/shared'
import { NATIVE_ON_BASE } from '../constants'

export async function fetchNativeBalance(telegramId: string) {
	const { data } = await walletsControllerGetBalances({
		headers: { 'x-telegram-id': telegramId },
		query: { chainAddress: [toCurrencyId(NATIVE_ON_BASE)] },
		querySerializer: createQuerySerializer({ allowReserved: true }),
	})

	const balance = data.balances[0]

	if (balance === undefined) {
		throw new Error('No balance found for native asset')
	}

	return balance
}

export async function fetchPreset(
	presetId: number,
): Promise<RipsControllerGetPresetsResponse['availablePresets'][number]> {
	const { data } = await ripsControllerGetPresets()

	const preset = data.availablePresets.find((s) => s.preset.id === presetId)

	if (preset === undefined) {
		throw new Error(`Preset with id ${String(presetId)} not found`)
	}

	return preset
}

const adminApiKey = getEnvSafe('ADMIN_API_KEY')

export const adminApiHeader = {
	'x-admin-api-key': adminApiKey,
}
