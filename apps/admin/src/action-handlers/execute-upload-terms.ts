import { eligibilityControllerUploadTerms } from '@rips/api-client'
import {
	ActionDef,
	assertFlow,
	ErrorToRender,
	fmt,
	joinLines,
	parseDocumentPayload,
	toFlow,
	toReset,
} from '@rips/grammy-kit'
import { noPayload, withPayload } from '../action-def'
import { actionIds } from '../action-ids'
import { Flow } from '../flows'
import { ConfirmationPage } from '../pages/confirmation-page'
import { PolicyPage } from '../pages/policy-page'
import { EffectType } from '../types'
import { adminApiKey } from '../utils/api'
import { policyWrite } from '../utils/policy-error'
import { downloadTermsFile } from '../utils/terms-file'

const TERMS_PROMPT_MESSAGE = joinLines([
	'Upload the new terms document as a file.',
	'',
	'The version number is raised automatically — you never set it by hand.',
	'',
	'Send it as a document, not as text.',
])

const TERMS_PLACEHOLDER = 'Attach the terms document'

const SEND_AS_FILE_MESSAGE =
	'Upload the terms document as a file, not as a message.'

const UNNAMED_DOCUMENT = 'the attached document'

export const openUploadTerms: ActionDef<void> = noPayload(() => ({
	flow: toReset(),
	effect: {
		type: EffectType.ASK,
		prompt: {
			message: TERMS_PROMPT_MESSAGE,
			placeholder: TERMS_PLACEHOLDER,
		},
		onSubmit: actionIds.submitConfirmUploadTerms,
	},
}))

export const submitConfirmUploadTerms: ActionDef<string> = withPayload<string>(
	(v) => v,
	(v) => v,
	(_session, payload) => {
		const document = parseDocumentPayload(payload)

		if (document === null) {
			throw new ErrorToRender(SEND_AS_FILE_MESSAGE)
		}

		const { fileId, fileName } = document

		const flow = toFlow<Flow, 'uploadTerms', 'confirm'>(
			'uploadTerms',
			'confirm',
			{ fileId, fileName },
		)

		return {
			flow,
			effect: {
				type: EffectType.NAVIGATE,
				page: ConfirmationPage.render(
					fmt`This will replace the terms document with ${fileName ?? UNNAMED_DOCUMENT} and raise the terms version.`,
					actionIds.executeConfirmUploadTerms,
				),
			},
		}
	},
)

export const executeConfirmUploadTerms: ActionDef<void> = noPayload(
	(session) => {
		assertFlow(session, 'uploadTerms', 'confirm')

		const { fileId } = session.flow.data

		return {
			effect: {
				type: EffectType.LOADING,
				message: fmt`Uploading terms document...`,
				next: async () => {
					const policy = await uploadTerms(fileId)

					return {
						flow: toReset(),
						effect: {
							type: EffectType.NAVIGATE,
							page: PolicyPage.render(
								'Terms document updated',
								policy,
							),
							history: { kind: 'page' },
						},
					}
				},
			},
		}
	},
)

async function uploadTerms(fileId: string) {
	const termsFile = await downloadTermsFile(fileId)

	const { data } = await policyWrite(() =>
		eligibilityControllerUploadTerms({
			headers: { 'x-admin-api-key': adminApiKey },
			body: { termsFile },
		}),
	)

	return data
}
