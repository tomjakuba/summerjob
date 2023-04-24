import { Id, api, createPlanData } from "./common";
import chai from "chai";

chai.should();

describe("Plans", function () {
  it("should show empty list of plans", async function () {
    const plans = await api.get("/api/plans", Id.PLANS);
    plans.status.should.equal(200);
    plans.body.should.be.an("array");
    plans.body.should.have.lengthOf(0);
  });

  it("creates a plan", async function () {
    const firstPlan = await api.post(
      "/api/plans",
      Id.PLANS,
      createPlanData(api.getSummerJobEventStart())
    );
    firstPlan.status.should.equal(201);
    firstPlan.body.should.have.property("id");

    const lastPlan = await api.post(
      "/api/plans",
      Id.PLANS,
      createPlanData(api.getSummerJobEventEnd())
    );
    lastPlan.status.should.equal(201);
    lastPlan.body.should.have.property("id");

    // Cleanup

    await api.del(`/api/plans/${firstPlan.body.id}`, Id.PLANS);
    await api.del(`/api/plans/${lastPlan.body.id}`, Id.PLANS);
  });

  it("returns a list of plans", async function () {
    const firstPlan = await api.post(
      "/api/plans",
      Id.PLANS,
      createPlanData(api.getSummerJobEventStart())
    );

    const plans = await api.get("/api/plans", Id.PLANS);
    plans.status.should.equal(200);
    plans.body.should.be.an("array");
    plans.body.should.have.lengthOf(1);

    await api.del(`/api/plans/${firstPlan.body.id}`, Id.PLANS);
  });

  it("deletes a plan", async function () {
    const firstPlan = await api.post(
      "/api/plans",
      Id.PLANS,
      createPlanData(api.getSummerJobEventStart())
    );
    const plans = await api.get("/api/plans", Id.PLANS);
    const deleted = await api.del(`/api/plans/${firstPlan.body.id}`, Id.PLANS);
    deleted.status.should.equal(204);

    const plansAfterDelete = await api.get("/api/plans", Id.PLANS);
    plansAfterDelete.body.should.have.lengthOf(plans.body.length - 1);
  });

  it("returns a plan by id", async function () {
    const created = await api.post(
      "/api/plans",
      Id.PLANS,
      createPlanData(api.getSummerJobEventEnd())
    );
    const plan = await api.get(`/api/plans/${created.body.id}`, Id.PLANS);
    plan.status.should.equal(200);
    plan.body.should.be.an("object");
    plan.body.should.have.property("id");
  });
});
