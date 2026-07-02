---
'@mastra/core': patch
---

Fix `modelContent(stepNumber)` dropping the first step's content and mis-numbering later steps. Assistant steps are stored beginning with a `step-start` marker, but the step extractor counted a leading marker as a step boundary, so step 1 read as empty and every later step number was off by one. A leading `step-start` is now treated as the beginning of step 1 rather than a separator, so per-step `StepResult.content` is correct. Closes #18774.
