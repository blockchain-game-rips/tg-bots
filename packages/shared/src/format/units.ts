const DECIMAL_NUMBER_PATTERN = /^(-?)([0-9]*)\.?([0-9]*)$/
const ROUNDING_THRESHOLD = 9

export function formatUnits(amount: bigint, decimals: number): string {
	let display = amount.toString()

	const negative = display.startsWith('-')
	if (negative) display = display.slice(1)

	display = display.padStart(decimals, '0')

	const integer = display.slice(0, display.length - decimals)
	let fraction = display.slice(display.length - decimals)

	fraction = fraction.replace(/(0+)$/, '')

	return `${negative ? '-' : ''}${integer || '0'}${fraction ? `.${fraction}` : ''}`
}

export function parseUnits(amount: string | bigint, decimals: number): bigint {
	const value = amount.toString()

	if (!DECIMAL_NUMBER_PATTERN.test(value))
		throw new Error(`Invalid decimal number: ${value}`)

	const parts = value.split('.')
	let integer = parts[0] ?? ''
	let fraction = parts[1] ?? '0'

	const negative = integer.startsWith('-')
	if (negative) integer = integer.slice(1)

	fraction = fraction.replace(/(0+)$/, '')

	if (decimals === 0) {
		if (Math.round(Number(`.${fraction}`)) === 1)
			integer = (BigInt(integer) + 1n).toString()
		fraction = ''
	} else if (fraction.length > decimals) {
		const left = fraction.slice(0, decimals - 1)
		const unit = fraction.slice(decimals - 1, decimals)
		const right = fraction.slice(decimals)

		const rounded = Math.round(Number(`${unit}.${right}`))

		if (rounded > ROUNDING_THRESHOLD)
			fraction = `${(BigInt(left) + BigInt(1)).toString()}0`.padStart(
				left.length + 1,
				'0',
			)
		else fraction = `${left}${rounded.toString()}`

		if (fraction.length > decimals) {
			fraction = fraction.slice(1)
			integer = (BigInt(integer) + 1n).toString()
		}

		fraction = fraction.slice(0, decimals)
	} else {
		fraction = fraction.padEnd(decimals, '0')
	}

	return BigInt(
		`${negative ? '-' : ''}${integer.toString()}${fraction.toString()}`,
	)
}
