import type { Buffer } from "node:buffer";
import { exec } from "@actions/exec";
import { getInput } from "@actions/core";
import {
  bootstrap as bootstrapNetworkAgent,
  ProxyAgentConfigurationType,
} from "global-agent";
import * as process from "process";
import { Gitlab } from "@gitbeaker/rest";
import { Gitlab as GitlabType } from "@gitbeaker/core";
import { setupUser } from "./git";

export function identify<T>(
  _: T
): _ is Exclude<
  T,
  "" | (T extends boolean ? false : boolean) | null | undefined
> {
  return !!_;
}

export async function execWithOutput(
  command: string,
  args?: string[],
  options?: { ignoreReturnCode?: boolean; cwd?: string }
) {
  let myOutput = "";
  let myError = "";

  return {
    code: await exec(command, args, {
      listeners: {
        stdout: (data: Buffer) => {
          myOutput += data.toString();
        },
        stderr: (data: Buffer) => {
          myError += data.toString();
        },
      },
      ...options,
    }),
    stdout: myOutput,
    stderr: myError,
  };
}

export const getOptionalInput = (name: string) => getInput(name) || undefined;

export const getInputOrThrow = (name: string) => {
  const value = getInput(name);
  if (!value) {
    throw new Error(`Env ${name} is required`);
  }
  return value;
};

const PROXY_PROPS = ["http_proxy", "https_proxy", "no_proxy"] as const;

declare global {
  const GLOBAL_AGENT: {
    HTTP_PROXY: string | null;
    HTTPS_PROXY: string | null;
    NO_PROXY: string | null;
  };
}

export const createApi = (gitlabToken?: string) => {
  bootstrapNetworkAgent();

  for (const prop of PROXY_PROPS) {
    const uProp = prop.toUpperCase() as keyof ProxyAgentConfigurationType;
    const value = process.env[uProp] || process.env[prop];
    if (value) {
      GLOBAL_AGENT[uProp] = value;
    }
  }

  const token = gitlabToken || process.env.GITLAB_TOKEN;
  const host = process.env.GITLAB_HOST;

  if (process.env.GITLAB_TOKEN_TYPE === "oauth") {
    return new Gitlab({
      host,
      oauthToken: token,
    });
  }

  return new Gitlab({
    host,
    token,
  });
};

const getUsername = (api: GitlabType) => {
  return (
    process.env.GITLAB_CI_USER_NAME ??
    api.Users.showCurrentUser().then((currentUser) => currentUser.username)
  );
};

export async function setup() {
  const { CI, GITLAB_HOST, GITLAB_TOKEN, CI_PROJECT_PATH } = process.env;
  if (!CI) return;
  console.log("setting git user");
  await setupUser();
  const url = new URL(GITLAB_HOST!);
  console.log("setting GitLab credentials");
  const username = await getUsername(createApi());

  await exec(
    "git",
    [
      "remote",
      "set-url",
      "origin",
      `${url.protocol}//${username}:${GITLAB_TOKEN}@${
        url.host
      }${url.pathname.replace(/\/$/, "")}/${CI_PROJECT_PATH}.git`,
    ],
    { silent: true }
  );
}
