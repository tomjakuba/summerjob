export interface DataSource {
  getPlan(planId: string): Promise<Plan | null>;
}
