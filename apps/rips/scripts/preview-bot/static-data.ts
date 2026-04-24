import { ConfigDto, PrizeDto, RoundDto } from '../../generated/api-client'

const mockChainAddress = {
	address: '0x0000000000000000000000000000000000000000',
	chain: { reference: '8453', namespace: 'eip155' },
}

const mockEth: ConfigDto['ticketPrice']['currency'] = {
	priceUsd: 2500,
	chainAddress: mockChainAddress,
	symbol: 'ETH',
	name: 'Ethereum',
	decimals: 18,
}

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
