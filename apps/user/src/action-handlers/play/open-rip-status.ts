import { parseRipId } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'

export const openRipStatus: ActionDef<number> = withPayload(
	{
		encode: (ripId) => ripId.toString(),
		decode: (raw) => parseRipId(raw),
	},
	() => {
		throw new Error('TODO: implement')
	},
)
