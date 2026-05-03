import { analyseLogs } from "./analyseLogs";

const logs = `
ERROR payment-service: Stripe timeout after 5s
ERROR payment-service: Stripe timeout after 10s
WARN auth-service: Token expired
INFO api: request ok
`;

test("groups similar errors and counts correctly", () => {
  const result = analyseLogs(logs);

  expect(result.totalLines).toBe(4);
  expect(result.severityCounts.ERROR).toBe(2);
  expect(result.groups.length).toBeGreaterThan(0);

  const top = result.groups[0];

  expect(top.count).toBe(2);
  expect(top.level).toBe("ERROR");
});

test("handles empty input safely", () => {
  const result = analyseLogs("");

  expect(result.totalLines).toBe(0);
  expect(result.groups.length).toBe(0);
  expect(result.summary.topIssue).toBeUndefined();
});

test("groups similar messages using fingerprint", () => {
  const logs = `
  ERROR service: timeout after 5s
  ERROR service: timeout after 10s
  `;

  const result = analyseLogs(logs);

  expect(result.groups[0].count).toBe(2);
});