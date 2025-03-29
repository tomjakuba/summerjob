import { APIMethodHandler } from 'lib/api/MethodHandler'
import { NextApiRequest, NextApiResponse } from 'next'
import { checkApplicationPassword } from 'lib/data/summerjob-event'

async function post(req: NextApiRequest, res: NextApiResponse) {
  const eventId = req.query.eventId as string
  const { password } = req.body

  try {
    const isValid = await checkApplicationPassword(eventId, password)

    res.status(200).json({ valid: isValid })
  } catch (err: any) {
    console.error(err)
    res
      .status(400)
      .json({ message: err.message || 'Chyba při ověřování hesla' })
  }
}

export default APIMethodHandler({ post })
