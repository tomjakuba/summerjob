import { DataSource } from "../datasources/datasource";
import { Planner } from "./Planner";

export class BasicPlanner implements Planner {
  datasource: DataSource;

  constructor(datasource: DataSource) {
    this.datasource = datasource;
  }

  plan(planId: string): void {
    console.log("BasicPlanner.plan()");
    const plan = this.datasource.getPlan(planId);
    console.log("plan: %s", plan);
  }
}
