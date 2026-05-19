interface Duration {
	days: number
	hours: number
	minutes: number
	seconds: number
}

const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600
const SECONDS_PER_DAY = 86400

function parseDuration(totalSeconds: number): Duration {
	const days = Math.floor(totalSeconds / SECONDS_PER_DAY)
	const hours = Math.floor(
		(totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR,
	)
	const minutes = Math.floor(
		(totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE,
	)
	const seconds = totalSeconds % SECONDS_PER_MINUTE

	return { days, hours, minutes, seconds }
}

export function toShortDurationFormat(seconds: number) {
	const duration = parseDuration(seconds)

	return [
		duration.days > 0 ? `${duration.days}d` : null,
		duration.hours > 0 ? `${duration.hours}h` : null,
		duration.minutes > 0 ? `${duration.minutes}m` : null,
		duration.seconds > 0 ? `${duration.seconds}s` : null,
	]
		.filter(Boolean)
		.join(' ')
}

export function toLongDurationFormat(seconds: number) {
	const duration = parseDuration(seconds)

	return [
		duration.days > 0 ? `${duration.days}days` : null,
		duration.hours > 0 ? `${duration.hours}hours` : null,
		duration.minutes > 0 ? `${duration.minutes}minutes` : null,
		duration.seconds > 0 ? `${duration.seconds}seconds` : null,
	]
		.filter(Boolean)
		.join(' ')
}
