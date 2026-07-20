import { InputFile } from 'grammy'
import QRCode from 'qrcode'

const QR_MARGIN = 1
const QR_SCALE = 8

export async function addressQrInputFile(address: string): Promise<InputFile> {
	const buffer = await QRCode.toBuffer(address, {
		margin: QR_MARGIN,
		scale: QR_SCALE,
	})

	return new InputFile(buffer, `${address}.png`)
}
