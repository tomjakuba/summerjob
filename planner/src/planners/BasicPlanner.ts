import { DataSource } from "../datasources/datasource";
import { Planner } from "./Planner";

export class BasicPlanner implements Planner {
  datasource: DataSource;

  constructor(datasource: DataSource) {
    this.datasource = datasource;
  }

  async plan(planId: string) {
    console.log("BasicPlanner.plan()");
    const plan = await this.datasource.getPlan(planId);
    console.log("plan: %s", plan);
  }
}
