"use client";

import { CopilotKit } from "@copilotkit/react-core/v2";
import { NewsletterEditor } from "./newsletter-editor";

export function EditorShell() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <NewsletterEditor />
    </CopilotKit>
  );
}
