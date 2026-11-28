import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { API } from "../src/constants/api.ts";
import { buildMentorVerificationParams } from "../src/lib/mentor-verification.ts";
import { toDisplayTeacher, toDisplayTeacherFromDirectory } from "../src/utils/teacherDisplay.ts";

const query = { status: "pending", searchField: "first_name", search: "", page: 1 };

test("the review queue requests pending profiles from the backend", () => {
  assert.deepEqual(buildMentorVerificationParams(query), {
    page: 1, per_page: 10, sort: "id", filter: "is_verified:eq:false",
  });
});

test("verified and all filters preserve backend pagination", () => {
  assert.equal(buildMentorVerificationParams({ ...query, status: "verified", page: 4 }).filter, "is_verified:eq:true");
  assert.deepEqual(buildMentorVerificationParams({ ...query, status: "all", page: 4 }), {
    page: 4, per_page: 10, sort: "id",
  });
});

test("admin searches combine identity and verification filters", () => {
  assert.equal(buildMentorVerificationParams({ ...query, searchField: "email", search: " asha@example.com " }).filter,
    "is_verified:eq:false,email:contains:asha@example.com");
  assert.throws(() => buildMentorVerificationParams({ ...query, search: "Asha,is_verified:eq:true" }), /commas or colons/);
});

const profile = {
  id: 900,
  user: { id: 24, first_name: "Asha", last_name: "Singh" },
  identity_verification_name: { id: 2, name: "ID card" },
  courses_can_teach: [],
  highest_qualification: [],
};

test("an uploaded document does not give an unverified teacher a badge", () => {
  const pending = { ...profile, is_verified: false };
  assert.equal(toDisplayTeacher(pending).verified, false);
  assert.equal(toDisplayTeacherFromDirectory({ id: 24, profile: pending }).verified, false);
});

test("admin verification gives a badge independently of the document type", () => {
  const verified = { ...profile, is_verified: true, identity_verification_name: null };
  assert.equal(toDisplayTeacher(verified).verified, true);
  assert.equal(toDisplayTeacherFromDirectory({ id: 24, profile: verified }).verified, true);
});

// Isolate the real service from browser storage and HTTP; no backend records are changed.
const compiledService = ts.transpileModule(
  readFileSync(new URL("../src/services/mentor.service.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } },
).outputText;

function serviceWithApi(api) {
  const exports = {};
  vm.runInNewContext(compiledService, {
    exports,
    require(name) {
      if (name === "@/lib/axios") return api;
      if (name === "@/constants/api") return { API };
      if (name === "axios") return { isAxiosError: (error) => error?.isAxiosError === true };
      throw new Error(`Unexpected service dependency: ${name}`);
    },
  });
  return exports.default;
}

test("verify and unverify PATCH the mentor user endpoint with a boolean body", async () => {
  const requests = [];
  const service = serviceWithApi({
    patch: async (path, body) => { requests.push({ path, body: JSON.parse(JSON.stringify(body)) }); },
  });
  await service.setVerification(24, true);
  await service.setVerification(24, false);
  assert.deepEqual(requests, [
    { path: "/mentor/verify/24", body: { is_verified: true } },
    { path: "/mentor/verify/24", body: { is_verified: false } },
  ]);
});

test("verification surfaces backend permission and missing-profile errors", async () => {
  for (const message of ["Only admin users can perform this action.", "Mentor profile not found"]) {
    const service = serviceWithApi({
      patch: async () => { throw { isAxiosError: true, response: { data: { error: message } } }; },
    });
    await assert.rejects(service.setVerification(24, true), { message });
  }
});

test("private identity documents use the authenticated API client and blob response", async () => {
  const requests = [];
  const document = new Blob(["document"], { type: "application/pdf" });
  const service = serviceWithApi({
    get: async (path, options) => {
      requests.push({ path, options: JSON.parse(JSON.stringify(options)) });
      return { data: document };
    },
  });
  assert.equal(await service.downloadIdentityDocument(24), document);
  assert.deepEqual(requests, [{ path: "/mentor/document/24", options: { responseType: "blob" } }]);
});
