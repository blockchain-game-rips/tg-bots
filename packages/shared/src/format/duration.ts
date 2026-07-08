const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600
const SECONDS_PER_DAY = 86400

interface Duration {
	days: number
	hours: number
	minutes: number
	seconds: number
}

export function parseDuration(totalSeconds: number): Duration {
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

export function toShortDurationFormat(seconds: number): string {
	const duration = parseDuration(seconds)

	const parts = [
		duration.days > 0 ? `${duration.days.toString()}d` : null,
		duration.hours > 0 ? `${duration.hours.toString()}h` : null,
		duration.minutes > 0 ? `${duration.minutes.toString()}m` : null,
		duration.seconds > 0 ? `${duration.seconds.toString()}s` : null,
	].filter(Boolean)

	return parts.length > 0 ? parts.join(' ') : '0s'
}

export function toLongDurationFormat(seconds: number): string {
	const duration = parseDuration(seconds)

	const parts = [
		duration.days > 0 ? `${duration.days.toString()}days` : null,
		duration.hours > 0 ? `${duration.hours.toString()}hours` : null,
		duration.minutes > 0 ? `${duration.minutes.toString()}minutes` : null,
		duration.seconds > 0 ? `${duration.seconds.toString()}seconds` : null,
	].filter(Boolean)

	return parts.length > 0 ? parts.join(' ') : '0seconds'
}
