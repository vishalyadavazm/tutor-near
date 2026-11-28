import assert from "node:assert/strict";
import test from "node:test";
import { buildMentorDirectoryParams, POPULAR_MENTOR_SORT } from "../src/lib/mentor-directory.ts";

const defaults = {
  searchField: "course",
  searchText: "",
  city: "",
  courses: [],
  experience: "",
  verifiedOnly: false,
  sort: "relevant",
};

test("unfiltered browsing requests a bounded backend page", () => {
  assert.deepEqual(buildMentorDirectoryParams(defaults, 3), {
    page: 3, per_page: 12, sort: "id",
  });
});

test("popularity uses the documented likes ordering rather than the rejected rating field", () => {
  assert.equal(POPULAR_MENTOR_SORT, "-total_likes,id");
  assert.equal(buildMentorDirectoryParams({ ...defaults, sort: "popular" }).sort, "-total_likes,id");
});

test("each search field produces a backend contains filter", () => {
  for (const searchField of ["course", "expertise", "first_name", "last_name"]) {
    const params = buildMentorDirectoryParams({ ...defaults, searchField, searchText: "  Physics  " });
    assert.equal(params.filter, `${searchField}:contains:Physics`);
  }
});

test("search, city, courses, experience, and verification combine in one backend query", () => {
  const params = buildMentorDirectoryParams({
    ...defaults,
    searchField: "first_name",
    searchText: "Priya",
    city: " Delhi ",
    courses: ["Algebra", "Calculus"],
    experience: "3–5 years",
    verifiedOnly: true,
    sort: "name",
  });
  assert.equal(params.filter, [
    "first_name:contains:Priya", "city:contains:Delhi", "course:eq:Algebra", "course:eq:Calculus",
    "total_expierence_in_years:gte:3", "total_expierence_in_years:lte:5", "is_verified:eq:true",
  ].join(","));
  assert.equal(params.sort, "first_name,last_name,id");
});

test("ten-plus experience includes ten and has no artificial upper limit", () => {
  assert.equal(
    buildMentorDirectoryParams({ ...defaults, experience: "10+ years" }).filter,
    "total_expierence_in_years:gte:10",
  );
});

test("cleared inputs remove search restrictions", () => {
  assert.equal(buildMentorDirectoryParams({ ...defaults, searchText: "  ", city: "  " }).filter, undefined);
});

test("query delimiters cannot introduce additional filter conditions", () => {
  for (const value of ["Physics,is_verified:eq:false", "name:contains:other"]) {
    assert.throws(() => buildMentorDirectoryParams({ ...defaults, searchText: value }), /commas or colons/);
    assert.throws(() => buildMentorDirectoryParams({ ...defaults, city: value }), /commas or colons/);
    assert.throws(() => buildMentorDirectoryParams({ ...defaults, courses: [value] }), /commas or colons/);
  }
});
