import {
	AvailablePresetDtoOutput,
	BuyEntriesPurchaseResponseDtoOutput,
	BuyEntriesZapResponseDtoOutput,
	ConfigDtoOutput,
	CurrencyAmountDtoOutput,
	GetCardCollectionResponseDtoOutput,
	GetCardDefinitionsResponseDtoOutput,
	GetReferrerResponseDtoOutput,
	GetSwapResultResponseDtoOutput,
	GetTierTablesResponseDtoOutput,
	GetZapResultResponseDtoOutput,
	PayoutDtoOutput,
	QuotePurchaseResponseDtoOutput,
	QuoteSwapResponseDtoOutput,
	QuoteSwapSamechainResponseDtoOutput,
	QuoteWithdrawRewardResponseDtoOutput,
	QuoteZapResponseDtoOutput,
	QuoteZapSamechainResponseDtoOutput,
	RipDtoOutput,
	SwapResponseDtoOutput,
	SwapSamechainResponseDtoOutput,
	TransactionDtoOutput,
	WithdrawRewardResponseDtoOutput,
} from '@rips/api-client'

const mockChainAddress = {
	address: '0x0000000000000000000000000000000000000000',
	chain: { reference: '8453', namespace: 'eip155' },
}

const mockEth: ConfigDtoOutput['entryPrice']['currency'] = {
	id: 'eip155:8453:0x0000000000000000000000000000000000000000',
	priceUsd: 2500,
	chainAddress: mockChainAddress,
	symbol: 'ETH',
	name: 'Ethereum',
	decimals: 18,
}

const mockArbChainAddress = {
	address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
	chain: { reference: '42161', namespace: 'eip155' },
}

const mockArbNativeChainAddress = {
	address: '0x0000000000000000000000000000000000000000',
	chain: { reference: '42161', namespace: 'eip155' },
}

export const mockUsdcArb: ConfigDtoOutput['entryPrice']['currency'] = {
	id: 'eip155:42161:0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
	priceUsd: 1,
	chainAddress: mockArbChainAddress,
	symbol: 'USDC',
	name: 'USD Coin',
	decimals: 6,
}

export const mockEthArb: ConfigDtoOutput['entryPrice']['currency'] = {
	id: 'eip155:42161:0x0000000000000000000000000000000000000000',
	priceUsd: 2500,
	chainAddress: mockArbNativeChainAddress,
	symbol: 'ETH',
	name: 'Ethereum',
	decimals: 18,
}

export const mockUsdcArbBalance: CurrencyAmountDtoOutput = {
	currency: mockUsdcArb,
	amount: '100000000', // 100 USDC
}

export const mockUsdcArbBalanceEmpty: CurrencyAmountDtoOutput = {
	currency: mockUsdcArb,
	amount: '0',
}

export const mockUsdcArbWithdrawAmount: CurrencyAmountDtoOutput = {
	currency: mockUsdcArb,
	amount: '25000000', // 25 USDC
}

export const mockUsdcArbWithdrawAmountInsufficient: CurrencyAmountDtoOutput = {
	currency: mockUsdcArb,
	amount: '200000000', // 200 USDC (exceeds balance)
}

export const mockEthArbBalance: CurrencyAmountDtoOutput = {
	currency: mockEthArb,
	amount: '1000000000000000', // 0.001 ETH
}

export const mockEthArbBalanceInsufficient: CurrencyAmountDtoOutput = {
	currency: mockEthArb,
	amount: '0', // no ETH for gas
}

export const mockEthArbBalanceSufficient: CurrencyAmountDtoOutput = {
	currency: mockEthArb,
	amount: '100000000000000000', // 0.1 ETH, covers bridge + network fee
}

export const mockEthArbNetworkFee: CurrencyAmountDtoOutput = {
	currency: mockEthArb,
	amount: '210000000000000', // ~0.00021 ETH
}

const mockOptimismNativeChainAddress = {
	address: '0x0000000000000000000000000000000000000000',
	chain: { reference: '10', namespace: 'eip155' },
}

export const mockEthOptimism: ConfigDtoOutput['entryPrice']['currency'] = {
	id: 'eip155:10:0x0000000000000000000000000000000000000000',
	priceUsd: 2500,
	chainAddress: mockOptimismNativeChainAddress,
	symbol: 'ETH',
	name: 'Ethereum',
	decimals: 18,
}

export const mockEthOptimismBalance: CurrencyAmountDtoOutput = {
	currency: mockEthOptimism,
	amount: '100000000000000000', // 0.1 ETH
}

export const mockCardCollection: GetCardCollectionResponseDtoOutput = {
	tiers: [
		[],
		[
			{
				card: {
					id: 10,
					name: 'Mini Whale',
					tier: 1,
					imageUrl:
						'https://non-existing-rip-url.com/100_common_mini-whale.png',
				},
				count: 1,
			},
			{
				card: {
					id: 11,
					name: 'Queue Priest',
					tier: 1,
					imageUrl:
						'https://non-existing-rip-url.com/101_common_queue-priest.png',
				},
				count: 1,
			},
			{
				card: {
					id: 116,
					name: 'Street Ape',
					tier: 1,
					imageUrl:
						'https://non-existing-rip-url.com/64_common_street-ape.png',
				},
				count: 1,
			},
		],
		[],
		[],
		[],
		[],
		[
			{
				card: {
					id: 0,
					name: 'Kendu Attitude',
					tier: 6,
					imageUrl:
						'https://non-existing-rip-url.com/00_mythic_kendu_attitude.png',
				},
				count: 1,
			},
		],
	],
}

export const mockCardDefinitions: GetCardDefinitionsResponseDtoOutput = {
	tiers: [
		[
			{
				id: 12,
				name: 'Dust Runner',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/102_dust_dust-runner.png',
			},
			{
				id: 13,
				name: 'Bent Coin Kid',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/103_dust_bent-coin-kid.png',
			},
			{
				id: 14,
				name: 'Scrap Toad',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/104_dust_scrap-toad.png',
			},
			{
				id: 15,
				name: 'Wire Rat',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/105_dust_wire-rat.png',
			},
			{
				id: 16,
				name: 'Rust Clerk',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/106_dust_rust-clerk.png',
			},
			{
				id: 17,
				name: 'Tin Hound',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/107_dust_tin-hound.png',
			},
			{
				id: 18,
				name: 'Ash Boy',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/108_dust_ash-boy.png',
			},
			{
				id: 19,
				name: 'Glow Moth',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/109_dust_glow-moth.png',
			},
			{
				id: 21,
				name: 'Crate Mouse',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/110_dust_crate-mouse.png',
			},
			{
				id: 22,
				name: 'Patch Nun',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/111_dust_patch-nun.png',
			},
			{
				id: 23,
				name: 'Brick Runner',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/112_dust_brick-runner.png',
			},
			{
				id: 24,
				name: 'Cable Fisher',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/113_dust_cable-fisher.png',
			},
			{
				id: 25,
				name: 'Boiler Imp',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/114_dust_boiler-imp.png',
			},
			{
				id: 26,
				name: 'Tagger Sprite',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/115_dust_tagger-sprite.png',
			},
			{
				id: 27,
				name: 'Lock Page',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/116_dust_lock-page.png',
			},
			{
				id: 28,
				name: 'Queue Ghost',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/117_dust_queue-ghost.png',
			},
			{
				id: 29,
				name: 'Lowline Bat',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/118_dust_lowline-bat.png',
			},
			{
				id: 30,
				name: 'Paper Jackal',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/119_dust_paper-jackal.png',
			},
			{
				id: 32,
				name: 'Relay Boy',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/120_dust_relay-boy.png',
			},
			{
				id: 33,
				name: 'Rust Monk',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/121_dust_rust-monk.png',
			},
			{
				id: 34,
				name: 'Soot Peddler',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/122_dust_soot-peddler.png',
			},
			{
				id: 35,
				name: 'Tin Crow',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/123_dust_tin-crow.png',
			},
			{
				id: 36,
				name: 'Chain Pup',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/124_dust_chain-pup.png',
			},
			{
				id: 37,
				name: 'Neon Minnow',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/125_dust_neon-minnow.png',
			},
			{
				id: 38,
				name: 'Patch Prophet',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/126_dust_patch-prophet.png',
			},
			{
				id: 39,
				name: 'Stub Horn',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/127_dust_stub-horn.png',
			},
			{
				id: 40,
				name: 'Gray Fang',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/128_dust_gray-fang.png',
			},
			{
				id: 41,
				name: 'Coin Picker',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/129_dust_coin-picker.png',
			},
			{
				id: 43,
				name: 'Drain Fox',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/130_dust_drain-fox.png',
			},
			{
				id: 44,
				name: 'Lantern Page',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/131_dust_lantern-page.png',
			},
			{
				id: 45,
				name: 'Spare Parts Saint',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/132_dust_spare-parts-saint.png',
			},
			{
				id: 46,
				name: 'Gutter Knight',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/133_dust_gutter-knight.png',
			},
			{
				id: 47,
				name: 'Chalk Witch',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/134_dust_chalk-witch.png',
			},
			{
				id: 48,
				name: 'Rattle Hound',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/135_dust_rattle-hound.png',
			},
			{
				id: 49,
				name: 'Tin Ape',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/136_dust_tin-ape.png',
			},
			{
				id: 50,
				name: 'Heat Runner',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/137_dust_heat-runner.png',
			},
			{
				id: 51,
				name: 'Scrap Falcon',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/138_dust_scrap-falcon.png',
			},
			{
				id: 52,
				name: 'Blink Tailor',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/139_dust_blink-tailor.png',
			},
			{
				id: 54,
				name: 'Mud Toad Baronet',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/140_dust_mud-toad-baronet.png',
			},
			{
				id: 55,
				name: 'Ridge Scout',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/141_dust_ridge-scout.png',
			},
			{
				id: 56,
				name: 'Blue Static Kid',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/142_dust_blue-static-kid.png',
			},
			{
				id: 57,
				name: 'Vault Sweeper',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/143_dust_vault-sweeper.png',
			},
			{
				id: 58,
				name: 'Shiver Bat',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/144_dust_shiver-bat.png',
			},
			{
				id: 59,
				name: 'Glitch Tadpole',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/145_dust_glitch-tadpole.png',
			},
			{
				id: 60,
				name: 'Last Ticket',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/146_dust_last-ticket.png',
			},
			{
				id: 61,
				name: 'The Lurker',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/147_dust_the-lurker.png',
			},
			{
				id: 62,
				name: 'The Doubter',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/148_dust_the-doubter.png',
			},
			{
				id: 63,
				name: 'The Hopium Kid',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/149_dust_the-hopium-kid.png',
			},
			{
				id: 65,
				name: 'The Tiny Jeet',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/150_dust_the-tiny-jeet.png',
			},
			{
				id: 66,
				name: 'Broke Oracle',
				tier: 0,
				imageUrl:
					'https://non-existing-rip-url.com/151_dust_broke-oracle.png',
			},
		],
		[
			{
				id: 10,
				name: 'Mini Whale',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/100_common_mini-whale.png',
			},
			{
				id: 11,
				name: 'Queue Priest',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/101_common_queue-priest.png',
			},
			{
				id: 116,
				name: 'Street Ape',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/64_common_street-ape.png',
			},
			{
				id: 117,
				name: 'The Punter',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/65_common_the-punter.png',
			},
			{
				id: 118,
				name: 'Bolt Runner',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/66_common_bolt-runner.png',
			},
			{
				id: 119,
				name: 'Lantern Clerk',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/67_common_lantern-clerk.png',
			},
			{
				id: 120,
				name: 'Garage Knight',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/68_common_garage-knight.png',
			},
			{
				id: 121,
				name: 'Dock Jackal',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/69_common_dock-jackal.png',
			},
			{
				id: 122,
				name: 'Coin Sweeper',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/70_common_coin-sweeper.png',
			},
			{
				id: 123,
				name: 'Curb Witch',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/71_common_curb-witch.png',
			},
			{
				id: 124,
				name: 'Rooftop Pigeon',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/72_common_rooftop-pigeon.png',
			},
			{
				id: 125,
				name: 'Shift Brawler',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/73_common_shift-brawler.png',
			},
			{
				id: 126,
				name: 'Token Cook',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/74_common_token-cook.png',
			},
			{
				id: 127,
				name: 'Blue Visor Kid',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/75_common_blue-visor-kid.png',
			},
			{
				id: 128,
				name: 'Tunnel Rat',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/76_common_tunnel-rat.png',
			},
			{
				id: 129,
				name: 'Signal Page',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/77_common_signal-page.png',
			},
			{
				id: 130,
				name: 'Patch Fox',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/78_common_patch-fox.png',
			},
			{
				id: 131,
				name: 'Chain Porter',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/79_common_chain-porter.png',
			},
			{
				id: 132,
				name: 'Glow Barber',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/80_common_glow-barber.png',
			},
			{
				id: 133,
				name: 'Neon Fisher',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/81_common_neon-fisher.png',
			},
			{
				id: 134,
				name: 'Ash Mechanic',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/82_common_ash-mechanic.png',
			},
			{
				id: 135,
				name: 'Wheel Monk',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/83_common_wheel_monk.png',
			},
			{
				id: 136,
				name: 'Rips Fanatic',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/84_common_rips-fanatic.png',
			},
			{
				id: 137,
				name: 'Lowline Archer',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/85_common_lowline-archer.png',
			},
			{
				id: 138,
				name: 'Relay Nurse',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/86_common_relay-nurse.png',
			},
			{
				id: 139,
				name: 'Booth Dealer',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/87_common_booth-dealer.png',
			},
			{
				id: 140,
				name: 'Moon Vendor',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/88_common_moon-vendor.png',
			},
			{
				id: 141,
				name: 'Tin Toad',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/89_common_tin-toad.png',
			},
			{
				id: 142,
				name: 'Circuit Drummer',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/90_common_circuit-drummer.png',
			},
			{
				id: 143,
				name: 'Bridge Scout',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/91_common_bridge_scout.png',
			},
			{
				id: 144,
				name: 'Badge Guard',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/92_common_badge-guard.png',
			},
			{
				id: 145,
				name: 'Crate Rogue',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/93_common_crate-rogue.png',
			},
			{
				id: 146,
				name: 'Wire Tailor',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/94_common_wire-tailor.png',
			},
			{
				id: 147,
				name: 'Glass Sweeper',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/95_common_glass-sweeper.png',
			},
			{
				id: 148,
				name: 'Brick Saint',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/96_common_brick-saint.png',
			},
			{
				id: 149,
				name: 'Yard Hound',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/97_common_yard-hound.png',
			},
			{
				id: 150,
				name: 'Static Busker',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/98_common_static-busker.png',
			},
			{
				id: 151,
				name: 'Dip Scout',
				tier: 1,
				imageUrl:
					'https://non-existing-rip-url.com/99_common_dip_scout.png',
			},
		],
		[
			{
				id: 92,
				name: 'The Ape',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/40_spark_the-ape.png',
			},
			{
				id: 93,
				name: 'Degen Scout',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/41_spark_degen-scout.png',
			},
			{
				id: 94,
				name: 'Rally Herald',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/42_spark_rally-herald.png',
			},
			{
				id: 95,
				name: 'Coin Juggler',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/43_spark_coin-juggler.png',
			},
			{
				id: 96,
				name: 'Quickhand Minter',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/44_spark_quickhand-minter.png',
			},
			{
				id: 97,
				name: 'Arc Hoodie',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/45_spark_arc-hoodie.png',
			},
			{
				id: 98,
				name: 'Lucky Mechanic',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/46_spark_lucky-mechanic.png',
			},
			{
				id: 99,
				name: 'Pulse Skater',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/47_spark_pulse-skater.png',
			},
			{
				id: 100,
				name: 'Byte Brawler',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/48_spark_byte-brawler.png',
			},
			{
				id: 101,
				name: 'Dust Viper',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/49_spark_dust-viper.png',
			},
			{
				id: 102,
				name: 'Meme Scribe',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/50_spark_meme-scribe.png',
			},
			{
				id: 103,
				name: 'Prism Pickpocket',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/51_spark_prism-pickpocket.png',
			},
			{
				id: 104,
				name: 'Token Tinkerer',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/52_spark_token-tinkerer.png',
			},
			{
				id: 105,
				name: 'Sidechain Ronin',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/53_spark_sidechain-ronin.png',
			},
			{
				id: 106,
				name: 'Drift Nun',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/54_spark_drift-nun.png',
			},
			{
				id: 107,
				name: 'Glow Rat Prince',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/55_spark_glow-rat-prince.png',
			},
			{
				id: 108,
				name: 'Grid Hound Handler',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/56_spark_grid-hound-handler.png',
			},
			{
				id: 109,
				name: 'Grease Monk',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/57_spark_grease-monk.png',
			},
			{
				id: 110,
				name: 'Scrap Oracle',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/58_spark_scrap-oracle.png',
			},
			{
				id: 111,
				name: 'Rips Courier',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/59_spark_rips-courier.png',
			},
			{
				id: 112,
				name: 'Blip Racer',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/60_spark_blip-racer.png',
			},
			{
				id: 113,
				name: 'Flicker Witch',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/61_spark_flicker-witch.png',
			},
			{
				id: 114,
				name: 'Backline Sniper',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/62_spark_backline-sniper.png',
			},
			{
				id: 115,
				name: 'Patchwork Bruiser',
				tier: 2,
				imageUrl:
					'https://non-existing-rip-url.com/63_spark_patchwork-bruiser.png',
			},
		],
		[
			{
				id: 76,
				name: 'Floor Sweeper',
				tier: 3,
				imageUrl:
					'https://non-existing-rip-url.com/24_rare_floor_sweeper.png',
			},
			{
				id: 77,
				name: 'Gas Wizard',
				tier: 3,
				imageUrl:
					'https://non-existing-rip-url.com/25_rare_gas-wizard.png',
			},
			{
				id: 78,
				name: 'Chart Reader',
				tier: 3,
				imageUrl:
					'https://non-existing-rip-url.com/26_rare_chart-reader.png',
			},
			{
				id: 79,
				name: 'The Rotator',
				tier: 3,
				imageUrl:
					'https://non-existing-rip-url.com/27_rare_the-rotator.png',
			},
			{
				id: 80,
				name: 'The Sniper',
				tier: 3,
				imageUrl:
					'https://non-existing-rip-url.com/28_rare_the_sniper.png',
			},
			{
				id: 81,
				name: 'Last Buyer',
				tier: 3,
				imageUrl:
					'https://non-existing-rip-url.com/29_rare_last_buyer.png',
			},
			{
				id: 82,
				name: 'The Convictionist',
				tier: 3,
				imageUrl:
					'https://non-existing-rip-url.com/30_rare_the-convictionist.png',
			},
			{
				id: 83,
				name: 'The Validator',
				tier: 3,
				imageUrl:
					'https://non-existing-rip-url.com/31_rare_the-validator.png',
			},
			{
				id: 84,
				name: 'Signal Hunter',
				tier: 3,
				imageUrl:
					'https://non-existing-rip-url.com/32_rare_signal-hunter.png',
			},
			{
				id: 85,
				name: 'Cinder Broker',
				tier: 3,
				imageUrl:
					'https://non-existing-rip-url.com/33_rare_cinder-broker.png',
			},
			{
				id: 86,
				name: 'Neon Bull Herald',
				tier: 3,
				imageUrl:
					'https://non-existing-rip-url.com/34_rare_neon_bull_herald.png',
			},
			{
				id: 87,
				name: 'Ash Bear Herald',
				tier: 3,
				imageUrl:
					'https://non-existing-rip-url.com/35_rare_ash-bear-herald.png',
			},
			{
				id: 88,
				name: 'Fomo Saint',
				tier: 3,
				imageUrl:
					'https://non-existing-rip-url.com/36_rare_fomo-saint.png',
			},
			{
				id: 89,
				name: 'Wire Fox Adept',
				tier: 3,
				imageUrl:
					'https://non-existing-rip-url.com/37_rare_wire-fox-adept.png',
			},
			{
				id: 90,
				name: 'Rune Boxer',
				tier: 3,
				imageUrl:
					'https://non-existing-rip-url.com/38_rare_rune-boxer.png',
			},
			{
				id: 91,
				name: 'Terminal Knight',
				tier: 3,
				imageUrl:
					'https://non-existing-rip-url.com/39_rare_terminal-knight.png',
			},
		],
		[
			{
				id: 64,
				name: 'The Degenerate',
				tier: 4,
				imageUrl:
					'https://non-existing-rip-url.com/14_epic_the-degenerate.png',
			},
			{
				id: 67,
				name: 'The Moonboy',
				tier: 4,
				imageUrl:
					'https://non-existing-rip-url.com/15_epic_the-moonboy.png',
			},
			{
				id: 68,
				name: 'Bagholder',
				tier: 4,
				imageUrl:
					'https://non-existing-rip-url.com/16_epic_bagholder.png',
			},
			{
				id: 69,
				name: 'The Jeet',
				tier: 4,
				imageUrl:
					'https://non-existing-rip-url.com/17_epic_the-jeet.png',
			},
			{
				id: 70,
				name: 'Rug Seer',
				tier: 4,
				imageUrl:
					'https://non-existing-rip-url.com/18_epic_rug-seer.png',
			},
			{
				id: 71,
				name: 'The Shill King',
				tier: 4,
				imageUrl:
					'https://non-existing-rip-url.com/19_epic_the-shill-king.png',
			},
			{
				id: 72,
				name: 'The Dip Buyer',
				tier: 4,
				imageUrl:
					'https://non-existing-rip-url.com/20_epic_the-dip-buyer.png',
			},
			{
				id: 73,
				name: 'Paper Hands',
				tier: 4,
				imageUrl:
					'https://non-existing-rip-url.com/21_epic_paper-hands.png',
			},
			{
				id: 74,
				name: 'The Insider',
				tier: 4,
				imageUrl:
					'https://non-existing-rip-url.com/22_epic_the-insider.png',
			},
			{
				id: 75,
				name: 'Copelord',
				tier: 4,
				imageUrl:
					'https://non-existing-rip-url.com/23_epic_copelord.png',
			},
		],
		[
			{
				id: 6,
				name: 'The Gambler',
				tier: 5,
				imageUrl:
					'https://non-existing-rip-url.com/06_legendary_the_gambler.png',
			},
			{
				id: 7,
				name: 'The High Roller',
				tier: 5,
				imageUrl:
					'https://non-existing-rip-url.com/07_legendary_the_high_roller.png',
			},
			{
				id: 8,
				name: 'Diamond Hands',
				tier: 5,
				imageUrl:
					'https://non-existing-rip-url.com/08_legendary_diamond-hands.png',
			},
			{
				id: 9,
				name: 'The Whale',
				tier: 5,
				imageUrl:
					'https://non-existing-rip-url.com/09_legendary_the_whale.png',
			},
			{
				id: 20,
				name: 'Exit Liquidity',
				tier: 5,
				imageUrl:
					'https://non-existing-rip-url.com/10_legendary_exit-liquidity.png',
			},
			{
				id: 31,
				name: 'Leverage Saint',
				tier: 5,
				imageUrl:
					'https://non-existing-rip-url.com/11_legendary_leverage-saint.png',
			},
			{
				id: 42,
				name: 'Vault Empress',
				tier: 5,
				imageUrl:
					'https://non-existing-rip-url.com/12_legendary_vault_empress.png',
			},
			{
				id: 53,
				name: 'Blind Ape',
				tier: 5,
				imageUrl:
					'https://non-existing-rip-url.com/13_legendary_blind-ape.png',
			},
		],
		[
			{
				id: 0,
				name: 'Kendu Attitude',
				tier: 6,
				imageUrl:
					'https://non-existing-rip-url.com/00_mythic_kendu_attitude.png',
			},
			{
				id: 1,
				name: 'The Goldrunner',
				tier: 6,
				imageUrl:
					'https://non-existing-rip-url.com/01_mythic_the-goldrunner.png',
			},
			{
				id: 2,
				name: 'Moon Saint',
				tier: 6,
				imageUrl:
					'https://non-existing-rip-url.com/02_mythic_moon_saint.png',
			},
			{
				id: 3,
				name: 'The First Miner',
				tier: 6,
				imageUrl:
					'https://non-existing-rip-url.com/03_mythic_the_first_miner.png',
			},
			{
				id: 4,
				name: 'The Green Prince',
				tier: 6,
				imageUrl:
					'https://non-existing-rip-url.com/04_mythic_the_green_prince.png',
			},
			{
				id: 5,
				name: 'The Whale King',
				tier: 6,
				imageUrl:
					'https://non-existing-rip-url.com/05_mythic_the_whale_king.png',
			},
		],
	],
}

export const mockUsdcOnBase = {
	id: 'eip155:8453:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
	priceUsd: 1,
	chainAddress: {
		address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
		chain: { namespace: 'eip155', reference: '8453' },
	},
	symbol: 'USDC',
	name: 'USD Coin',
	decimals: 6,
}

const mockSwapAmountOut: CurrencyAmountDtoOutput = {
	currency: mockUsdcOnBase,
	amount: '24900000', // ~24.9 USDC on Base
}

const mockSwapBridgeFee: CurrencyAmountDtoOutput = {
	currency: mockEthArb,
	amount: '1000000000000000', // 0.001 ETH
}

const SWAP_DURATION_MS = 6000

export const mockSwapCrosschainQuote: QuoteSwapResponseDtoOutput = {
	amountOut: mockSwapAmountOut,
	fee: mockSwapBridgeFee,
	blockchainFee: mockEthArbNetworkFee,
	durationMs: SWAP_DURATION_MS,
}

export const mockSwapSamechainQuote: QuoteSwapSamechainResponseDtoOutput = {
	amountOut: { currency: mockUsdcArb, amount: '24900000' }, // ~24.9 USDC on Arbitrum
	blockchainFee: mockEthArbNetworkFee,
}

const mockSwapSrcTxId = '0xecc4a1c2b3d4e5f60718293a4b5c6d7e8f9012345678d3bf'
const mockSwapDstTxId = '0x1a2b3c4d5e6f708192a3b4c5d6e7f80912345678aabbccdd'

export const mockSwapSamechainResult: SwapSamechainResponseDtoOutput = {
	transaction: { id: mockSwapSrcTxId, cost: mockEthArbNetworkFee },
	amountOut: { currency: mockUsdcArb, amount: '24900000' }, // ~24.9 USDC on Arbitrum
}

export const mockSwapCrosschainResponse: SwapResponseDtoOutput = {
	zapId: 'swap_abc123',
	srcTransaction: { id: mockSwapSrcTxId, cost: mockEthArbNetworkFee },
	amountIn: mockUsdcArbWithdrawAmount,
	fee: mockSwapBridgeFee,
	durationMs: SWAP_DURATION_MS,
}

export const mockSwapCrosschainSuccessResult: NonNullable<
	GetSwapResultResponseDtoOutput['success']
> = {
	dstTransaction: { id: mockSwapDstTxId, cost: mockEthArbNetworkFee },
	amountOut: mockSwapAmountOut,
}

export const mockWithdrawTransaction: TransactionDtoOutput = {
	id: '0xjkl012',
	cost: { currency: mockEth, amount: '210000000000000' },
}

export const mockWithdrawChainIndex = 0 // Arbitrum
export const mockWithdrawCurrencyIndex = 1 // ETH on Arbitrum
export const mockWithdrawAmount: CurrencyAmountDtoOutput = {
	currency: mockEth,
	amount: '5000000000000000', // 0.005 ETH
}
export const mockWithdrawNetworkFee: CurrencyAmountDtoOutput = {
	currency: mockEth,
	amount: '210000000000000', // ~0.00021 ETH
}
export const mockReceiverAddress = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'

export const mockTierTables: GetTierTablesResponseDtoOutput = {
	tierTables: [
		{
			currency: mockEth,
			defaultFeeBps: 500,
			tiers: [
				// Matches the default fee, so it is not reachable and not shown.
				{ minVolume: '100000000000000000', feeBps: 500 }, // ≥0.1 ETH → 5%
				{ minVolume: '500000000000000000', feeBps: 1000 }, // ≥0.5 ETH → 10%
				{ minVolume: '1000000000000000000', feeBps: 1500 }, // ≥1 ETH → 15%
				{ minVolume: '5000000000000000000', feeBps: 2000 }, // ≥5 ETH → 20%
			],
		},
	],
}

export const mockReferrerData: GetReferrerResponseDtoOutput = {
	referrer: '0x1234567890abcdef1234567890abcdef12345678',
	states: [
		{
			currency: mockEth,
			fee: 1000,
			period: {
				startTime: '2026-04-22T00:00:00.000Z',
				volume: '600000000000000000',
			},
			rewards: {
				available: '12000000000000000', // 0.012 ETH
				withdrawn: '30000000000000000', // 0.03 ETH
			},
		},
	],
}

export const mockAvailableReward: CurrencyAmountDtoOutput = {
	currency: mockEth,
	amount: '12000000000000000', // 0.012 ETH, matches mockReferrerData
}

export const mockWithdrawRewardQuote: QuoteWithdrawRewardResponseDtoOutput = {
	blockchainFee: { currency: mockEth, amount: '210000000000000' }, // ~0.00021 ETH
}

export const mockEthBalanceCoveringRewardFee: CurrencyAmountDtoOutput = {
	currency: mockEth,
	amount: '5000000000000000', // 0.005 ETH, covers the claim fee
}

export const mockEthBalanceBelowRewardFee: CurrencyAmountDtoOutput = {
	currency: mockEth,
	amount: '10000000000000', // 0.00001 ETH, short of the claim fee
}

export const mockWithdrawRewardResponse: WithdrawRewardResponseDtoOutput = {
	transaction: {
		id: '0xghi789',
		cost: { currency: mockEth, amount: '210000000000000' },
	},
	amount: { currency: mockEth, amount: '12000000000000000' },
}

export const mockPurchase: BuyEntriesPurchaseResponseDtoOutput = {
	transaction: {
		id: '0xabc123',
		cost: { currency: mockEth, amount: '210000000000000' }, // ~0.00021 ETH gas
	},
	ripId: 1,
	entryCount: 3,
	startEntryIndex: 0,
}

export const mockZapQuote: QuoteZapResponseDtoOutput = {
	amountIn: { currency: mockUsdcArb, amount: '13500000' }, // 13.5 USDC
	durationMs: 45000,
	fee: { currency: mockEthArb, amount: '1000000000000000' }, // ~0.001 ETH
	blockchainFee: {
		currency: mockEthArb,
		amount: '100000000000000', // 0.0001 ETH
	},
}

// Samechain zap pays a non-native Base token (USDC) that is swapped to the
// Base ETH the game settles in; the network fee stays in Base ETH.
export const mockZapSamechainQuote: QuoteZapSamechainResponseDtoOutput = {
	amountIn: { currency: mockUsdcOnBase, amount: '13500000' }, // 13.5 USDC
	blockchainFee: {
		currency: mockEth,
		amount: '100000000000000', // 0.0001 ETH
	},
}

export const mockZapSamechainSrcBalance: CurrencyAmountDtoOutput = {
	currency: mockUsdcOnBase,
	amount: '100000000', // 100 USDC — covers the entry total
}

export const mockZapSamechainNativeBalance: CurrencyAmountDtoOutput = {
	currency: mockEth,
	amount: '100000000000000000', // 0.1 ETH — covers the network fee
}

export const mockZapSrcBalanceSufficient: CurrencyAmountDtoOutput = {
	currency: mockUsdcArb,
	amount: '100000000', // 100 USDC — covers the entry total
}

export const mockZapSrcBalanceInsufficient: CurrencyAmountDtoOutput = {
	currency: mockUsdcArb,
	amount: '8000000', // 8 USDC — below the 13.5 USDC entry total
}

export const mockZapCurrencyInBalance: CurrencyAmountDtoOutput =
	mockZapSrcBalanceInsufficient

export const mockZapSuccessResult: NonNullable<
	GetZapResultResponseDtoOutput['success']
> = {
	dstTransaction: {
		id: '0xdef456',
		cost: { currency: mockEth, amount: '210000000000000' },
	},
	entryCount: 3,
	ripId: 1,
	startEntryIndex: 0,
}

// Crosschain zap submit — source tx on Arbitrum, paid in Arbitrum USDC.
export const mockZapSubmit: BuyEntriesZapResponseDtoOutput = {
	zapId: 'zap-1',
	srcTransaction: {
		id: '0x789abc',
		cost: { currency: mockEthArb, amount: '100000000000000' },
	},
	amountIn: { currency: mockUsdcArb, amount: '13500000' },
	fee: { currency: mockEthArb, amount: '1000000000000000' },
	durationMs: 45000,
}

export const mockPurchaseQuote: QuotePurchaseResponseDtoOutput = {
	blockchainFee: { currency: mockEth, amount: '210000000000000' }, // ~0.00021 ETH
}

// 3 entries × 0.005 ETH = 0.015 ETH
export const mockEntryCost: CurrencyAmountDtoOutput = {
	currency: mockEth,
	amount: '15000000000000000',
}

export const mockBalance: CurrencyAmountDtoOutput = {
	currency: mockEth,
	amount: '2000000000000000', // 0.002 ETH — intentionally low for insufficient-funds preview
}

export const mockZeroBalance: CurrencyAmountDtoOutput = {
	currency: mockEth,
	amount: '0',
}

export const mockSufficientBalance: CurrencyAmountDtoOutput = {
	currency: mockEth,
	amount: '100000000000000000', // 0.1 ETH
}

// Base ETH (native base), Arbitrum USDC (non-native non-base),
// Optimism ETH (native non-base).
export const mockPaymentWalletBalances: CurrencyAmountDtoOutput[] = [
	mockSufficientBalance,
	mockUsdcArbBalance,
	mockEthOptimismBalance,
]

export const mockUserEvmAddress = '0x1234567890abcdef1234567890abcdef12345678'

export const mockRip: RipDtoOutput = {
	id: 1,
	presetId: 1,
	currency: mockEth,
	config: {
		entryCap: 8,
		feeBps: 500,
		entryPrice: { currency: mockEth, amount: '5000000000000000' },
		durationSeconds: 3600,
		payoutDistribution: [
			{
				payoutCount: '5',
				minPayout: '800000000000000',
				maxPayout: '1200000000000000',
			},
			{
				payoutCount: '2',
				minPayout: '7000000000000000',
				maxPayout: '8000000000000000',
			},
			{
				payoutCount: '1',
				minPayout: '18000000000000000',
				maxPayout: '18000000000000000',
			},
		],
	},
	actions: {
		purchases: [
			{
				userAddress: '0x1234567890abcdef1234567890abcdef12345678',
				entryCount: 4,
				startEntryIndex: 0,
			},
		],
		claims: [],
		refunds: [],
	},
	status: 'CLAIMING',
	startTime: '2026-04-24T10:00:00.000Z',
}

export const mockRevealedPayouts: PayoutDtoOutput[] = [
	{
		ripId: 1,
		entryNumber: 3,
		payoutAmount: '1000000000000000',
		revealed: true,
		card: {
			id: 1,
			name: 'Common Card 1',
			tier: 0,
			imageUrl:
				'https://cardgamer.com/wp-content/uploads/2024/11/Popular-Common-Cards.png',
		},
	},
	{
		ripId: 1,
		entryNumber: 7,
		payoutAmount: '7500000000000000',
		revealed: true,
		card: {
			id: 2,
			name: 'Rare Card 1',
			tier: 1,
			imageUrl:
				'https://cardgamer.com/wp-content/uploads/2024/11/Popular-Rare-Cards.png',
		},
	},
]

export const mockUnrevealedPayouts: PayoutDtoOutput[] = [
	{
		ripId: 1,
		entryNumber: 1,
		payoutAmount: '0',
		revealed: false,
		card: {
			id: 3,
			name: 'Common Card 2',
			tier: 0,
			imageUrl:
				'https://cardgamer.com/wp-content/uploads/2024/11/Popular-Common-Cards.png',
		},
	},
	{
		ripId: 1,
		entryNumber: 5,
		payoutAmount: '0',
		revealed: false,
		card: {
			id: 4,
			name: 'Common Card 3',
			tier: 0,
			imageUrl:
				'https://cardgamer.com/wp-content/uploads/2024/11/Popular-Common-Cards.png',
		},
	},
]

const CARD_IMAGE_URL =
	'https://cardgamer.com/wp-content/uploads/2024/11/Popular-Common-Cards.png'

function mockPayout(
	entryNumber: number,
	payoutAmount: string,
	revealed: boolean,
	card: { id: number; name: string; tier: number },
): PayoutDtoOutput {
	return {
		ripId: 1,
		entryNumber,
		payoutAmount,
		revealed,
		card: { ...card, imageUrl: CARD_IMAGE_URL },
	}
}

// Deliberately out of display order — the page sorts by tier, then amount,
// with unopened pulls last.
export const mockViewPullsPayouts: PayoutDtoOutput[] = [
	mockPayout(1, '110000000000000', true, {
		id: 15,
		name: 'Common Card 15',
		tier: 1,
	}),
	mockPayout(2, '1800000000000000', true, {
		id: 3,
		name: 'Epic Card 3',
		tier: 4,
	}),
	mockPayout(3, '0', false, { id: 20, name: 'Sealed Card 20', tier: 6 }),
	mockPayout(4, '700000000000000', true, {
		id: 6,
		name: 'Rare Card 6',
		tier: 3,
	}),
	mockPayout(5, '110000000000000', true, {
		id: 15,
		name: 'Common Card 15',
		tier: 1,
	}),
	mockPayout(6, '0', false, { id: 21, name: 'Sealed Card 21', tier: 5 }),
]

export const mockViewPullsAllOpened: PayoutDtoOutput[] = [
	mockPayout(1, '1800000000000000', true, {
		id: 3,
		name: 'Epic Card 3',
		tier: 4,
	}),
	mockPayout(2, '700000000000000', true, {
		id: 6,
		name: 'Rare Card 6',
		tier: 3,
	}),
]

const mockRipConfig = {
	entryCap: 8,
	feeBps: 500,
	entryPrice: { currency: mockEth, amount: '5000000000000000' },
	durationSeconds: 3600,
	payoutDistribution: [
		{
			payoutCount: '5',
			minPayout: '800000000000000',
			maxPayout: '1200000000000000',
		},
		{
			payoutCount: '2',
			minPayout: '7000000000000000',
			maxPayout: '8000000000000000',
		},
		{
			payoutCount: '1',
			minPayout: '18000000000000000',
			maxPayout: '18000000000000000',
		},
	],
}

const mockRipConfig2 = {
	entryCap: 20,
	feeBps: 500,
	entryPrice: { currency: mockEth, amount: '50000000000000000' },
	durationSeconds: 86400,
	payoutDistribution: [
		{
			payoutCount: '10',
			minPayout: '10000000000000000',
			maxPayout: '50000000000000000',
		},
		{
			payoutCount: '5',
			minPayout: '100000000000000000',
			maxPayout: '200000000000000000',
		},
		{
			payoutCount: '2',
			minPayout: '300000000000000000',
			maxPayout: '400000000000000000',
		},
		{
			payoutCount: '1',
			minPayout: '500000000000000000',
			maxPayout: '500000000000000000',
		},
	],
}

const mockRipConfig3 = {
	entryCap: 12,
	feeBps: 500,
	entryPrice: { currency: mockEth, amount: '10000000000000000' }, // 0.01 ETH
	durationSeconds: 43200,
	payoutDistribution: [
		{
			payoutCount: '6',
			minPayout: '2000000000000000',
			maxPayout: '5000000000000000',
		},
		{
			payoutCount: '3',
			minPayout: '20000000000000000',
			maxPayout: '30000000000000000',
		},
		{
			payoutCount: '1',
			minPayout: '60000000000000000',
			maxPayout: '60000000000000000',
		},
	],
}

export const mockFinalizedRips: RipDtoOutput[] = [
	{
		id: 2,
		presetId: 1,
		currency: mockEth,
		config: mockRipConfig,
		actions: {
			purchases: [
				{
					userAddress: mockUserEvmAddress,
					entryCount: 8,
					startEntryIndex: 0,
				},
			],
			claims: [
				{
					userAddress: mockUserEvmAddress,
					amount: '36000000000000000',
				},
			],
			refunds: [],
		},
		status: 'CLAIMED',
		startTime: '2026-04-23T08:00:00.000Z',
	},
	{
		id: 3,
		presetId: 1,
		currency: mockEth,
		config: mockRipConfig,
		actions: {
			purchases: [
				{
					userAddress: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
					entryCount: 8,
					startEntryIndex: 0,
				},
			],
			claims: [],
			refunds: [],
		},
		status: 'REFUNDED',
		startTime: '2026-04-22T06:00:00.000Z',
	},
]

export const mockRip2: RipDtoOutput = {
	id: 4,
	presetId: 2,
	currency: mockEth,
	config: mockRipConfig2,
	actions: {
		purchases: [
			{
				userAddress: mockUserEvmAddress,
				entryCount: 5,
				startEntryIndex: 0,
			},
			{
				userAddress: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
				entryCount: 8,
				startEntryIndex: 5,
			},
		],
		claims: [],
		refunds: [],
	},
	status: 'FILLING',
	startTime: '2026-04-24T09:00:00.000Z',
}

export const mockRip3: RipDtoOutput = {
	id: 5,
	presetId: 3,
	currency: mockEth,
	config: mockRipConfig3,
	actions: {
		purchases: [
			{
				userAddress: mockUserEvmAddress,
				entryCount: 4,
				startEntryIndex: 0,
			},
		],
		claims: [],
		refunds: [],
	},
	status: 'FILLING',
	startTime: '2026-04-24T12:00:00.000Z',
}

export const mockAvailablePresetNoRip: AvailablePresetDtoOutput = {
	availability: 'READY',
	preset: { id: 1, currentConfig: mockRipConfig },
	fillingRip: null,
}

const MILLISECONDS_PER_MINUTE = 60 * 1000
const FILLING_RIP_STARTED_MINUTES_AGO = 20

const fillingRipStartTime = new Date(
	Date.now() - FILLING_RIP_STARTED_MINUTES_AGO * MILLISECONDS_PER_MINUTE,
).toISOString()

export const mockAvailablePresets: AvailablePresetDtoOutput[] = [
	{
		availability: 'LIVE',
		preset: { id: 1, currentConfig: mockRipConfig },
		fillingRip: {
			...mockRip,
			id: 1,
			startTime: fillingRipStartTime,
		},
	},
	{
		availability: 'LIVE',
		preset: { id: 2, currentConfig: mockRipConfig2 },
		fillingRip: mockRip2,
	},
	{
		availability: 'LIVE',
		preset: { id: 3, currentConfig: mockRipConfig3 },
		fillingRip: mockRip3,
	},
]

// Ongoing Rips preview. Preset 2 (0.01 ETH) is mid-rip, so it renders its
// filling rip instead of a Ready block; presets 1 (0.005) and 3 (0.05) are
// ready. The completing and refunding rips belong to preset 1, which is free
// to offer a new rip while they settle.
const mockOngoingFillingRip: RipDtoOutput = {
	id: 6,
	presetId: 2,
	currency: mockEth,
	config: mockRipConfig3,
	actions: {
		purchases: [
			{
				userAddress: mockUserEvmAddress,
				entryCount: 2,
				startEntryIndex: 0,
			},
			{
				userAddress: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
				entryCount: 2,
				startEntryIndex: 2,
			},
		],
		claims: [],
		refunds: [],
	},
	status: 'FILLING',
	startTime: fillingRipStartTime,
}

export const mockOngoingAvailablePresets: AvailablePresetDtoOutput[] = [
	{
		availability: 'READY',
		preset: { id: 1, currentConfig: mockRipConfig },
		fillingRip: null,
	},
	{
		availability: 'LIVE',
		preset: { id: 2, currentConfig: mockRipConfig3 },
		fillingRip: mockOngoingFillingRip,
	},
	{
		availability: 'READY',
		preset: { id: 3, currentConfig: mockRipConfig2 },
		fillingRip: null,
	},
]

export const mockOngoingRips: RipDtoOutput[] = [
	mockOngoingFillingRip,
	{
		id: 7,
		presetId: 1,
		currency: mockEth,
		config: mockRipConfig,
		actions: {
			purchases: [
				{
					userAddress: mockUserEvmAddress,
					entryCount: 8,
					startEntryIndex: 0,
				},
			],
			claims: [],
			refunds: [],
		},
		status: 'VRF_REQUESTED',
		startTime: '2026-04-24T07:00:00.000Z',
	},
	{
		id: 8,
		presetId: 1,
		currency: mockEth,
		config: mockRipConfig,
		actions: {
			purchases: [
				{
					userAddress: mockUserEvmAddress,
					entryCount: 3,
					startEntryIndex: 0,
				},
			],
			claims: [],
			refunds: [],
		},
		status: 'REFUNDING',
		startTime: '2026-04-23T18:00:00.000Z',
	},
]

export const mockWalletBalances: CurrencyAmountDtoOutput[] = [
	{ currency: mockEth, amount: '2000000000000000' }, // 0.002 ETH on Base
	{
		currency: mockUsdcOnBase,
		amount: '15000000', // 15 USDC on Base
	},
	{ currency: mockEthArb, amount: '1000000000000000' }, // 0.001 ETH on Arbitrum
	{ currency: mockUsdcArb, amount: '100000000' }, // 100 USDC on Arbitrum
]

export const mockConfigs: ConfigDtoOutput[] = [
	{
		entryCap: 8,
		feeBps: 500,
		durationSeconds: 3600,
		entryPrice: { currency: mockEth, amount: '5000000000000000' }, // 0.005 ETH
		payoutDistribution: [
			{
				payoutCount: '5',
				minPayout: '800000000000000',
				maxPayout: '1200000000000000',
			}, // 0.0008–0.0012 ETH
			{
				payoutCount: '2',
				minPayout: '7000000000000000',
				maxPayout: '8000000000000000',
			}, // 0.007–0.008 ETH
			{
				payoutCount: '1',
				minPayout: '18000000000000000',
				maxPayout: '18000000000000000',
			}, // 0.018 ETH
		],
	},
	{
		entryCap: 20,
		feeBps: 500,
		durationSeconds: 86400,
		entryPrice: { currency: mockEth, amount: '50000000000000000' }, // 0.05 ETH
		payoutDistribution: [
			{
				payoutCount: '10',
				minPayout: '10000000000000000',
				maxPayout: '50000000000000000',
			}, // 0.01–0.05 ETH
			{
				payoutCount: '5',
				minPayout: '100000000000000000',
				maxPayout: '200000000000000000',
			}, // 0.1–0.2 ETH
			{
				payoutCount: '2',
				minPayout: '300000000000000000',
				maxPayout: '400000000000000000',
			}, // 0.3–0.4 ETH
			{
				payoutCount: '1',
				minPayout: '500000000000000000',
				maxPayout: '500000000000000000',
			}, // 0.5 ETH
		],
	},
]
