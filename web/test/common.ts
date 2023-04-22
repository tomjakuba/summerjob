import { randomBytes } from "crypto";
import { PrismaClient } from "../lib/prisma/client";
import request from "supertest";

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

  return admin.email;
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
  private _email: string;
  private _session: string;
  private _url = "http://localhost:3000";

  private _lastIdentity: string = Id.ADMIN;

  private getFirstAdminEmail = async () => {
    if (this._email) return this._email;
    this._email = await initDB();
    return this._email;
  };

  private getSession = async () => {
    if (this._session) return this._session;
    const email = await this.getFirstAdminEmail();
    this._session = await getSessionCookie(email);
    return this._session;
  };

  private setup = async () => {
    await wipeDB();
    this._email = await this.getFirstAdminEmail();
    this._session = await this.getSession();
  };

  get = async (url: string, identity: string) => {
    if (!this._session) await this.setup();
    if (identity !== this._lastIdentity) {
      await changePermissions(this._email, identity);
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
    }
    return request(this._url)
      .delete(url)
      .set("Cookie", [this._session])
      .set("Accept", "application/json")
      .send();
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
