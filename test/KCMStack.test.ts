import { expect, haveResource } from "@aws-cdk/assert";
import * as sst from "@serverless-stack/resources";
import KCMStack from "../lib/KCMStack";

test("Test Stack", () => {
  const app = new sst.App();
  // WHEN
  const stack = new KCMStack(app, "test-stack");
  // THEN
  expect(stack).to(haveResource("AWS::Lambda::Function"));
});
