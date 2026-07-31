import { FormattedString, Line } from '@rips/grammy-kit'

export function row(label: string, value: Line): Line[] {
	return ['', FormattedString.b(`${label}:`), value]
}
