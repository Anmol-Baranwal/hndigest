import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent, InMemoryAgentRunner } from "@copilotkit/runtime/v2";
import { NextRequest } from "next/server";

const runtime = new CopilotRuntime({
  agents: {
    default: new BuiltInAgent({ model: "openai:gpt-4o" }),
  },
  runner: new InMemoryAgentRunner(),
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
