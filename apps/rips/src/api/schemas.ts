import { z } from 'zod'

const chainSchema = z.object({
	namespace: z.string(),
	reference: z.string(),
})

const chainAddressSchema = z.object({
	chain: chainSchema,
	address: z.string(),
})

const currencySchema = z.object({
	chainAddress: chainAddressSchema,
	symbol: z.string(),
	name: z.string().optional(),
	decimals: z.number(),
})

const currencyAmountSchema = z.object({
	currency: currencySchema,
	amount: z.string(),
})

export const userSchema = z.object({
	id: z.string(),
	wallets: z.record(z.string(), z.string()),
	createdAt: z.string(),
})

export const balanceSchema = currencyAmountSchema

export const stakeSchema = z.object({
	id: z.number(),
	ticketCup: z.number(),
	ticketPrice: currencyAmountSchema,
	durationSeconds: z.number(),
})

export const buyTicketsSchema = z.object({
	txId: z.string(),
	cost: currencyAmountSchema,
	roundId: z.number(),
	ticketAmount: z.number(),
})

export const withdrawSchema = z.object({
	txId: z.string(),
	cost: currencyAmountSchema,
})

export const ticketPrizeSchema = z.object({
	ticketNumber: z.number(),
	prizeAmount: z.string(),
})

const purchaseActionSchema = z.object({
	userAddress: z.string(),
	ticketAmount: z.string(),
	startTicketIndex: z.string(),
})

const claimActionSchema = z.object({
	userAddress: z.string(),
	amount: z.string(),
})

const refundActionSchema = z.object({
	userAddress: z.string(),
	amount: z.string(),
})

const addressesActionsSchema = z.object({
	purchases: z.array(purchaseActionSchema),
	claims: z.array(claimActionSchema),
	refunds: z.array(refundActionSchema),
})

const roundStatusSchema = z.enum([
	'FILLING',
	'SEALED',
	'VRFREQUESTED',
	'CLAIMING',
	'CLAIMED',
	'REFUNDING',
	'REFUNDED',
])

export type RoundStatus = z.infer<typeof roundStatusSchema>

export const roundSchema = z.object({
	id: z.number(),
	stake: stakeSchema,
	actions: addressesActionsSchema,
	status: roundStatusSchema,
	startTime: z.string(),
})

export const priceSchema = z.object({
	price: z.number(),
})

export type User = z.infer<typeof userSchema>
export type Balance = z.infer<typeof balanceSchema>
export type Stake = z.infer<typeof stakeSchema>
export type BuyTickets = z.infer<typeof buyTicketsSchema>
export type Withdraw = z.infer<typeof withdrawSchema>
export type TicketPrize = z.infer<typeof ticketPrizeSchema>
export type Round = z.infer<typeof roundSchema>
export type Price = z.infer<typeof priceSchema>
