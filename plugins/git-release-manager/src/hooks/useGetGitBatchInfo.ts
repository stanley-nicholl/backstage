/*
 * Copyright 2021 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useAsync } from 'react-use';

import { GitReleaseApi } from '../api/GitReleaseApiClient';
import { Project } from '../contexts/ProjectContext';

interface GetGitBatchInfo {
  project: Project;
  pluginApiClient: GitReleaseApi;
  refetchTrigger: number;
}

export const useGetGitBatchInfo = ({
  project,
  pluginApiClient,
  refetchTrigger,
}: GetGitBatchInfo) => {
  const gitBatchInfo = useAsync(async () => {
    const [{ repository }, { latestRelease }] = await Promise.all([
      pluginApiClient.getRepository({
        owner: project.owner,
        repo: project.repo,
      }),
      pluginApiClient.getLatestRelease({
        owner: project.owner,
        repo: project.repo,
      }),
    ]);

    if (latestRelease === null) {
      return {
        latestRelease,
        releaseBranch: null,
        repository,
      };
    }

    const releaseBranch = await pluginApiClient.getBranch({
      owner: project.owner,
      repo: project.repo,
      branch: latestRelease.targetCommitish,
    });

    return {
      latestRelease,
      releaseBranch,
      repository,
    };
  }, [project, refetchTrigger]);

  return {
    gitBatchInfo,
  };
};
