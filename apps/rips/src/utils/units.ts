export function formatUnits(amount: bigint, decimals: number): string {
	let display = amount.toString()

	const negative = display.startsWith('-')
	if (negative) display = display.slice(1)

	display = display.padStart(decimals, '0')

	// eslint-disable-next-line prefer-const
	let [integer, fraction] = [
		display.slice(0, display.length - decimals),
		display.slice(display.length - decimals),
	]
	fraction = fraction.replace(/(0+)$/, '')
	return `${negative ? '-' : ''}${integer || '0'}${
		fraction ? `.${fraction}` : ''
	}`
}

export function parseUnits(amount: string | bigint, decimals: number): bigint {
	const value = amount.toString()
	if (!/^(-?)([0-9]*)\.?([0-9]*)$/.test(value))
		throw new Error(`Invalid decimal number: ${value}`)

	let [integer, fraction = '0'] = value.split('.')

	const negative = integer.startsWith('-')
	if (negative) integer = integer.slice(1)

	fraction = fraction.replace(/(0+)$/, '')

	if (decimals === 0) {
		if (Math.round(Number(`.${fraction}`)) === 1)
			integer = (BigInt(integer) + 1n).toString()
		fraction = ''
	} else if (fraction.length > decimals) {
		const [left, unit, right] = [
			fraction.slice(0, decimals - 1),
			fraction.slice(decimals - 1, decimals),
			fraction.slice(decimals),
		]

		const rounded = Math.round(Number(`${unit}.${right}`))
		if (rounded > 9)
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
