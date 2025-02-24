import type { Gitlab as GitlabType } from '@gitbeaker/core'
import type {
  ProxyAgentConfigurationType,
} from 'global-agent'
import type { Buffer } from 'node:buffer'
import * as process from 'node:process'
import { getInput } from '@actions/core'
import { exec } from '@actions/exec'
import { Gitlab } from '@gitbeaker/rest'
import {
  bootstrap as bootstrapNetworkAgent,
} from 'global-agent'
import { setupUser } from './git'

export function identify<T>(
  _: T,
): _ is Exclude<
  T,
  '' | (T extends boolean ? false : boolean) | null | undefined
> {
  return !!_
}

export async function execWithOutput(
  command: string,
  args?: string[],
  options?: { ignoreReturnCode?: boolean, cwd?: string },
) {
  let myOutput = ''
  let myError = ''

  return {
    code: await exec(command, args, {
      listeners: {
        stdout: (data: Buffer) => {
          myOutput += data.toString()
        },
        stderr: (data: Buffer) => {
          myError += data.toString()
        },
      },
      ...options,
    }),
    stdout: myOutput,
    stderr: myError,
  }
}

export const getOptionalInput = (name: string) => getInput(name) || undefined

export function getInputOrThrow(name: string) {
  const value = getInput(name)
  if (!value) {
    throw new Error(`Env ${name} is required`)
  }
  return value
}

const PROXY_PROPS = ['http_proxy', 'https_proxy', 'no_proxy'] as const

declare global {
  const GLOBAL_AGENT: {
    HTTP_PROXY: string | null
    HTTPS_PROXY: string | null
    NO_PROXY: string | null
  }
}

export function createApi(gitlabToken?: string) {
  bootstrapNetworkAgent()

  for (const prop of PROXY_PROPS) {
    const uProp = prop.toUpperCase() as keyof ProxyAgentConfigurationType
    const value = process.env[uProp] || process.env[prop]
    if (value) {
      GLOBAL_AGENT[uProp] = value
    }
  }

  const token = gitlabToken || process.env.GITLAB_TOKEN
  const host = process.env.GITLAB_HOST

  if (process.env.GITLAB_TOKEN_TYPE === 'oauth') {
    return new Gitlab({
      host,
      oauthToken: token,
    })
  }

  return new Gitlab({
    host,
    token,
  })
}

function getUsername(api: GitlabType) {
  return (
    process.env.GITLAB_CI_USER_NAME
    ?? api.Users.showCurrentUser().then(currentUser => currentUser.username)
  )
}

export async function setup() {
  const { CI, GITLAB_HOST, GITLAB_TOKEN, CI_PROJECT_PATH } = process.env
  if (!CI)
    return
  console.log('setting git user')
  await setupUser()
  const url = new URL(GITLAB_HOST!)
  console.log('setting GitLab credentials')
  const username = await getUsername(createApi())

  await exec(
    'git',
    [
      'remote',
      'set-url',
      'origin',
      `${url.protocol}//${username}:${GITLAB_TOKEN}@${
        url.host
      }${url.pathname.replace(/\/$/, '')}/${CI_PROJECT_PATH}.git`,
    ],
    { silent: true },
  )
}
