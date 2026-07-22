import { FormattedString } from '@rips/grammy-kit'

export function breadcrumb(
	prefix: string,
	...segments: (string | undefined)[]
): FormattedString {
	const parts = [prefix, ...segments.filter((s) => s !== undefined)]
	return FormattedString.b(parts.join(' › '))
}
