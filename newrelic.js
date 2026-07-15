const path = require('path')

exports.config = {
  app_name: ['goldeoro-store'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY || '',
  logging: {
    level: 'info',
  },
  allow_all_headers: true,
  attributes: {
    exclude: ['request.headers.cookie', 'request.headers.authorization', 'response.headers.cookie'],
  },
  application_logging: {
    forwarding: {
      enabled: true,
    },
  },
  distributed_tracing: {
    enabled: true,
  },
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 0.5,
  },
  error_collector: {
    enabled: true,
  },
  browser_monitoring: {
    enable: true,
  },
}
