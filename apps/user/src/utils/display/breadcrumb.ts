import { FormattedString } from '@rips/grammy-kit'
import { breadcrumb } from '@rips/shared'

export function withdrawBreadcrumb(
	...segments: (string | undefined)[]
): FormattedString {
	return breadcrumb('💸 Withdraw', ...segments)
}

export function depositBreadcrumb(
	...segments: (string | undefined)[]
): FormattedString {
	return breadcrumb('📥 Deposit', ...segments)
}

export function swapBreadcrumb(
	...segments: (string | undefined)[]
): FormattedString {
	return breadcrumb('🌉 Bridge / Swap', ...segments)
}

export function buyEntriesBreadcrumb(
	...segments: (string | undefined)[]
): FormattedString {
	return breadcrumb('🎮 Enter Rip', ...segments)
}
