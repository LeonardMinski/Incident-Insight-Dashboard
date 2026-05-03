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
