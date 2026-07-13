import { ActionDef, withPayload } from '../../action-def'
import { rawStringCodec } from '../../utils/codecs'

export const submitSwapAmount: ActionDef<string> = withPayload(
	rawStringCodec,
	() => {
		// TODO: swap: implement
		throw new Error('Not implemented')
	},
)
