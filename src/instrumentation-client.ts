import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://f909a90ef181dc2c252eb3dae8350b15@o4512149484601344.ingest.us.sentry.io/4512149635137536',
  tracesSampleRate: 0,
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV,
})
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
