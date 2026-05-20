import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { api, Id, isEmpty } from './common'
import { randomUUID } from 'crypto'

type Application = {
  id: string
  firstName: string
  lastName: string
  email: string
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
}

function inFuture(daysFromNow: number) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString()
}

function birthDateMinAge(years: number) {
  const d = new Date()
  d.setFullYear(d.getFullYear() - years)
  return d.toISOString()
}

function createApplicationData(eventId: string) {
  return {
    eventId,
    firstName: 'Jan',
    lastName: 'Novák',
    birthDate: birthDateMinAge(25),
    gender: 'Muž',
    phone: '+420 777888999',
    email: `${randomUUID()}@test.example`,
    address: 'Testovací 1, Praha',
    pastParticipation: false,
    arrivalDate: inFuture(30),
    departureDate: inFuture(37),
    foodAllergies: '',
    workAllergies: '',
    toolsSkills: '',
    toolsBringing: '',
    heardAboutUs: '',
    playsInstrument: '',
    wantsTShirt: false,
    accommodationPrice: '500',
    ownsCar: false,
    canBeMedic: false,
  }
}

describe('Applications', function () {
  beforeAll(api.beforeTestBlock)

  //#region Access
  describe('#access', function () {
    it('should accept a public submission (no permission)', async function () {
      const data = createApplicationData(api.getSummerJobEventId())
      const resp = await api.post('/api/applications/new', '', data)
      expect(resp.status).toBe(201)
      expect(resp.body).toHaveProperty('id')
    })

    it('should not be able to list applications without APPLICATIONS permission', async function () {
      const perms = [Id.CARS, Id.JOBS, Id.POSTS, Id.WORKERS, '']
      for (const perm of perms) {
        const resp = await api.get('/api/applications', perm)
        expect(resp.status).toBe(403)
      }
    })

    it('should be able to list applications with APPLICATIONS permission', async function () {
      const resp = await api.get('/api/applications', 'APPLICATIONS')
      expect(resp.status).toBe(200)
      expect(resp.body).toHaveProperty('data')
      expect(Array.isArray(resp.body.data)).toBe(true)
    })

    it('should not be able to read a single application without APPLICATIONS permission', async function () {
      const created = await api.post(
        '/api/applications/new',
        '',
        createApplicationData(api.getSummerJobEventId())
      )
      const id = created.body.id

      const forbidden = await api.get(`/api/applications/${id}`, Id.JOBS)
      expect(forbidden.status).toBe(403)
    })

    it('should not be able to delete an application without APPLICATIONS permission', async function () {
      const created = await api.post(
        '/api/applications/new',
        '',
        createApplicationData(api.getSummerJobEventId())
      )
      const id = created.body.id

      const forbidden = await api.del(`/api/applications/${id}`, Id.JOBS)
      expect(forbidden.status).toBe(403)
    })
  })
  //#endregion

  //#region Basic CRUD
  describe('#basic', function () {
    it('creates an application via the public endpoint', async function () {
      const data = createApplicationData(api.getSummerJobEventId())
      const resp = await api.post('/api/applications/new', '', data)
      expect(resp.status).toBe(201)
      expect(resp.body.firstName).toBe(data.firstName)
      expect(resp.body.email).toBe(data.email)
    })

    it('returns 404 for unknown application id', async function () {
      const resp = await api.get(
        `/api/applications/${randomUUID()}`,
        'APPLICATIONS'
      )
      expect(resp.status).toBe(404)
    })

    it('returns the application by id', async function () {
      const data = createApplicationData(api.getSummerJobEventId())
      const created = await api.post('/api/applications/new', '', data)
      const id = created.body.id

      const resp = await api.get(`/api/applications/${id}`, 'APPLICATIONS')
      expect(resp.status).toBe(200)
      expect(resp.body.id).toBe(id)
      expect(resp.body.email).toBe(data.email)
    })

    it('updates an application via PATCH', async function () {
      const data = createApplicationData(api.getSummerJobEventId())
      const created = await api.post('/api/applications/new', '', data)
      const id = created.body.id

      const updated = { ...data, firstName: 'Petr' }
      const patch = await api.patch(
        `/api/applications/${id}`,
        'APPLICATIONS',
        updated
      )
      expect(patch.status).toBe(204)

      const after = await api.get(`/api/applications/${id}`, 'APPLICATIONS')
      expect(after.body.firstName).toBe('Petr')
    })

    it('deletes an application', async function () {
      const data = createApplicationData(api.getSummerJobEventId())
      const created = await api.post('/api/applications/new', '', data)
      const id = created.body.id

      const del = await api.del(`/api/applications/${id}`, 'APPLICATIONS')
      expect(del.status).toBe(204)

      const after = await api.get(`/api/applications/${id}`, 'APPLICATIONS')
      expect(after.status).toBe(404)
    })

    it('paginates the list endpoint', async function () {
      const eventId = api.getSummerJobEventId()
      // Make sure there is at least one application
      await api.post(
        '/api/applications/new',
        '',
        createApplicationData(eventId)
      )

      const page1 = await api.get(
        '/api/applications?page=1&perPage=1',
        'APPLICATIONS'
      )
      expect(page1.status).toBe(200)
      expect(page1.body.data).toHaveLength(1)
      expect(page1.body).toHaveProperty('total')
    })
  })
  //#endregion

  //#region Validation
  describe('#validation', function () {
    it('rejects submission with applicant under 18', async function () {
      const data = createApplicationData(api.getSummerJobEventId())
      data.birthDate = birthDateMinAge(15) // 15 years old
      const resp = await api.post('/api/applications/new', '', data)
      expect(resp.status).toBe(400)
      expect(isEmpty(resp.body)).toBe(false)
    })

    it('rejects invalid email format', async function () {
      const data = createApplicationData(api.getSummerJobEventId())
      data.email = 'not-a-real-email'
      const resp = await api.post('/api/applications/new', '', data)
      expect(resp.status).toBe(400)
    })

    it('rejects when departureDate is before arrivalDate', async function () {
      const data = createApplicationData(api.getSummerJobEventId())
      data.arrivalDate = inFuture(40)
      data.departureDate = inFuture(35)
      const resp = await api.post('/api/applications/new', '', data)
      expect(resp.status).toBe(400)
    })

    it('rejects submission without required eventId', async function () {
      const data = createApplicationData(api.getSummerJobEventId()) as Partial<
        ReturnType<typeof createApplicationData>
      >
      delete (data as { eventId?: string }).eventId
      const resp = await api.post(
        '/api/applications/new',
        '',
        data as unknown as Record<string, unknown>
      )
      expect(resp.status).toBe(400)
    })

    it('rejects duplicate email for the same event', async function () {
      const data = createApplicationData(api.getSummerJobEventId())
      const first = await api.post('/api/applications/new', '', data)
      expect(first.status).toBe(201)

      const duplicate = await api.post('/api/applications/new', '', data)
      expect(duplicate.status).toBe(409)
    })
  })
  //#endregion

  //#region Filtering
  describe('#filtering', function () {
    it('filters by status (PENDING is the default for new applications)', async function () {
      const eventId = api.getSummerJobEventId()
      await api.post(
        '/api/applications/new',
        '',
        createApplicationData(eventId)
      )

      const resp = await api.get(
        '/api/applications?status=PENDING&page=1&perPage=50',
        'APPLICATIONS'
      )
      expect(resp.status).toBe(200)
      const items = resp.body.data as Application[]
      expect(items.length).toBeGreaterThan(0)
      expect(items.every(a => !a.status || a.status === 'PENDING')).toBe(true)
    })

    it('filters by search (returns applicants whose name matches)', async function () {
      const eventId = api.getSummerJobEventId()
      const data = createApplicationData(eventId)
      data.firstName = `Unikátní${randomUUID().slice(0, 8)}`
      await api.post('/api/applications/new', '', data)

      const resp = await api.get(
        `/api/applications?search=${encodeURIComponent(data.firstName)}&page=1&perPage=50`,
        'APPLICATIONS'
      )
      expect(resp.status).toBe(200)
      const items = resp.body.data as Application[]
      expect(items.find(a => a.firstName === data.firstName)).toBeDefined()
    })
  })
  //#endregion

  afterAll(api.afterTestBlock)
})
