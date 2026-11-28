import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as jsxRuntime from "react/jsx-runtime";
import { API } from "../src/constants/api.ts";
import { getApiErrorMessage } from "../src/lib/api-error.ts";

function compile(file) {
  return ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), {
    fileName: file,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
}
const enquiryCode = compile("../src/services/enquiry.service.ts");
const staffCode = compile("../src/services/staff.service.ts");
const plain = (value) => JSON.parse(JSON.stringify(value));

function serviceWithApi(api, code = enquiryCode) {
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require(name) {
      if (name === "@/lib/axios") return api;
      if (name === "@/constants/api") return { API };
      if (name === "@/lib/api-error") return { getApiErrorMessage };
      if (name === "axios") return { isAxiosError: (error) => error?.isAxiosError === true, isCancel: (error) => error?.__CANCEL__ === true };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return exports.default;
}

test("inactive statuses are visibly struck through on historical enquiries", () => {
  const exports = {};
  vm.runInNewContext(compile("../src/components/admin/EnquiryStatusBadge.tsx"), {
    exports,
    require(name) {
      assert.equal(name, "react/jsx-runtime");
      return jsxRuntime;
    },
  });
  const html = renderToStaticMarkup(createElement(exports.default, { status: { id: 3, name: "Old status", is_active: false } }));
  assert.match(html, /class="line-through"/);
  assert.match(html, /Old status/);
  assert.match(html, /inactive/);
});

test("status creation for staff omits the admin-only active flag", async () => {
  const calls = [];
  const service = serviceWithApi({ post: async (path, body) => { calls.push({ path, body: plain(body) }); return { data: {} }; } });
  await service.createStatus(" In Progress ");
  assert.deepEqual(calls, [{ path: "/enquiry/enquiry_status", body: { name: "In Progress" } }]);
  await assert.rejects(service.createStatus("x".repeat(21)), /1–20/);
  await assert.rejects(service.createStatus("  "), /1–20/);
  assert.equal(calls.length, 1);
});

test("status deletion deactivates through DELETE and reactivation uses PATCH", async () => {
  const calls = [];
  const service = serviceWithApi({
    delete: async (path) => { calls.push({ method: "DELETE", path }); return { data: {} }; },
    patch: async (path, body) => { calls.push({ method: "PATCH", path, body: plain(body) }); return { data: {} }; },
  });
  await service.deactivateStatus(3);
  await service.updateStatus(3, { is_active: true });
  assert.deepEqual(calls, [
    { method: "DELETE", path: "/enquiry/enquiry_status/3" },
    { method: "PATCH", path: "/enquiry/enquiry_status/3", body: { is_active: true } },
  ]);
});

test("active status dropdowns load every backend page using the active filter", async () => {
  const calls = [];
  const service = serviceWithApi({ get: async (path, options) => {
    calls.push({ path, params: plain(options.params) });
    return { data: { data: [{ id: options.params.page, name: "Active", is_active: true }], info: { more_records: options.params.page === 1 } } };
  } });
  assert.equal((await service.getActiveStatuses()).length, 2);
  assert.deepEqual(calls.map((call) => call.params.page), [1, 2]);
  for (const call of calls) {
    assert.equal(call.path, "/enquiry/enquiry_status");
    assert.equal(call.params.filter, "is_active:eq:true");
  }
});

test("creating an enquiry preserves documented contact and interest fields", async () => {
  let sent;
  const service = serviceWithApi({ post: async (path, body) => { sent = { path, body: plain(body) }; return { data: {} }; } });
  const payload = { name: "Asha", phone: "9876543210", enquirer_type: "parent", message: "Please call", mentor: 24, email: "asha@example.com", class_of_interest: "Class 9", subject_of_interest: "Maths" };
  await service.create(payload);
  assert.deepEqual(sent, { path: "/enquiry/enquirys", body: payload });
  assert.equal("subject" in sent.body, false);
  assert.equal("grade" in sent.body, false);
});

test("enquiry updates send a numeric status and assignment records a reason", async () => {
  const calls = [];
  const service = serviceWithApi({ patch: async (path, body) => { calls.push({ path, body: plain(body) }); return { data: {} }; } });
  await service.update(457, { status: 3 });
  await service.assign(457, "14", " Handles Delhi leads ");
  assert.deepEqual(calls, [
    { path: "/enquiry/enquirys/457", body: { status: 3 } },
    { path: "/enquiry/enquirys/457", body: { assigned_to: 14, assign_reason: "Handles Delhi leads" } },
  ]);
});

test("detail reads use the single-record response shape", async () => {
  const record = { id: 457, name: "Asha" };
  const service = serviceWithApi({ get: async (path) => { assert.equal(path, "/enquiry/enquirys/457"); return { data: { data: record } }; } });
  assert.equal(await service.getById(457), record);
});

test("enquiry list forwards backend search, status, order, pagination, and cancellation", async () => {
  const controller = new AbortController();
  const service = serviceWithApi({ get: async (path, options) => {
    assert.equal(path, "/enquiry/enquirys");
    assert.deepEqual(plain(options.params), { page: 2, per_page: 10, sort: "-created_t", filter: "name:contains:Asha,status:eq:3" });
    assert.equal(options.signal, controller.signal);
    return { data: { data: [], info: { page: 2, per_page: 10, more_records: true } } };
  } });
  const result = await service.getAll(2, 10, "-created_t", "name:contains:Asha,status:eq:3", controller.signal);
  assert.equal(result.moreRecords, true);
  assert.equal(result.page, 2);
});

test("history always includes the required enquiry filter and chronological order", async () => {
  const service = serviceWithApi({ get: async (path, options) => {
    assert.equal(path, "/enquiry/enquiry_history");
    assert.deepEqual(plain(options.params), { filter: "enquiry_id:eq:457", sort: "created_t,id", page: 2, per_page: 200 });
    return { data: { data: [], info: { more_records: false } } };
  } });
  await service.getHistory(457, 2);
});

test("history mutations keep date-only values and can clear a follow-up date", async () => {
  const calls = [];
  const service = serviceWithApi({
    post: async (path, body) => { calls.push({ method: "POST", path, body: plain(body) }); return { data: {} }; },
    patch: async (path, body) => { calls.push({ method: "PATCH", path, body: plain(body) }); return { data: {} }; },
    delete: async (path) => { calls.push({ method: "DELETE", path }); return { data: {} }; },
  });
  const entry = { id: 1025, enquiry_id: 457, action: "remark" };
  await service.addHistory(457, { remarks: " Called parent ", next_date: "2026-12-01" });
  await service.updateHistory(entry, { remarks: "Resolved", next_date: null });
  await service.deleteHistory(entry);
  assert.deepEqual(calls, [
    { method: "POST", path: "/enquiry/enquiry_history", body: { enquiry_id: 457, remarks: "Called parent", next_date: "2026-12-01" } },
    { method: "PATCH", path: "/enquiry/enquiry_history/1025", body: { enquiry_id: 457, remarks: "Resolved", next_date: null } },
    { method: "DELETE", path: "/enquiry/enquiry_history/1025" },
  ]);
});

test("system assignment history cannot be edited or deleted", async () => {
  const service = serviceWithApi({ patch: () => assert.fail("Unexpected PATCH"), delete: () => assert.fail("Unexpected DELETE") });
  const assignment = { id: 10, enquiry_id: 457, action: "assigned" };
  await assert.rejects(service.updateHistory(assignment, { remarks: "Changed" }), /read-only/);
  await assert.rejects(service.deleteHistory(assignment), /read-only/);
  await assert.rejects(service.addHistory(457, { remarks: "  " }), /required/);
});

test("backend permission errors reach the UI and canceled requests stay canceled", async () => {
  const service = serviceWithApi({ patch: async () => { throw { isAxiosError: true, response: { data: { detail: ["Only admin can assign enquiry"] } } }; } });
  await assert.rejects(service.update(457, { status: 3 }), /Only admin can assign enquiry/);
  const cancellation = { __CANCEL__: true };
  const canceledService = serviceWithApi({ get: async () => { throw cancellation; } });
  await assert.rejects(canceledService.getHistory(457), (error) => error === cancellation);
});

test("assignment dropdown loads active staff across every page", async () => {
  const pages = [];
  const service = serviceWithApi({ get: async (path, options) => {
    assert.equal(path, "/auth/allstaff");
    assert.equal(options.params.filter, "is_active:eq:true");
    pages.push(options.params.page);
    return { data: { data: [{ id: options.params.page, email: "staff@example.com", is_active: true }], info: { more_records: options.params.page === 1 } } };
  } }, staffCode);
  assert.equal((await service.getActive()).length, 2);
  assert.deepEqual(pages, [1, 2]);
});
