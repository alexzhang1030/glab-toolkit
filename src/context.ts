import * as process from 'node:process'

export const projectId = process.env.CI_PROJECT_ID!
export const ref = process.env.CI_COMMIT_REF_NAME!
