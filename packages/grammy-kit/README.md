# @rips/grammy-kit

Shared grammY building blocks (keyboards, actions, sessions, effects, metrics).

## Consumer-implemented extensions

Some `InlineKeyboard` methods are **declared** here but **not implemented** here.
The kit augments grammY's `InlineKeyboard` interface and calls the method, but the
consuming app must provide the runtime implementation.

### `appendHomeButton()`

`addNav` calls `keyboard.appendHomeButton()`, but the kit does not know the app's
"home" action id. The app must install the implementation before any keyboard is
rendered:

```ts
import { InlineKeyboard } from 'grammy'
import { buildActionData } from '@rips/grammy-kit'
import { actionIds } from './actions'

InlineKeyboard.prototype.appendHomeButton = function () {
	return this.text('Home', buildActionData(actionIds.openHome, undefined))
}
```

If this is not installed, `appendHomeButton` is `undefined` and the app crashes the
first time a navigation keyboard is built.
