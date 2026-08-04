import { PageSection, runPreviewBot } from '@rips/grammy-kit'
import { installKeyboardExtensions } from '../../src/utils/keyboard'
import { pages } from './pages'

installKeyboardExtensions()

const sections: PageSection[] = [
	{ title: '🏠 Home', prefixes: ['home', 'about'] },
	{ title: '🃏 Card collection', prefixes: ['card-collection'] },
	{
		title: '🎮 Play',
		prefixes: [
			'enter-',
			'checkout',
			'zap-',
			'status',
			'ongoing-rips',
			'finalized-rips',
			'reveal-',
		],
	},
	{ title: '👛 Wallet', prefixes: ['wallet', 'deposit-'] },
	{ title: '💸 Withdraw', prefixes: ['withdraw'] },
	{ title: '🔄 Swap', prefixes: ['swap-'] },
	{ title: '🤝 Referral', prefixes: ['referral-'] },
]

runPreviewBot(pages, sections)
