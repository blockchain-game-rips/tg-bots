import { z } from 'zod'
import { SwapSelecting } from '../flows'
import { parsePayload } from './parse-payload'

const swapSelectingSchema = z.enum(['in', 'out'])

export function parseSwapSelecting(raw: string): SwapSelecting {
	return parsePayload(raw, swapSelectingSchema, 'Invalid swap selecting')
}
