import { runActionIdsCli } from '@rips/grammy-kit'
import { resolve } from 'node:path'
import { actionDeclarations } from '../src/action-declarations'

runActionIdsCli(
	resolve(__dirname, '..', 'src', 'action-ids.json'),
	Object.keys(actionDeclarations),
)
