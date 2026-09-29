process.env.JWT_SECRET = "test-secret";
require("ts-node/register/transpile-only");

const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { randomBytes, scryptSync } = require("node:crypto");

const users = [];
const mockPrisma = {
  user: {
    create: jest.fn(async ({ data, select }) => {
      if (users.some((user) => user.email === data.email)) {
        const error = new Error("Duplicate email");
        error.code = "P2002";
        throw error;
      }
      const user = { id: `user-${users.length + 1}`, isActive: true, points: 0, ...data };
      users.push(user);
      return Object.fromEntries(Object.keys(select).map((key) => [key, user[key]]));
    }),
    findUnique: jest.fn(async ({ where, select }) => {
      const user = users.find((candidate) => candidate.email === where.email || candidate.id === where.id) || null;
      if (!user || !select) return user;
      return Object.fromEntries(Object.keys(select).map((key) => [key, user[key]]));
    }),
    update: jest.fn(async ({ where, data }) => {
      const user = users.find((candidate) => candidate.id === where.id);
      Object.assign(user, data);
      return user;
    }),
  },
  $disconnect: jest.fn(),
};

jest.mock("../lib/prisma", () => ({ prisma: mockPrisma }));

const { app } = require("../server");

const validSignup = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  password: "correct-horse",
  branch: "CSE",
  rollNo: "CSE-001",
};

async function register(overrides = {}) {
  return request(app).post("/api/auth/signup").send({ ...validSignup, ...overrides });
}

async function login(overrides = {}) {
  return request(app).post("/api/auth/login").send({
    email: validSignup.email,
    password: validSignup.password,
    ...overrides,
  });
}

beforeEach(() => {
  users.length = 0;
  jest.clearAllMocks();
});

describe("registration", () => {
  test("registers a user and hashes the password", async () => {
    const response = await register();
    expect(response.status).toBe(201);
    expect(users[0].passwordHash).not.toBe(validSignup.password);
    expect(users[0].passwordHash).toMatch(/^\$2[aby]\$\d{2}\$/);
    expect(bcrypt.getRounds(users[0].passwordHash)).toBeGreaterThanOrEqual(10);
    expect(response.body.user).not.toHaveProperty("passwordHash");
    expect(response.body).toHaveProperty("token");
  });

  test("rejects duplicate email", async () => {
    await register();
    const response = await register();
    expect(response.status).toBe(409);
  });

  test("requires branch and roll number only for students", async () => {
    const trainer = await register({ email: "trainer@example.com", role: "TRAINER", branch: undefined, rollNo: undefined });
    expect(trainer.status).toBe(201);
    expect(users[0].role).toBe("TRAINER");
    expect(users[0].branch).toBeUndefined();
    expect(users[0].rollNo).toBeUndefined();

    const studentWithoutProfile = await request(app).post("/api/auth/signup").send({
      ...validSignup,
      email: "missing-profile@example.com",
      branch: undefined,
      rollNo: undefined,
    });
    expect(studentWithoutProfile.status).toBe(400);
  });

  test.each([
    [{ email: "ada@example.com", password: "correct-horse" }],
    [{ ...validSignup, email: "not-an-email" }],
    [{ ...validSignup, password: "short" }],
  ])("rejects invalid or missing registration fields", async (body) => {
    const response = await request(app).post("/api/auth/signup").send(body);
    expect(response.status).toBe(400);
  });
});

describe("login", () => {
  test("prints the four credential audit scenarios", async () => {
    const credentials = { name: "Test User", email: "test@example.com", password: "password123" };
    const registration = await register(credentials);
    const correct = await login(credentials);
    const wrongPassword = await login({ email: credentials.email, password: "wrongpass" });
    const unknownEmail = await login({ email: "never-registered@example.com", password: credentials.password });
    const payload = jwt.decode(correct.body.token);

    console.log("AUDIT register", { status: registration.status, email: registration.body.user.email });
    console.log("AUDIT correct login", { status: correct.status, jwt: Boolean(correct.body.token) });
    console.log("AUDIT wrong password", { status: wrongPassword.status, message: wrongPassword.body.message });
    console.log("AUDIT unknown email", { status: unknownEmail.status, message: unknownEmail.body.message });
    console.log("AUDIT JWT payload", payload);

    expect(registration.status).toBe(201);
    expect(correct.status).toBe(200);
    expect(correct.body.token).toEqual(expect.any(String));
    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(payload).toEqual(expect.objectContaining({ email: credentials.email, role: "STUDENT" }));
  });

  test("returns a JWT for correct credentials", async () => {
    await register();
    const response = await login();
    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user.email).toBe(validSignup.email);
  });

  test("validates branch and roll number for student login", async () => {
    await register();

    const validStudentLogin = await login({ role: "STUDENT", branch: validSignup.branch, rollNo: validSignup.rollNo });
    expect(validStudentLogin.status).toBe(200);

    const wrongBranch = await login({ role: "STUDENT", branch: "ECE", rollNo: validSignup.rollNo });
    expect(wrongBranch.status).toBe(401);

    const missingStudentFields = await login({ role: "STUDENT", branch: undefined, rollNo: undefined });
    expect(missingStudentFields.status).toBe(400);
  });

  test("rejects an email that was never registered", async () => {
    const response = await login({ email: "never-registered@example.com" });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid credentials.");
  });

  test("rejects a wrong password", async () => {
    await register();
    const response = await login({ password: "wrong-password" });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid credentials.");
  });

  test("migrates a legacy scrypt password after a successful login", async () => {
    const salt = randomBytes(16).toString("hex");
    const legacyHash = `${salt}:${scryptSync(validSignup.password, salt, 64).toString("hex")}`;
    users.push({ id: "legacy-user", name: validSignup.name, email: validSignup.email, passwordHash: legacyHash, role: "STUDENT", isActive: true });

    const response = await login();

    expect(response.status).toBe(200);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "legacy-user" } }));
    expect(users[0].passwordHash).toMatch(/^\$2[aby]\$\d{2}\$/);
  });

  test("rejects missing fields", async () => {
    const response = await request(app).post("/api/auth/login").send({ email: validSignup.email });
    expect(response.status).toBe(400);
  });
});

describe("JWT and protected routes", () => {
  test("contains only the user id and email claims", async () => {
    await register();
    const response = await login();
    const payload = jwt.decode(response.body.token);
    expect(payload).toEqual(expect.objectContaining({ id: users[0].id, email: validSignup.email, role: "STUDENT" }));
    expect(payload).not.toHaveProperty("password");
    expect(payload).not.toHaveProperty("passwordHash");
  });

  test("rejects a token signed with the wrong secret", async () => {
    const token = jwt.sign({ id: "user-1", email: validSignup.email, role: "STUDENT" }, "wrong-secret");
    const response = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  test("rejects an expired token", async () => {
    const token = jwt.sign({ id: "user-1", email: validSignup.email, role: "STUDENT" }, process.env.JWT_SECRET, { expiresIn: -1 });
    const response = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  test("rejects a tampered token", async () => {
    await register();
    const { body } = await login();
    const tamperedToken = `${body.token.slice(0, -1)}${body.token.endsWith("a") ? "b" : "a"}`;
    const response = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${tamperedToken}`);
    expect(response.status).toBe(401);
  });

  test("rejects protected requests without a token", async () => {
    const response = await request(app).get("/api/auth/me");
    expect(response.status).toBe(401);
  });

  test("rejects a malformed authorization header", async () => {
    const response = await request(app).get("/api/auth/me").set("Authorization", "Token not-a-bearer-token");
    expect(response.status).toBe(401);
  });

  test("rejects a token for a deleted user", async () => {
    await register();
    const { body } = await login();
    users.length = 0;
    const response = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${body.token}`);
    expect(response.status).toBe(401);
  });
});