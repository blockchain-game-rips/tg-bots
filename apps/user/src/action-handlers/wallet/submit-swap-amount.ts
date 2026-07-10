import { ActionDef, withPayload } from '../../action-def'

export const submitSwapAmount: ActionDef<string> = withPayload(
	(amount) => amount,
	(raw) => raw,
	() => {
		// TODO: swap: implement
		throw new Error('Not implemented')
	},
)
