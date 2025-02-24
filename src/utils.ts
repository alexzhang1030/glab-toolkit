import type { Buffer } from 'node:buffer'
import { exec } from '@actions/exec'

export function identify<T>(_: T): _ is Exclude<
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
