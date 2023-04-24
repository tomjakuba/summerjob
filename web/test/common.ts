import { randomBytes } from "crypto";
import { PrismaClient } from "../lib/prisma/client";
import request from "supertest";
import { faker } from "@faker-js/faker/locale/cz";

const prisma = new PrismaClient();

/**
 * Creates a session for the given user
 * @param email Email of the user to create a session for
 * @returns Session cookie
 */
async function getSessionCookie(email: string) {
  let user = await prisma.user.findFirst({
    where: {
      email,
    },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        emailVerified: new Date(),
      },
    });
  }
  const token = randomBytes(32).toString("hex");
  const DAYS_TO_EXPIRE = 1;
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * DAYS_TO_EXPIRE);
  const newSession = await prisma.session.create({
    data: {
      sessionToken: token,
      expires: expires,
      userId: user.id,
    },
  });

  return `next-auth.session-token=${token}`;
}

/**
 * Creates a user with admin permissions and an empty event.
 * @returns Email of the created user
 */
async function initDB() {
  const start = new Date();
  start.setUTCFullYear(start.getUTCFullYear() + 1);
  start.setUTCMonth(Math.random() * 12);
  start.setUTCDate(Math.random() * 28);
  start.setUTCHours(0);
  start.setUTCMinutes(0);
  start.setUTCSeconds(0);
  start.setUTCMilliseconds(0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  const event = await prisma.summerJobEvent.create({
    data: {
      name: "Test Event",
      startDate: start,
      endDate: end,
      isActive: true,
    },
  });

  const admin = await prisma.worker.create({
    data: {
      firstName: "Admin",
      lastName: "Account",
      email: "admin@localhost",
      phone: "1234567890",
      permissions: {
        create: {
          permissions: ["ADMIN"],
        },
      },
      availability: {
        create: {
          eventId: event.id,
          workDays: [start],
          adorationDays: [start],
        },
      },
    },
  });

  return { event, admin };
}

async function wipeDB() {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`)
    .join(", ");

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
}

async function changePermissions(email: string, permission: string) {
  await prisma.worker.update({
    where: {
      email,
    },
    data: {
      permissions: {
        update: {
          permissions: [permission],
        },
      },
    },
  });
}

class Common {
  private _adminId: string;
  private _email: string;
  private _session: string;
  private _eventId: string;
  private _url = "http://localhost:3000";

  private _lastIdentity: string = Id.ADMIN;

  private getSession = async () => {
    if (this._session) return this._session;
    this._session = await getSessionCookie(this._email);
    return this._session;
  };

  private setup = async () => {
    await wipeDB();
    const { event, admin } = await initDB();
    this._adminId = admin.id;
    this._email = admin.email;
    this._eventId = event.id;
    this._session = await this.getSession();
  };

  getSummerJobEventId = () => this._eventId;

  createWorker = async () => {
    const worker = await this.post(
      "/api/workers",
      Id.WORKERS,
      createWorkerData()
    );
    return worker.body;
  };

  deleteWorker = async (workerId: string) => {
    await this.del(`/api/workers/${workerId}`, Id.WORKERS);
  };

  createArea = async () => {
    const area = await this.post(
      `/api/summerjob-events/${this._eventId}/areas`,
      Id.ADMIN,
      createAreaData()
    );
    return area.body;
  };

  deleteArea = async (areaId: string) => {
    await this.del(
      `/api/summerjob-events/${this._eventId}/areas/${areaId}`,
      Id.ADMIN
    );
  };

  createProposedJob = async (areaId: string) => {
    const area = await this.createArea();
    const job = await this.post(
      `/api/proposed-jobs`,
      Id.ADMIN,
      createProposedJobData(area.id)
    );
    return job.body;
  };

  deleteProposedJob = async (jobId: string) => {
    await this.del(`/api/proposed-jobs/${jobId}`, Id.ADMIN);
  };

  get = async (url: string, identity: string) => {
    if (!this._session) await this.setup();
    if (identity !== this._lastIdentity) {
      await changePermissions(this._email, identity);
      this._lastIdentity = identity;
    }
    return request(this._url)
      .get(url)
      .set("Cookie", [this._session])
      .set("Accept", "application/json")
      .send();
  };

  post = async (url: string, identity: string, body: any) => {
    if (!this._session) await this.setup();
    if (identity !== this._lastIdentity) {
      await changePermissions(this._email, identity);
      this._lastIdentity = identity;
    }
    return request(this._url)
      .post(url)
      .set("Cookie", [this._session])
      .set("Accept", "application/json")
      .send(body);
  };

  patch = async (url: string, identity: string, body: any) => {
    if (!this._session) await this.setup();
    if (identity !== this._lastIdentity) {
      await changePermissions(this._email, identity);
      this._lastIdentity = identity;
    }
    return request(this._url)
      .patch(url)
      .set("Cookie", [this._session])
      .set("Accept", "application/json")
      .send(body);
  };

  del = async (url: string, identity: string) => {
    if (!this._session) await this.setup();
    if (identity !== this._lastIdentity) {
      await changePermissions(this._email, identity);
      this._lastIdentity = identity;
    }
    return request(this._url)
      .delete(url)
      .set("Cookie", [this._session])
      .set("Accept", "application/json")
      .send();
  };

  afterTestBlock = async () => {
    // Set the active event
    await this.patch(`/api/summerjob-events/${this._eventId}`, Id.ADMIN, {
      isActive: true,
    });
    // Delete all workers except the admin
    const workers = await this.get("/api/workers", Id.WORKERS);
    for (const worker of workers.body) {
      if (worker.id === this._adminId) continue;
      await api.del(`/api/workers/${worker.id}`, Id.WORKERS);
    }
    // Delete all cars
    const cars = await this.get("/api/cars", Id.CARS);
    for (const car of cars.body) {
      await api.del(`/api/cars/${car.id}`, Id.CARS);
    }
    // Delete all areas - this also deletes all proposed and active jobs
    const areas = await this.get(
      `/api/summerjob-events/${this._eventId}/areas`,
      Id.ADMIN
    );
    for (const area of areas.body) {
      await api.del(
        `/api/summerjob-events/${this._eventId}/areas/${area.id}`,
        Id.ADMIN
      );
    }
  };
}

export function createWorkerData() {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number("### ### ###"),
    strong: Math.random() > 0.5,
    allergyIds: [],
    availability: {
      workDays: [],
      adorationDays: [],
    },
  };
}

export function createCarData(ownerId: string) {
  const odometerStart = Math.floor(Math.random() * 5000);
  const odometerEnd = Math.floor(Math.random() * 1000 + odometerStart);
  return {
    ownerId,
    name: faker.vehicle.vehicle(),
    description: faker.vehicle.color(),
    seats: Math.floor(Math.random() * 3 + 2),
    odometerStart,
    odometerEnd,
    reimbursed: false,
    reimbursementAmount: 1000,
  };
}

export function createAreaData() {
  return {
    name: faker.address.city(),
    requiresCar: true,
    supportsAdoration: true,
  };
}

export function createProposedJobData(areaId: string) {
  return {
    areaId: areaId,
    allergens: ["HAY"],
    privateDescription: "string",
    publicDescription: "string",
    name: "string",
    address: "string",
    contact: "string",
    maxWorkers: 1,
    minWorkers: 1,
    strongWorkers: 0,
    requiredDays: 1,
    hasFood: true,
    hasShower: true,
    availability: ["2023-04-24"],
  };
}

export function createSummerJobEventData() {
  return {
    name: "Test Summer Job Event",
    startDate: "2023-06-05",
    endDate: "2023-06-11",
  };
}

export const Id = {
  ADMIN: "ADMIN",
  JOBS: "JOBS",
  WORKERS: "WORKERS",
  CARS: "CARS",
  PLANS: "PLANS",
};

export const api = new Common();
