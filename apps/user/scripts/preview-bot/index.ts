import { PageSection, runPreviewBot } from '@rips/grammy-kit'
import { setSupportedCurrencies } from '../../src/supported-currencies'
import { installKeyboardExtensions } from '../../src/utils/keyboard'
import { pages } from './pages'
import { PREVIEW_CURRENCIES } from './static-data'

installKeyboardExtensions()

setSupportedCurrencies(PREVIEW_CURRENCIES)

const sections: PageSection[] = [
	{ title: '👋 Onboarding', prefixes: ['onboarding-'] },
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
