import { runPreviewBot } from '@rips/grammy-kit'
import { installKeyboardExtensions } from '../../src/utils/keyboard'
import { pages } from './pages'

installKeyboardExtensions()

runPreviewBot(pages)
