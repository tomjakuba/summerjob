import { afterAll, describe, expect, it } from 'vitest'
import { api, Id, isEmpty } from './common'
import { randomUUID } from 'crypto'

type FoodDelivery = {
  id: string
  courierNum: number
  notes: string | null
  jobs: Array<{
    id: string
    order: number
    completed: boolean
    activeJob: { id: string }
  }>
}

describe('Food delivery', function () {
  //#region Access
  describe('#access', function () {
    it('should not be able to list deliveries without PLANS permission', async function () {
      const { plan } = await api.createPlanWithJob()
      const perms = [Id.CARS, Id.JOBS, Id.POSTS, Id.WORKERS, '']
      for (const perm of perms) {
        const resp = await api.get(
          `/api/plans/${plan.id}/food-deliveries`,
          perm
        )
        expect(resp.status).toBe(403)
      }
    })

    it('should be able to list deliveries with PLANS permission', async function () {
      const { plan } = await api.createPlanWithJob()
      const resp = await api.get(
        `/api/plans/${plan.id}/food-deliveries`,
        Id.PLANS
      )
      expect(resp.status).toBe(200)
      expect(Array.isArray(resp.body)).toBe(true)
    })

    it('should not be able to replace deliveries without PLANS permission', async function () {
      const { plan } = await api.createPlanWithJob()
      const perms = [Id.CARS, Id.WORKERS, Id.POSTS, '']
      for (const perm of perms) {
        const resp = await api.post(
          `/api/plans/${plan.id}/food-deliveries`,
          perm,
          [] as unknown as Record<string, unknown>
        )
        expect(resp.status).toBe(403)
      }
    })

    it('courier-view should be publicly accessible (no permission)', async function () {
      const { plan } = await api.createPlanWithJob()
      const resp = await api.get(
        `/api/plans/${plan.id}/food-deliveries/courier-view`,
        ''
      )
      expect([200, 404]).toContain(resp.status)
    })
  })
  //#endregion

  //#region Basic CRUD
  describe('#basic', function () {
    it('replaces deliveries with a non-empty array', async function () {
      const { plan, jobs } = await api.createPlanWithJobsAndRide()

      const payload = [
        {
          courierNum: 1,
          notes: 'První kurýr',
          jobs: [{ activeJobId: jobs[0].id, order: 0 }],
        },
        {
          courierNum: 2,
          notes: null,
          jobs: [{ activeJobId: jobs[1].id, order: 0 }],
        },
      ]

      const resp = await api.post(
        `/api/plans/${plan.id}/food-deliveries`,
        Id.PLANS,
        payload as unknown as Record<string, unknown>
      )
      expect(resp.status).toBe(200)
      expect(Array.isArray(resp.body)).toBe(true)
      expect(resp.body).toHaveLength(2)

      const list = await api.get(
        `/api/plans/${plan.id}/food-deliveries`,
        Id.PLANS
      )
      expect(list.status).toBe(200)
      expect(list.body).toHaveLength(2)
      const courierNums = (list.body as FoodDelivery[])
        .map(d => d.courierNum)
        .sort()
      expect(courierNums).toEqual([1, 2])
    })

    it('replaces deliveries — second call overwrites the first', async function () {
      const { plan, jobs } = await api.createPlanWithJobsAndRide()

      await api.post(`/api/plans/${plan.id}/food-deliveries`, Id.PLANS, [
        {
          courierNum: 1,
          jobs: [{ activeJobId: jobs[0].id, order: 0 }],
        },
      ] as unknown as Record<string, unknown>)

      const replace = await api.post(
        `/api/plans/${plan.id}/food-deliveries`,
        Id.PLANS,
        [
          {
            courierNum: 5,
            notes: 'Nahrazeno',
            jobs: [{ activeJobId: jobs[1].id, order: 0 }],
          },
        ] as unknown as Record<string, unknown>
      )
      expect(replace.status).toBe(200)

      const list = await api.get(
        `/api/plans/${plan.id}/food-deliveries`,
        Id.PLANS
      )
      expect(list.body).toHaveLength(1)
      expect((list.body as FoodDelivery[])[0].courierNum).toBe(5)
      expect((list.body as FoodDelivery[])[0].notes).toBe('Nahrazeno')
    })

    it('replaces with empty array (clears all deliveries)', async function () {
      const { plan, jobs } = await api.createPlanWithJobsAndRide()

      await api.post(`/api/plans/${plan.id}/food-deliveries`, Id.PLANS, [
        {
          courierNum: 1,
          jobs: [{ activeJobId: jobs[0].id, order: 0 }],
        },
      ] as unknown as Record<string, unknown>)

      const clear = await api.post(
        `/api/plans/${plan.id}/food-deliveries`,
        Id.PLANS,
        [] as unknown as Record<string, unknown>
      )
      expect(clear.status).toBe(200)

      const list = await api.get(
        `/api/plans/${plan.id}/food-deliveries`,
        Id.PLANS
      )
      expect(list.body).toHaveLength(0)
    })

    it('returns single delivery by id (public access)', async function () {
      const { plan, jobs } = await api.createPlanWithJobsAndRide()

      const created = await api.post(
        `/api/plans/${plan.id}/food-deliveries`,
        Id.PLANS,
        [
          {
            courierNum: 7,
            jobs: [{ activeJobId: jobs[0].id, order: 0 }],
          },
        ] as unknown as Record<string, unknown>
      )
      const deliveryId = (created.body as FoodDelivery[])[0].id

      const resp = await api.get(
        `/api/plans/${plan.id}/food-deliveries/${deliveryId}`,
        ''
      )
      expect(resp.status).toBe(200)
      expect(resp.body).toBeTypeOf('object')
    })

    it('deletes a single delivery (requires PLANS permission)', async function () {
      const { plan, jobs } = await api.createPlanWithJobsAndRide()

      const created = await api.post(
        `/api/plans/${plan.id}/food-deliveries`,
        Id.PLANS,
        [
          {
            courierNum: 1,
            jobs: [{ activeJobId: jobs[0].id, order: 0 }],
          },
          {
            courierNum: 2,
            jobs: [{ activeJobId: jobs[1].id, order: 0 }],
          },
        ] as unknown as Record<string, unknown>
      )
      const deliveryId = (created.body as FoodDelivery[])[0].id

      const forbidden = await api.del(
        `/api/plans/${plan.id}/food-deliveries/${deliveryId}`,
        Id.POSTS
      )
      expect(forbidden.status).toBe(403)

      const del = await api.del(
        `/api/plans/${plan.id}/food-deliveries/${deliveryId}`,
        Id.PLANS
      )
      expect(del.status).toBe(204)

      const after = await api.get(
        `/api/plans/${plan.id}/food-deliveries`,
        Id.PLANS
      )
      expect(after.body).toHaveLength(1)
      expect(
        (after.body as FoodDelivery[]).find(d => d.id === deliveryId)
      ).toBeUndefined()
    })

    it('returns 404 for unknown delivery id', async function () {
      const { plan } = await api.createPlanWithJob()
      const resp = await api.get(
        `/api/plans/${plan.id}/food-deliveries/${randomUUID()}`,
        ''
      )
      expect(resp.status).toBe(404)
    })
  })
  //#endregion

  //#region Validation
  describe('#validation', function () {
    it('rejects non-array body', async function () {
      const { plan } = await api.createPlanWithJob()
      const resp = await api.post(
        `/api/plans/${plan.id}/food-deliveries`,
        Id.PLANS,
        { courierNum: 1 }
      )
      expect(resp.status).toBe(400)
      expect(isEmpty(resp.body)).toBe(false)
    })
  })
  //#endregion

  afterAll(api.afterTestBlock)
})
