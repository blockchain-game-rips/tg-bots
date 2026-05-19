import { createServer } from 'node:http'
import { getEnvSafe } from '../../utils/common'
import { logger } from '../logging/pino-logger'
import { registry } from './registry'

const METRICS_PORT = getEnvSafe('METRICS_PORT')

export function startMetricsServer(): void {
	const server = createServer((req, res) => {
		if (req.url !== '/metrics') {
			res.writeHead(404).end()
			return
		}

		registry
			.metrics()
			.then((metrics) => {
				res.writeHead(200, {
					'Content-Type': registry.contentType,
				}).end(metrics)
			})
			.catch((err: unknown) => {
				logger.error({ err }, 'Failed to collect metrics')
				res.writeHead(500).end()
			})
	})

	server.listen(METRICS_PORT, () => {
		logger.info(
			`Metrics server listening on port ${METRICS_PORT.toString()}`,
		)
	})
}
