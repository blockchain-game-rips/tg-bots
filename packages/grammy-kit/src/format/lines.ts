import { FormattedString } from '@grammyjs/parse-mode'
import { Line } from '../types'

export function joinLines(lines: Line[]): FormattedString {
	return FormattedString.join(lines, '\n')
}
