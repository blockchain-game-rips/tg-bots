import { writePagesMarkdown } from '@rips/grammy-kit'
import { pages } from './pages'

const GENERATED_FOLDER = './scripts/preview-bot/generated'

writePagesMarkdown(pages, GENERATED_FOLDER)
