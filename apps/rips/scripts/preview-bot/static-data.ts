import {
	AvailableStakeDto,
	BuyTicketsPurchaseResponseDtoOutput,
	ConfigDto,
	CurrencyAmountDto,
	GetCardCollectionResponseDtoOutput,
	GetReferrerResponseDtoOutput,
	GetTierTablesResponseDtoOutput,
	GetZapResultResponseDtoOutput,
	PrizeDto,
	QuotePurchaseResponseDtoOutput,
	QuoteSwapResponseDtoOutput,
	QuoteZapResponseDtoOutput,
	RoundDto,
	TransactionDto,
	WithdrawRewardResponseDtoOutput,
} from '../../generated/api-client'

const mockChainAddress = {
	address: '0x0000000000000000000000000000000000000000',
	chain: { reference: '8453', namespace: 'eip155' },
}

const mockEth: ConfigDto['ticketPrice']['currency'] = {
	id: 'eip155:8453:0x0000000000000000000000000000000000000000',
	priceUsd: 2500,
	chainAddress: mockChainAddress,
	symbol: 'ETH',
	name: 'Ethereum',
	decimals: 18,
}

export const mockCardCollection: GetCardCollectionResponseDtoOutput = {
	tiers: [
		[
			{
				card: {
					id: 1,
					name: 'Common Card 1',
					tier: 0,
					imageUrl:
						'https://cardgamer.com/wp-content/uploads/2024/11/Popular-Common-Cards.png',
				},
				count: 3,
			},
			{
				card: {
					id: 2,
					name: 'Common Card 2',
					tier: 0,
					imageUrl:
						'https://cardgamer.com/wp-content/uploads/2024/11/Popular-Common-Cards.png',
				},
				count: 1,
			},
			{
				card: {
					id: 3,
					name: 'Common Card 3',
					tier: 0,
					imageUrl:
						'https://cardgamer.com/wp-content/uploads/2024/11/Popular-Common-Cards.png',
				},
				count: 0,
			},
		],
		[
			{
				card: {
					id: 4,
					name: 'Rare Card 1',
					tier: 1,
					imageUrl:
						'https://cardgamer.com/wp-content/uploads/2024/11/Popular-Rare-Cards.png',
				},
				count: 1,
			},
			{
				card: {
					id: 5,
					name: 'Rare Card 2',
					tier: 1,
					imageUrl:
						'https://cardgamer.com/wp-content/uploads/2024/11/Popular-Rare-Cards.png',
				},
				count: 0,
			},
		],
		[
			{
				card: {
					id: 6,
					name: 'Epic Card 1',
					tier: 2,
					imageUrl:
						'https://cardgamer.com/wp-content/uploads/2024/11/Popular-Epic-Cards.png',
				},
				count: 0,
			},
		],
	],
}

const mockUsdcOnBase = {
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

export const mockSwapQuote: QuoteSwapResponseDtoOutput = {
	amountOut: { currency: mockUsdcOnBase, amount: '12400000' }, // 12.4 USDC
	fee: { currency: mockEth, amount: '1000000000000000' }, // ~0.001 ETH
	durationMs: 30000,
	blockchainFee: {
		currency: mockEth,
		amount: '100000000000000', // 0.0001 ETH
	},
}

export const mockSwapNetworkFee: CurrencyAmountDto = {
	currency: mockEth,
	amount: '210000000000000', // ~0.00021 ETH
}

// SUPPORTED_CURRENCIES indices: 0 = USDC/Arbitrum, 1 = ETH/Arbitrum, 2 = USDC/Base
export const mockSwapTokenInIndex = 1 // ETH on Arbitrum
export const mockSwapTokenOutIndex = 2 // USDC on Base
export const mockSwapAmountIn: CurrencyAmountDto = {
	currency: mockEth,
	amount: '5000000000000000', // 0.005 ETH
}

export const mockWithdrawTransaction: TransactionDto = {
	id: '0xjkl012',
	cost: { currency: mockEth, amount: '210000000000000' },
}

export const mockWithdrawChainIndex = 0 // Arbitrum
export const mockWithdrawCurrencyIndex = 1 // ETH on Arbitrum
export const mockWithdrawAmount: CurrencyAmountDto = {
	currency: mockEth,
	amount: '5000000000000000', // 0.005 ETH
}
export const mockWithdrawNetworkFee: CurrencyAmountDto = {
	currency: mockEth,
	amount: '210000000000000', // ~0.00021 ETH
}
export const mockReceiverAddress = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'

export const mockTierTables: GetTierTablesResponseDtoOutput = {
	tierTables: [
		{
			currency: mockEth,
			defaultFeePercent: 500,
			tiers: [
				{ minVolume: '100000000000000000', feePercent: 500 }, // ≥0.1 ETH → 5%
				{ minVolume: '500000000000000000', feePercent: 1000 }, // ≥0.5 ETH → 10%
				{ minVolume: '1000000000000000000', feePercent: 1500 }, // ≥1 ETH → 15%
			],
		},
	],
}

export const mockReferrerData: GetReferrerResponseDtoOutput = {
	referrer: '0x1234567890abcdef1234567890abcdef12345678',
	states: [
		{
			currency: 'ETH',
			fee: 1000,
			period: {
				startTime: '2026-04-22T00:00:00.000Z',
				volume: '0.6',
			},
			rewards: {
				available: '0.012',
				withdrawn: '0.03',
			},
		},
	],
}

export const mockWithdrawRewardResponse: WithdrawRewardResponseDtoOutput = {
	transaction: {
		id: '0xghi789',
		cost: { currency: mockEth, amount: '210000000000000' },
	},
	amount: { currency: mockEth, amount: '12000000000000000' },
}

export const mockPurchase: BuyTicketsPurchaseResponseDtoOutput = {
	transaction: {
		id: '0xabc123',
		cost: { currency: mockEth, amount: '210000000000000' }, // ~0.00021 ETH gas
	},
	roundId: 1,
	ticketCount: 3,
}

const mockUsdc = {
	id: 'eip155:42161:0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
	priceUsd: 1,
	chainAddress: {
		address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
		chain: { namespace: 'eip155', reference: '42161' },
	},
	symbol: 'USDC',
	name: 'USD Coin',
	decimals: 6,
}

export const mockZapQuote: QuoteZapResponseDtoOutput = {
	amountIn: { currency: mockUsdc, amount: '13500000' }, // 13.5 USDC
	durationMs: 45000,
	fee: { currency: mockEth, amount: '1000000000000000' }, // ~0.001 ETH
	blockchainFee: {
		currency: mockEth,
		amount: '100000000000000', // 0.0001 ETH
	},
}

export const mockZapCurrencyInBalance: CurrencyAmountDto = {
	currency: mockUsdc,
	amount: '8000000', // 8 USDC — intentionally low for zap-insufficient-funds preview
}

export const mockZapSuccessResult: NonNullable<
	GetZapResultResponseDtoOutput['success']
> = {
	dstTransaction: {
		id: '0xdef456',
		cost: { currency: mockEth, amount: '210000000000000' },
	},
	ticketCount: 3,
	roundId: 1,
}

export const mockPurchaseQuote: QuotePurchaseResponseDtoOutput = {
	blockchainFee: { currency: mockEth, amount: '210000000000000' }, // ~0.00021 ETH
}

// 3 tickets × 0.005 ETH = 0.015 ETH
export const mockTicketCost: CurrencyAmountDto = {
	currency: mockEth,
	amount: '15000000000000000',
}

export const mockBalance: CurrencyAmountDto = {
	currency: mockEth,
	amount: '2000000000000000', // 0.002 ETH — intentionally low for insufficient-funds preview
}

export const mockSufficientBalance: CurrencyAmountDto = {
	currency: mockEth,
	amount: '100000000000000000', // 0.1 ETH
}

export const mockUserEvmAddress = '0x1234567890abcdef1234567890abcdef12345678'

export const mockRound: RoundDto = {
	id: 1,
	stakeId: 1,
	currency: mockEth,
	config: {
		ticketCap: 8,
		feePercent: 5,
		ticketPrice: { currency: mockEth, amount: '5000000000000000' },
		durationSeconds: 3600,
		prizeDistribution: [
			{
				prizeCount: '5',
				minPrize: '800000000000000',
				maxPrize: '1200000000000000',
			},
			{
				prizeCount: '2',
				minPrize: '7000000000000000',
				maxPrize: '8000000000000000',
			},
			{
				prizeCount: '1',
				minPrize: '18000000000000000',
				maxPrize: '18000000000000000',
			},
		],
	},
	actions: {
		purchases: [
			{
				userAddress: '0x1234567890abcdef1234567890abcdef12345678',
				ticketCount: '4',
				startTicketIndex: '0',
			},
		],
		claims: [],
		refunds: [],
	},
	status: 'CLAIMING',
	startTime: '2026-04-24T10:00:00.000Z',
}

export const mockRevealedPrizes: PrizeDto[] = [
	{
		roundId: 1,
		ticketNumber: 3,
		prizeAmount: '1000000000000000',
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
		roundId: 1,
		ticketNumber: 7,
		prizeAmount: '7500000000000000',
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

export const mockUnrevealedPrizes: PrizeDto[] = [
	{
		roundId: 1,
		ticketNumber: 1,
		prizeAmount: '0',
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
		roundId: 1,
		ticketNumber: 5,
		prizeAmount: '0',
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

const mockRoundConfig = {
	ticketCap: 8,
	feePercent: 5,
	ticketPrice: { currency: mockEth, amount: '5000000000000000' },
	durationSeconds: 3600,
	prizeDistribution: [
		{
			prizeCount: '5',
			minPrize: '800000000000000',
			maxPrize: '1200000000000000',
		},
		{
			prizeCount: '2',
			minPrize: '7000000000000000',
			maxPrize: '8000000000000000',
		},
		{
			prizeCount: '1',
			minPrize: '18000000000000000',
			maxPrize: '18000000000000000',
		},
	],
}

const mockRoundConfig2 = {
	ticketCap: 20,
	feePercent: 5,
	ticketPrice: { currency: mockEth, amount: '50000000000000000' },
	durationSeconds: 86400,
	prizeDistribution: [
		{
			prizeCount: '10',
			minPrize: '10000000000000000',
			maxPrize: '50000000000000000',
		},
		{
			prizeCount: '5',
			minPrize: '100000000000000000',
			maxPrize: '200000000000000000',
		},
		{
			prizeCount: '2',
			minPrize: '300000000000000000',
			maxPrize: '400000000000000000',
		},
		{
			prizeCount: '1',
			minPrize: '500000000000000000',
			maxPrize: '500000000000000000',
		},
	],
}

export const mockFinishedRounds: RoundDto[] = [
	{
		id: 2,
		stakeId: 1,
		currency: mockEth,
		config: mockRoundConfig,
		actions: {
			purchases: [
				{
					userAddress: mockUserEvmAddress,
					ticketCount: '8',
					startTicketIndex: '0',
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
		stakeId: 1,
		currency: mockEth,
		config: mockRoundConfig,
		actions: {
			purchases: [
				{
					userAddress: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
					ticketCount: '8',
					startTicketIndex: '0',
				},
			],
			claims: [],
			refunds: [],
		},
		status: 'REFUNDED',
		startTime: '2026-04-22T06:00:00.000Z',
	},
]

export const mockRound2: RoundDto = {
	id: 4,
	stakeId: 2,
	currency: mockEth,
	config: mockRoundConfig2,
	actions: {
		purchases: [
			{
				userAddress: mockUserEvmAddress,
				ticketCount: '5',
				startTicketIndex: '0',
			},
			{
				userAddress: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
				ticketCount: '8',
				startTicketIndex: '5',
			},
		],
		claims: [],
		refunds: [],
	},
	status: 'FILLING',
	startTime: '2026-04-24T09:00:00.000Z',
}

export const mockAvailableStakes: AvailableStakeDto[] = [
	{
		stake: { id: 1, currentConfig: mockRoundConfig },
		fillingRound: {
			...mockRound,
			id: 1,
		},
	},
	{
		stake: { id: 2, currentConfig: mockRoundConfig2 },
		fillingRound: mockRound2,
	},
]

export const mockConfigs: ConfigDto[] = [
	{
		ticketCap: 8,
		feePercent: 5,
		durationSeconds: 3600,
		ticketPrice: { currency: mockEth, amount: '5000000000000000' }, // 0.005 ETH
		prizeDistribution: [
			{
				prizeCount: '5',
				minPrize: '800000000000000',
				maxPrize: '1200000000000000',
			}, // 0.0008–0.0012 ETH
			{
				prizeCount: '2',
				minPrize: '7000000000000000',
				maxPrize: '8000000000000000',
			}, // 0.007–0.008 ETH
			{
				prizeCount: '1',
				minPrize: '18000000000000000',
				maxPrize: '18000000000000000',
			}, // 0.018 ETH
		],
	},
	{
		ticketCap: 20,
		feePercent: 5,
		durationSeconds: 86400,
		ticketPrice: { currency: mockEth, amount: '50000000000000000' }, // 0.05 ETH
		prizeDistribution: [
			{
				prizeCount: '10',
				minPrize: '10000000000000000',
				maxPrize: '50000000000000000',
			}, // 0.01–0.05 ETH
			{
				prizeCount: '5',
				minPrize: '100000000000000000',
				maxPrize: '200000000000000000',
			}, // 0.1–0.2 ETH
			{
				prizeCount: '2',
				minPrize: '300000000000000000',
				maxPrize: '400000000000000000',
			}, // 0.3–0.4 ETH
			{
				prizeCount: '1',
				minPrize: '500000000000000000',
				maxPrize: '500000000000000000',
			}, // 0.5 ETH
		],
	},
]
