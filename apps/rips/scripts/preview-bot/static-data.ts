import { ConfigDto } from '../../generated/api-client'

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
