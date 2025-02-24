import { exec } from '@actions/exec'
import { env } from './env'
import { execWithOutput, identify } from './utils'

export async function setupUser() {
  await exec('git', [
    'config',
    'user.name',
    env.GITLAB_CI_USER_NAME || env.GITLAB_USER_NAME,
  ])
  await exec('git', ['config', 'user.email', env.GITLAB_CI_USER_EMAIL])
}

export async function pullBranch(branch: string) {
  await exec('git', ['pull', 'origin', branch])
}

export async function push(branch: string, { force }: { force?: boolean } = {}) {
  await exec(
    'git',
    ['push', 'origin', `HEAD:${branch}`, force && '--force'].filter(identify),
  )
}

export async function pushTags() {
  await exec('git', ['push', 'origin', '--tags'])
}

export async function switchToMaybeExistingBranch(branch: string) {
  const { stderr } = await execWithOutput('git', ['checkout', branch], {
    ignoreReturnCode: true,
  })
  const isCreatingBranch
    = !stderr.includes(`Switched to branch '${branch}'`)
    // it could be a detached HEAD
      && !stderr.includes(`Switched to a new branch '${branch}'`)
  if (isCreatingBranch) {
    await exec('git', ['checkout', '-b', branch])
  }
}

export async function reset(pathSpec: string, mode: 'hard' | 'mixed' | 'soft' = 'hard') {
  await exec('git', ['reset', `--${mode}`, pathSpec])
}

export async function commitAll(message: string) {
  await exec('git', ['add', '-A', '.'])
  await exec('git', ['commit', '-m', message])
}

export async function checkIfClean(): Promise<boolean> {
  const { stdout } = await execWithOutput('git', ['status', '--porcelain'])
  return stdout.length === 0
}
