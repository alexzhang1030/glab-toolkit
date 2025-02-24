import { execWithOutput } from '@/utils'
import { to } from 'await-to-js'
import { defineCommand } from 'citty'

export const execCommand = defineCommand({
  meta: {
    name: 'exec',
    description: 'Execute a command',
  },
  args: {
    command: {
      type: 'positional',
      required: true,
      description: 'Command to execute',
      valueHint: 'npm run build',
    },
    branch: {
      type: 'string',
      required: true,
      description: 'Branch to execute the command on',
      valueHint: 'main',
    },
    mrTitle: {
      type: 'string',
      description: 'Title of the merge request',
      valueHint: 'Update dependencies',
      required: true,
    },
    mrDescription: {
      type: 'string',
      description: 'Description of the merge request',
      valueHint: 'This MR updates dependencies',
      required: false,
    },
  },
  async run({ args }) {
    const { command, branch, mrTitle, mrDescription } = args
    const [err, res] = await to(execWithOutput(command))
    if (err != null || res.code !== 0) {
      throw err
    }
  },
})
