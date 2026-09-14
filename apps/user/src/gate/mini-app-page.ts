/**
 * The mini app page, held as a constant so serving it reads nothing from disk.
 *
 * This is a placeholder: the designed page — spinner, two-line caption, theme
 * variables, `prefers-reduced-motion` — is ticket 09's to write, and it replaces
 * the markup below wholesale. What is fixed here is only the contract the page
 * must honour, which is why the `POST` and its shape are already correct: the
 * page posts `initData` to `/verify` and never renders a verdict, a country or
 * a debug block, because the gate returns a fact and the *bot* decides.
 */
export const MINI_APP_PAGE = `<!doctype html>
<html>
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<script src="https://telegram.org/js/telegram-web-app.js"></script>
		<title>Eligibility check</title>
	</head>
	<body>
		<p>Checking your region.</p>
		<p>The result will arrive in the chat.</p>

		<script>
			const tg = window.Telegram.WebApp
			tg.ready()
			tg.expand()

			fetch('/verify', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ initData: tg.initData }),
			}).then((response) => {
				if (response.ok) tg.close()
			})
		</script>
	</body>
</html>
`
