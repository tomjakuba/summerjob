import { afterAll, describe, expect, it } from 'vitest'
import { api, Id, isEmpty } from './common'
import { randomUUID } from 'crypto'

type TShirtColor = { id: string; name: string; order: number }

function createTShirtColorData() {
  return {
    name: `color-${randomUUID()}`,
  }
}

describe('T-shirt colors', function () {
  //#region Access
  describe('#access', function () {
    it('should be accessible without permission (read)', async function () {
      const resp = await api.get('/api/t-shirt-colors', '')
      expect(resp.status).toBe(200)
      expect(Array.isArray(resp.body)).toBe(true)
    })

    it('should not be able to create without ADMIN permission', async function () {
      const perms = [Id.CARS, Id.JOBS, Id.POSTS, Id.WORKERS, '']
      for (const perm of perms) {
        const body = createTShirtColorData()
        const resp = await api.post('/api/t-shirt-colors', perm, body)
        expect(resp.status).toBe(403)
        expect(isEmpty(resp.body)).toBe(true)
      }
    })

    it('should be able to create with ADMIN permission', async function () {
      const body = createTShirtColorData()
      const resp = await api.post('/api/t-shirt-colors', Id.ADMIN, body)
      expect(resp.status).toBe(201)
      expect(resp.body).toHaveProperty('id')
    })

    it('should not be able to delete without ADMIN permission', async function () {
      const created = await api.post(
        '/api/t-shirt-colors',
        Id.ADMIN,
        createTShirtColorData()
      )
      const id = created.body.id

      const perms = [Id.CARS, Id.JOBS, Id.POSTS, '']
      for (const perm of perms) {
        const resp = await api.del(`/api/t-shirt-colors/${id}`, perm)
        expect(resp.status).toBe(403)
      }

      const stillThere = await api.get('/api/t-shirt-colors', '')
      expect((stillThere.body as TShirtColor[]).map(c => c.id)).toContain(id)
    })

    it('should not be able to update without ADMIN permission', async function () {
      const created = await api.post(
        '/api/t-shirt-colors',
        Id.ADMIN,
        createTShirtColorData()
      )
      const id = created.body.id
      const originalName = created.body.name

      const perms = [Id.CARS, Id.JOBS, Id.POSTS, '']
      for (const perm of perms) {
        const resp = await api.patch(`/api/t-shirt-colors/${id}`, perm, {
          name: 'Hacked name',
        })
        expect(resp.status).toBe(403)
      }

      const unchanged = await api.get(`/api/t-shirt-colors/${id}`, '')
      expect(unchanged.body.name).toBe(originalName)
    })
  })
  //#endregion

  //#region Basic CRUD
  describe('#basic', function () {
    it('creates a t-shirt color', async function () {
      const body = createTShirtColorData()
      const resp = await api.post('/api/t-shirt-colors', Id.ADMIN, body)
      expect(resp.status).toBe(201)
      expect(resp.body).toBeTypeOf('object')
      expect(resp.body).toHaveProperty('id')
      expect(resp.body.name).toBe(body.name)
    })

    it('returns 404 when t-shirt color does not exist', async function () {
      const resp = await api.get(`/api/t-shirt-colors/${randomUUID()}`, '')
      expect(resp.status).toBe(404)
    })

    it('returns a list of t-shirt colors ordered by order asc', async function () {
      const resp = await api.get('/api/t-shirt-colors', '')
      expect(resp.status).toBe(200)
      expect(Array.isArray(resp.body)).toBe(true)
      const orders = (resp.body as TShirtColor[]).map(c => c.order)
      const sorted = [...orders].sort((a, b) => a - b)
      expect(orders).toEqual(sorted)
    })

    it('returns a t-shirt color by id', async function () {
      const body = createTShirtColorData()
      const created = await api.post('/api/t-shirt-colors', Id.ADMIN, body)
      const id = created.body.id

      const resp = await api.get(`/api/t-shirt-colors/${id}`, '')
      expect(resp.status).toBe(200)
      expect(resp.body.id).toBe(id)
      expect(resp.body.name).toBe(body.name)
    })

    it('updates a t-shirt color', async function () {
      const created = await api.post(
        '/api/t-shirt-colors',
        Id.ADMIN,
        createTShirtColorData()
      )
      const id = created.body.id

      const newName = `updated-${randomUUID()}`
      const patch = await api.patch(`/api/t-shirt-colors/${id}`, Id.ADMIN, {
        name: newName,
      })
      expect(patch.status).toBe(204)
      expect(isEmpty(patch.body)).toBe(true)

      const after = await api.get(`/api/t-shirt-colors/${id}`, '')
      expect(after.body.name).toBe(newName)
    })

    it('deletes a t-shirt color', async function () {
      const before = await api.get('/api/t-shirt-colors', '')
      const created = await api.post(
        '/api/t-shirt-colors',
        Id.ADMIN,
        createTShirtColorData()
      )
      const id = created.body.id

      const afterAdd = await api.get('/api/t-shirt-colors', '')
      expect(afterAdd.body).toHaveLength(before.body.length + 1)

      const del = await api.del(`/api/t-shirt-colors/${id}`, Id.ADMIN)
      expect(del.status).toBe(204)

      const afterDel = await api.get('/api/t-shirt-colors', '')
      expect(afterDel.body).toHaveLength(before.body.length)
      expect((afterDel.body as TShirtColor[]).map(c => c.id)).not.toContain(id)
    })
  })
  //#endregion

  //#region Validation
  describe('#validation', function () {
    it('rejects creation with empty name', async function () {
      const resp = await api.post('/api/t-shirt-colors', Id.ADMIN, { name: '' })
      expect(resp.status).toBe(400)
    })

    it('rejects creation without name field', async function () {
      const resp = await api.post('/api/t-shirt-colors', Id.ADMIN, {})
      expect(resp.status).toBe(400)
    })

    it('rejects unknown fields (strict schema)', async function () {
      const resp = await api.post('/api/t-shirt-colors', Id.ADMIN, {
        name: 'Red',
        unknownField: 'value',
      })
      expect(resp.status).toBe(400)
    })
  })
  //#endregion

  //#region Reorder
  describe('#reorder', function () {
    it('reorders t-shirt colors by ids', async function () {
      const a = await api.post(
        '/api/t-shirt-colors',
        Id.ADMIN,
        createTShirtColorData()
      )
      const b = await api.post(
        '/api/t-shirt-colors',
        Id.ADMIN,
        createTShirtColorData()
      )
      const c = await api.post(
        '/api/t-shirt-colors',
        Id.ADMIN,
        createTShirtColorData()
      )
      const newOrder = [c.body.id, a.body.id, b.body.id]

      const resp = await api.post('/api/t-shirt-colors/reorder', Id.ADMIN, {
        ids: newOrder,
      })
      expect(resp.status).toBe(204)

      const list = await api.get('/api/t-shirt-colors', '')
      const positions = newOrder.map(id =>
        (list.body as TShirtColor[]).findIndex(c => c.id === id)
      )
      const sorted = [...positions].sort((x, y) => x - y)
      expect(positions).toEqual(sorted)
    })

    it('rejects reorder without ADMIN permission', async function () {
      const resp = await api.post('/api/t-shirt-colors/reorder', Id.POSTS, {
        ids: [],
      })
      expect(resp.status).toBe(403)
    })
  })
  //#endregion

  afterAll(api.afterTestBlock)
})
