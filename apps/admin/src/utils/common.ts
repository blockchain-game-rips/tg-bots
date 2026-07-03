import { getEnvSafe } from '@rips/grammy-kit'

export function getAllowedUserIds(): Set<number> {
	const value = getEnvSafe('ALLOWED_USER_IDS')

	return new Set(value.split(',').map((id) => Number(id.trim())))
}
