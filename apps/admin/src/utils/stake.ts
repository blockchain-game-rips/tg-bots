import { AvailableStakeDto, ConfigDto } from '@rips/api-client'
import { formatUnits } from './units'

export function resolveConfig(availableStake: AvailableStakeDto) {
	if (availableStake.fillingRound) return availableStake.fillingRound.config
	if (availableStake.stake.currentConfig)
		return availableStake.stake.currentConfig

	throw new Error('Config should be in fillingRound or stake.currentConfig')
}

export function configName(config: ConfigDto): string {
	const { decimals, symbol } = config.ticketPrice.currency

	const formattedAmount = formatUnits(
		BigInt(config.ticketPrice.amount),
		decimals,
	)

	const usd = Number(formattedAmount) * config.ticketPrice.currency.priceUsd

	return `${formattedAmount} ${symbol} $${usd.toFixed(2)}`
}
