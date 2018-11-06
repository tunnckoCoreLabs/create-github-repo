import proc from 'process';
import axios from 'axios';
import parse from 'parse-git-config';

// TODO: externalize
export default async function createGithubRepo(options) {
  const opts = Object.assign({ auto_init: true, has_wiki: false }, options);

  let githubToken =
    opts.github_token ||
    (opts.author && opts.author.github_token) ||
    opts.token ||
    (!proc.env.ASIA_CLI && (proc.env.GH_TOKEN || proc.env.GITHUB_TOKEN));

  if (!githubToken) {
    const gitconfig = await parse({ type: 'global' });
    githubToken =
      (gitconfig.user && gitconfig.user.token) ||
      (gitconfig.github && gitconfig.github.token);
  }

  if (!githubToken) {
    throw new Error('Requires GitHub token, but not found.');
  }

  opts.name = opts.repo || opts.name;
  opts.homepage = (opts.project && opts.project.homepage) || opts.homepage;
  opts.description =
    (opts.project && opts.project.description) || opts.description;

  const endpoint =
    opts.ownerType === 'org' ? `/orgs/${opts.owner}/repos` : `/user/repos`;

  return axios({
    url: `https://api.github.com${endpoint}`,
    method: 'post',
    headers: {
      Authorization: `token ${githubToken}`,
    },
    data: opts,
  });
}
