import { getSMJSessionAPI, isAccessAllowed } from 'lib/auth/auth'
import { APIMethod } from 'lib/types/api'
import { Permission } from 'lib/types/auth'

export function APIAccessController(
  permissions:
    | {
        [key in 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT']?: Permission[]
      }
    | Permission[],
  handler: APIMethod
): APIMethod {
  return async (req, res) => {
    const session = await getSMJSessionAPI(req, res)
    if (!session) {
      res.status(403).end()
      return
    }

    if (
      !isAccessAllowed(
        Array.isArray(permissions)
          ? permissions
          : req.method
          ? (permissions as Record<string, any>)[req.method] ?? []
          : [],
        session
      )
    ) {
      res.status(403).end()
      return
    }

    await handler(req, res, session)
  }
}
