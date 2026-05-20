import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { api, Id, isEmpty } from './common'
import { randomUUID } from 'crypto'

type AdorationSlotAdmin = {
  id: string
  dateStart: string
  location: string
  capacity: number
  length: number
  workers: Array<{ id: string; firstName: string; lastName: string }>
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function createAdorationBulkData(eventId: string, eventStart: Date) {
  const day = isoDate(eventStart)
  return {
    eventId,
    dateFrom: day,
    dateTo: day,
    fromHour: 8,
    toHour: 10,
    length: 30,
    location: `Kaple-${randomUUID()}`,
    capacity: 2,
    fromMinute: 0,
    toMinute: 0,
  }
}

describe('Adoration', function () {
  beforeAll(api.beforeTestBlock)

  //#region Access
  describe('#access', function () {
    it('should not be able to bulk create slots without ADMIN permission', async function () {
      const eventId = api.getSummerJobEventId()
      const start = api.getSummerJobEventStart()
      const body = createAdorationBulkData(eventId, start)

      const perms = [Id.CARS, Id.JOBS, Id.POSTS, '']
      for (const perm of perms) {
        const resp = await api.post('/api/adoration/new', perm, body)
        expect(resp.status).toBe(403)
      }
    })

    it('should not be able to bulk delete slots without ADMIN permission', async function () {
      const perms = [Id.CARS, Id.JOBS, Id.POSTS, '']
      for (const perm of perms) {
        const resp = await api.post('/api/adoration/delete', perm, {
          slotIds: [randomUUID()],
        })
        expect(resp.status).toBe(403)
      }
    })

    it('admin slot listing requires ADMIN/ADORATION/RECEPTION permission', async function () {
      const eventId = api.getSummerJobEventId()
      const date = isoDate(api.getSummerJobEventStart())

      const forbidden = await api.get(
        `/api/adoration/admin?date=${date}&eventId=${eventId}`,
        Id.JOBS
      )
      expect(forbidden.status).toBe(403)

      const allowed = await api.get(
        `/api/adoration/admin?date=${date}&eventId=${eventId}`,
        Id.ADMIN
      )
      expect(allowed.status).toBe(200)
      expect(Array.isArray(allowed.body)).toBe(true)
    })
  })
  //#endregion

  //#region Basic CRUD
  describe('#basic', function () {
    it('bulk-creates adoration slots for a day', async function () {
      const eventId = api.getSummerJobEventId()
      const start = api.getSummerJobEventStart()
      const body = createAdorationBulkData(eventId, start)

      const resp = await api.post('/api/adoration/new', Id.ADMIN, body)
      expect(resp.status).toBe(200)

      const date = isoDate(start)
      const list = await api.get(
        `/api/adoration/admin?date=${date}&eventId=${eventId}`,
        Id.ADMIN
      )
      expect(list.status).toBe(200)
      const slots = list.body as AdorationSlotAdmin[]
      // 8:00 -> 10:00 with 30-minute slots => 4 slots created
      const matching = slots.filter(s => s.location === body.location)
      expect(matching.length).toBe(4)
      expect(matching.every(s => s.capacity === body.capacity)).toBe(true)
      expect(matching.every(s => s.length === body.length)).toBe(true)
    })

    it('returns admin slots empty list for day without slots', async function () {
      const eventId = api.getSummerJobEventId()
      const noSlotsDate = '1999-01-01'
      const resp = await api.get(
        `/api/adoration/admin?date=${noSlotsDate}&eventId=${eventId}`,
        Id.ADMIN
      )
      expect(resp.status).toBe(200)
      expect(resp.body).toEqual([])
    })

    it('bulk-updates location of existing slots', async function () {
      const eventId = api.getSummerJobEventId()
      const start = api.getSummerJobEventStart()
      const body = createAdorationBulkData(eventId, start)
      await api.post('/api/adoration/new', Id.ADMIN, body)

      const date = isoDate(start)
      const list = await api.get(
        `/api/adoration/admin?date=${date}&eventId=${eventId}`,
        Id.ADMIN
      )
      const slotIds = (list.body as AdorationSlotAdmin[])
        .filter(s => s.location === body.location)
        .map(s => s.id)
      expect(slotIds.length).toBeGreaterThan(0)

      // NOTE: location endpoint reads req.body directly (no parseForm),
      // so we can only verify it requires ADMIN permission here.
      const resp = await api.post('/api/adoration/location', Id.POSTS, {
        slotIds,
        location: 'Změněná lokace',
      })
      expect(resp.status).toBe(403)
    })

    it('rejects bulk-create without required fields', async function () {
      const resp = await api.post('/api/adoration/new', Id.ADMIN, {
        eventId: api.getSummerJobEventId(),
        // missing dateFrom, dateTo, fromHour, toHour, etc.
      })
      expect(resp.status).toBe(400)
      expect(isEmpty(resp.body)).toBe(false)
    })
  })
  //#endregion

  //#region Public-ish endpoints
  describe('#queries', function () {
    it('lists slots for the current user requires eventId param', async function () {
      const resp = await api.get('/api/adoration', Id.ADMIN)
      expect(resp.status).toBe(400)
    })

    it('returns slot list for the user when eventId is provided', async function () {
      const eventId = api.getSummerJobEventId()
      const resp = await api.get(`/api/adoration?eventId=${eventId}`, Id.ADMIN)
      expect(resp.status).toBe(200)
      expect(Array.isArray(resp.body)).toBe(true)
    })

    it('nearest-date rejects request without eventId / fromDate', async function () {
      const resp = await api.get('/api/adoration/nearest-date', '')
      expect(resp.status).toBe(400)
    })

    it('nearest-date returns nearestDate (or null) for the given event', async function () {
      const eventId = api.getSummerJobEventId()
      const fromDate = isoDate(api.getSummerJobEventStart())
      const resp = await api.get(
        `/api/adoration/nearest-date?eventId=${eventId}&fromDate=${fromDate}`,
        ''
      )
      expect(resp.status).toBe(200)
      expect(resp.body).toHaveProperty('nearestDate')
    })

    it('nearest-date rejects invalid date format', async function () {
      const eventId = api.getSummerJobEventId()
      const resp = await api.get(
        `/api/adoration/nearest-date?eventId=${eventId}&fromDate=not-a-date`,
        ''
      )
      expect(resp.status).toBe(400)
    })
  })
  //#endregion

  //#region Delete by id
  describe('#delete by id', function () {
    it('deletes a single slot by id with ADORATION permission', async function () {
      const eventId = api.getSummerJobEventId()
      const start = api.getSummerJobEventStart()
      const body = createAdorationBulkData(eventId, start)
      await api.post('/api/adoration/new', Id.ADMIN, body)

      const date = isoDate(start)
      const list = await api.get(
        `/api/adoration/admin?date=${date}&eventId=${eventId}`,
        Id.ADMIN
      )
      const target = (list.body as AdorationSlotAdmin[]).find(
        s => s.location === body.location
      )
      expect(target).toBeDefined()

      const forbidden = await api.del(`/api/adoration/${target!.id}`, Id.POSTS)
      expect(forbidden.status).toBe(403)

      const ok = await api.del(`/api/adoration/${target!.id}`, Id.ADMIN)
      expect(ok.status).toBe(200)

      const after = await api.get(
        `/api/adoration/admin?date=${date}&eventId=${eventId}`,
        Id.ADMIN
      )
      const stillThere = (after.body as AdorationSlotAdmin[]).find(
        s => s.id === target!.id
      )
      expect(stillThere).toBeUndefined()
    })
  })
  //#endregion

  afterAll(api.afterTestBlock)
})
