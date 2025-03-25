import { cache_getActiveSummerJobEvent } from 'lib/data/cache'
import ApplicationsPage from 'lib/components/application/ApplicationClientPage'

export const dynamic = 'force-dynamic'

export default async function ApplicationsPageServer() {
  const summerJobEvent = await cache_getActiveSummerJobEvent()

  if (!summerJobEvent) {
    return (
      <p className="text-center text-lg font-bold mt-5">
        Žádný aktivní ročník nenalezen.
      </p>
    )
  }

  return (
    <ApplicationsPage
      startDate={summerJobEvent.startDate.toJSON()}
      endDate={summerJobEvent.endDate.toJSON()}
    />
  )
}
