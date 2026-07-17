import { breadcrumb } from '@rips/shared'

export function withdrawBreadcrumb(
	...segments: (string | undefined)[]
): string {
	return breadcrumb('💸 Withdraw', ...segments)
}

export function depositBreadcrumb(...segments: (string | undefined)[]): string {
	return breadcrumb('📥 Deposit', ...segments)
}

export function swapBreadcrumb(...segments: (string | undefined)[]): string {
	return breadcrumb('🌉 Bridge / Swap', ...segments)
}

export function buyEntriesBreadcrumb(
	...segments: (string | undefined)[]
): string {
	return breadcrumb('🎮 Enter Rip', ...segments)
}
