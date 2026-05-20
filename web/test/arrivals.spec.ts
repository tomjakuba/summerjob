import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { api, Id, isEmpty } from './common'
import { randomUUID } from 'crypto'

type ArrivalWorker = {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  age: number | null
  arrived: boolean
  show: boolean
  birthDate: string | null
  cars: Array<{ id: string; name: string }>
}

describe('Arrivals', function () {
  beforeAll(api.beforeTestBlock)

  //#region Access
  describe('#access', function () {
    it('should not be able to list arrivals without WORKERS/ADMIN permission', async function () {
      const perms = [Id.CARS, Id.JOBS, Id.POSTS, Id.PLANS, '']
      for (const perm of perms) {
        const resp = await api.get('/api/arrivals', perm)
        expect(resp.status).toBe(403)
      }
    })

    it('should be able to list arrivals with WORKERS permission', async function () {
      const resp = await api.get('/api/arrivals', Id.WORKERS)
      expect(resp.status).toBe(200)
      expect(Array.isArray(resp.body)).toBe(true)
    })

    it('should be able to list arrivals with ADMIN permission', async function () {
      const resp = await api.get('/api/arrivals', Id.ADMIN)
      expect(resp.status).toBe(200)
      expect(Array.isArray(resp.body)).toBe(true)
    })

    it('should not be able to export CSV without WORKERS/ADMIN permission', async function () {
      const perms = [Id.CARS, Id.JOBS, Id.POSTS, Id.PLANS, '']
      for (const perm of perms) {
        const resp = await api.get('/api/arrivals/export-csv', perm)
        expect(resp.status).toBe(403)
      }
    })

    it('should not be able to mark arrival without WORKERS/ADMIN permission', async function () {
      const worker = await api.createWorker()
      const perms = [Id.CARS, Id.JOBS, Id.POSTS, Id.PLANS, '']
      for (const perm of perms) {
        const resp = await api.post(
          `/api/arrivals/${worker.id}/arrive`,
          perm,
          {}
        )
        expect(resp.status).toBe(403)
      }
    })

    it('should not be able to mark no-show without WORKERS/ADMIN permission', async function () {
      const worker = await api.createWorker()
      const perms = [Id.CARS, Id.JOBS, Id.POSTS, Id.PLANS, '']
      for (const perm of perms) {
        const resp = await api.post(
          `/api/arrivals/${worker.id}/no-show`,
          perm,
          {}
        )
        expect(resp.status).toBe(403)
      }
    })
  })
  //#endregion

  //#region Listing
  describe('#listing', function () {
    it('lists a newly created worker, not arrived and shown by default', async function () {
      const worker = await api.createWorker()
      const resp = await api.get('/api/arrivals', Id.WORKERS)
      expect(resp.status).toBe(200)

      const found = (resp.body as ArrivalWorker[]).find(w => w.id === worker.id)
      expect(found).toBeDefined()
      expect(found?.arrived).toBe(false)
      expect(found?.show).toBe(true)
      expect(found?.birthDate).toBeNull()
      expect(Array.isArray(found?.cars)).toBe(true)
    })

    it('is sorted by first name ascending', async function () {
      await api.createWorker()
      await api.createWorker()
      const resp = await api.get('/api/arrivals', Id.WORKERS)
      const names = (resp.body as ArrivalWorker[]).map(w => w.firstName)
      const sorted = [...names].sort((a, b) => a.localeCompare(b))
      expect(names).toEqual(sorted)
    })
  })
  //#endregion

  //#region Arrival
  describe('#arrive', function () {
    it('marks a worker as arrived and unmarks them again', async function () {
      const worker = await api.createWorker()

      const mark = await api.post(
        `/api/arrivals/${worker.id}/arrive`,
        Id.WORKERS,
        {}
      )
      expect(mark.status).toBe(204)

      let list = await api.get('/api/arrivals', Id.WORKERS)
      let found = (list.body as ArrivalWorker[]).find(w => w.id === worker.id)
      expect(found?.arrived).toBe(true)

      const unmark = await api.del(
        `/api/arrivals/${worker.id}/arrive`,
        Id.WORKERS
      )
      expect(unmark.status).toBe(204)

      list = await api.get('/api/arrivals', Id.WORKERS)
      found = (list.body as ArrivalWorker[]).find(w => w.id === worker.id)
      expect(found?.arrived).toBe(false)
    })

    it('returns 404 when marking an unknown worker as arrived', async function () {
      const resp = await api.post(
        `/api/arrivals/${randomUUID()}/arrive`,
        Id.WORKERS,
        {}
      )
      expect(resp.status).toBe(404)
    })

    it('returns 404 when unmarking an unknown worker', async function () {
      const resp = await api.del(
        `/api/arrivals/${randomUUID()}/arrive`,
        Id.WORKERS
      )
      expect(resp.status).toBe(404)
    })
  })
  //#endregion

  //#region No-show
  describe('#no-show', function () {
    it('hides a worker and shows them again', async function () {
      const worker = await api.createWorker()

      const hide = await api.post(
        `/api/arrivals/${worker.id}/no-show`,
        Id.WORKERS,
        {}
      )
      expect(hide.status).toBe(204)

      let list = await api.get('/api/arrivals', Id.WORKERS)
      let found = (list.body as ArrivalWorker[]).find(w => w.id === worker.id)
      expect(found?.show).toBe(false)

      const unhide = await api.del(
        `/api/arrivals/${worker.id}/no-show`,
        Id.WORKERS
      )
      expect(unhide.status).toBe(204)

      list = await api.get('/api/arrivals', Id.WORKERS)
      found = (list.body as ArrivalWorker[]).find(w => w.id === worker.id)
      expect(found?.show).toBe(true)
    })

    it('returns 404 when hiding an unknown worker', async function () {
      const resp = await api.post(
        `/api/arrivals/${randomUUID()}/no-show`,
        Id.WORKERS,
        {}
      )
      expect(resp.status).toBe(404)
    })

    it('arrival and no-show flags are independent', async function () {
      const worker = await api.createWorker()

      await api.post(`/api/arrivals/${worker.id}/arrive`, Id.WORKERS, {})
      await api.post(`/api/arrivals/${worker.id}/no-show`, Id.WORKERS, {})

      const list = await api.get('/api/arrivals', Id.WORKERS)
      const found = (list.body as ArrivalWorker[]).find(w => w.id === worker.id)
      expect(found?.arrived).toBe(true)
      expect(found?.show).toBe(false)
    })
  })
  //#endregion

  //#region CSV export
  describe('#export-csv', function () {
    it('exports workers as a CSV file', async function () {
      await api.createWorker()
      const resp = await api.get('/api/arrivals/export-csv', Id.WORKERS)
      expect(resp.status).toBe(200)
      expect(resp.headers['content-type']).toContain('text/csv')
      expect(resp.headers['content-disposition']).toContain('attachment')
      expect(isEmpty(resp.text)).toBe(false)
    })

    it('CSV starts with the expected header row', async function () {
      const resp = await api.get('/api/arrivals/export-csv', Id.WORKERS)
      expect(resp.status).toBe(200)
      expect(resp.text).toContain('Příjmení;Jméno;Datum narození;Email;Telefon')
    })

    it('CSV contains a row for a created worker', async function () {
      const worker = await api.createWorker()
      const resp = await api.get('/api/arrivals/export-csv', Id.WORKERS)
      expect(resp.text).toContain(worker.lastName)
      expect(resp.text).toContain(worker.email)
    })
  })
  //#endregion

  afterAll(api.afterTestBlock)
})
