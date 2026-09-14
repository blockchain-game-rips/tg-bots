/**
 * The floor under how long the window stays up, so a fast response never
 * flashes it open and shut. There is deliberately no ceiling: the chat message
 * and the close come from the same response, so closing on a timer would leave
 * the user with no verdict and nothing to act on.
 */
export const MIN_VISIBLE_MS = 2000

/**
 * The mini app page, held as a constant so serving it reads nothing from disk.
 *
 * The page is a loader and nothing else. It never renders a verdict, a country
 * or debug output, because the gate returns a fact and the *bot* decides — the
 * page does not know the outcome and must not pretend to. Its one
 * outcome-dependent rendering is a transport failure, which is the one thing it
 * genuinely knows and the bot cannot report; that case shows an error and
 * leaves the window open, since on failure there is no chat message either.
 */
export const MINI_APP_PAGE = `<!doctype html>
<html>
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<script src="https://telegram.org/js/telegram-web-app.js"></script>
		<title>Checking your region</title>
		<style>
			:root {
				--surface: var(--tg-theme-bg-color, #ffffff);
				--ink: var(--tg-theme-text-color, #000000);
				--ink-subtle: var(--tg-theme-hint-color, #8e8e93);

				--spinner-size: 38px;
				--spinner-stroke: 3px;
				--spinner-period: 900ms;

				--gap-spinner-to-caption: 24px;
				--gap-between-lines: 6px;
				--page-padding: 24px;
			}

			* {
				box-sizing: border-box;
			}

			body {
				margin: 0;
				min-height: 100vh;
				padding: var(--page-padding);

				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;

				background: var(--surface);
				color: var(--ink);

				font-family: -apple-system, BlinkMacSystemFont, system-ui, 'Segoe UI',
					Roboto, Helvetica, Arial, sans-serif;
				font-size: 16px;
				line-height: 1.45;
				text-align: center;

				-webkit-font-smoothing: antialiased;
			}

			.spinner {
				width: var(--spinner-size);
				height: var(--spinner-size);

				border: var(--spinner-stroke) solid var(--ink-subtle);
				border-top-color: var(--ink);
				border-radius: 50%;

				opacity: 0.9;
				animation: spin var(--spinner-period) linear infinite;
			}

			.caption {
				margin-top: var(--gap-spinner-to-caption);

				display: flex;
				flex-direction: column;
				gap: var(--gap-between-lines);

				max-width: 20rem;
			}

			.caption-lead {
				font-weight: 590;
			}

			.caption-note {
				color: var(--ink-subtle);
				font-size: 15px;
			}

			[hidden] {
				display: none !important;
			}

			@keyframes spin {
				to {
					transform: rotate(360deg);
				}
			}

			@keyframes breathe {
				0%,
				100% {
					opacity: 0.35;
				}
				50% {
					opacity: 1;
				}
			}

			/* A spin conveys nothing a fade cannot, so motion sensitivity costs no meaning. */
			@media (prefers-reduced-motion: reduce) {
				.spinner {
					animation: breathe calc(var(--spinner-period) * 2) ease-in-out
						infinite;
					border-top-color: var(--ink-subtle);
				}
			}
		</style>
	</head>
	<body>
		<div class="spinner" role="status" aria-live="polite"></div>

		<div class="caption" id="caption">
			<span class="caption-lead">Checking your region.</span>
			<span class="caption-note">The result will arrive in the chat.</span>
		</div>

		<div class="caption" id="failure" hidden>
			<span class="caption-lead">Something went wrong.</span>
			<span class="caption-note">Please close this window and try again.</span>
		</div>

		<script>
			const MIN_VISIBLE_MS = ${String(MIN_VISIBLE_MS)}

			const tg = window.Telegram.WebApp
			tg.ready()
			tg.expand()

			const held = new Promise((resolve) => setTimeout(resolve, MIN_VISIBLE_MS))

			const verified = fetch('/verify', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ initData: tg.initData }),
			}).then((response) => {
				if (!response.ok) throw new Error('gate rejected the request')
			})

			// The floor covers the failure too — the spec asks a failed request to
			// "wait out the floor", and only what happens afterwards changed when it
			// became "show the error and stay open" rather than "close, say nothing".
			// So the response is awaited behind the floor rather than raced with it:
			// Promise.all would reject on the first rejection and skip the floor.
			held.then(() =>
				verified.then(
					() => {
						tg.close()
					},
					() => {
						document.getElementById('caption').hidden = true
						document.getElementById('failure').hidden = false
					},
				),
			)
		</script>
	</body>
</html>
`
