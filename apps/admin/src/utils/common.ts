export function getAllowedUserIds(): Set<number> {
	const value = process.env['ALLOWED_USER_IDS']

	if (!value) {
		throw new Error('Environment variable ALLOWED_USER_IDS is not set')
	}

	return new Set(value.split(',').map((id) => Number(id.trim())))
}
