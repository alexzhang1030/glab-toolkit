import { context } from "@/context";
import * as gitUtils from "@/git";
import {
  createApi,
  execWithOutput,
  getInputOrThrow,
  getOptionalInput,
  setup,
} from "@/utils";
import { exec } from "@actions/exec";
import { to } from "await-to-js";
import { defineCommand } from "citty";

export const execCommand = defineCommand({
  meta: {
    name: "exec",
    description: "Execute a command",
  },
  setup() {
    setup();
  },
  async run() {
    const command = getInputOrThrow("command");
    const inputBranch = getInputOrThrow("branch");
    const mrTitle = getInputOrThrow("title");
    const mrTargetBranch = getOptionalInput("target_branch") || context.ref;
    const removeSourceBranch =
      getOptionalInput("remove_source_branch") === "true";
    const description = getOptionalInput("description") ?? "";
    const labels = getOptionalInput("labels")
      ?.split(",")
      .map((x) => x.trim());
    const commitMessage = getOptionalInput("commit_message") || "chore: update";

    const [err, res] = await to(execWithOutput(command));
    if (err != null || res.code !== 0) {
      throw err;
    }
    const treeClean = await gitUtils.checkIfClean();
    if (treeClean) {
      console.log("Tree is clean, skipping commit");
      return 0;
    }
    // commit changes
    const api = createApi();
    const currentBranch = context.ref;
    const execBranch = `glab-toolkit/${inputBranch}`;
    await gitUtils.switchToMaybeExistingBranch(execBranch);
    await exec("git", ["fetch", "origin", currentBranch]);
    await gitUtils.reset(`origin/${currentBranch}`);

    await gitUtils.commitAll(commitMessage);
    await gitUtils.push(execBranch, { force: true });
    const searchResult = await api.MergeRequests.all({
      projectId: context.projectId,
      state: "opened",
      sourceBranch: execBranch,
      target_branch: mrTargetBranch,
      maxPages: 1,
      perPage: 1,
    });
    console.log(JSON.stringify(searchResult, null, 2));
    if (searchResult.length === 0) {
      console.log(
        `creating merge request from ${execBranch} to ${mrTargetBranch}.`
      );
      await api.MergeRequests.create(
        context.projectId,
        execBranch,
        mrTargetBranch,
        mrTitle,
        {
          description,
          removeSourceBranch,
          labels,
        }
      );
    } else {
      console.log(`updating found merge request !${searchResult[0].iid}`);
      await api.MergeRequests.edit(context.projectId, searchResult[0].iid, {
        title: mrTitle,
        description,
        removeSourceBranch,
        labels,
      });
    }
  },
});
