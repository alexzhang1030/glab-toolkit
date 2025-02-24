import * as process from 'node:process'

export const context = {
  projectId: process.env.CI_PROJECT_ID!,
  ref: process.env.CI_COMMIT_REF_NAME!,
};
