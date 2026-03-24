import { ZodType } from 'zod'
import { getEnvSafe } from '../utils/common'

const BASE_URL = getEnvSafe('BACKEND_URL')

export class ApiError extends Error {
	constructor(
		public readonly status: number,
		message: string,
	) {
		super(message)
		this.name = 'ApiError'
	}
}

export async function apiFetch<T>(
	path: string,
	schema: ZodType<T>,
	init?: RequestInit,
): Promise<T> {
	const res = await fetch(`${BASE_URL}${path}`, {
		headers: { 'Content-Type': 'application/json' },
		...init,
	})

	if (!res.ok) {
		throw new ApiError(res.status, await res.text())
	}

	return schema.parse(await res.json())
}
