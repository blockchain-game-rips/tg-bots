import { createServer } from 'node:http'
import { logger } from '../logging/pino-logger'
import { registry } from './registry'

const METRICS_PORT = 9090

export function startMetricsServer(): void {
	const server = createServer(async (req, res) => {
		if (req.url !== '/metrics') {
			res.writeHead(404).end()
			return
		}

		const metrics = await registry.metrics()

		res.writeHead(200, { 'Content-Type': registry.contentType }).end(
			metrics,
		)
	})

	server.listen(METRICS_PORT, () => {
		logger.info(`Metrics server listening on port ${METRICS_PORT}`)
	})
}
