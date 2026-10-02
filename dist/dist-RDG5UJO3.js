import "./chunk-PZ5AY32C.js";

// ../@emulators/github/dist/index.js
import { createHmac, generateKeyPair } from "crypto";
import { randomBytes } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { timingSafeEqual } from "crypto";
import { createHash } from "crypto";
import { randomBytes as randomBytes2 } from "crypto";
import { randomBytes as randomBytes3 } from "crypto";
function getGitHubStore(store) {
  return {
    users: store.collection("github.users", ["login"]),
    orgs: store.collection("github.orgs", ["login"]),
    teams: store.collection("github.teams", ["org_id", "slug"]),
    teamMembers: store.collection("github.team_members", ["team_id", "user_id"]),
    teamRepos: store.collection("github.team_repos", ["team_id", "repo_id"]),
    repos: store.collection("github.repos", ["owner_id", "full_name"]),
    collaborators: store.collection("github.collaborators", ["repo_id", "user_id"]),
    issues: store.collection("github.issues", ["repo_id", "number"]),
    pullRequests: store.collection("github.pull_requests", ["repo_id", "number"]),
    labels: store.collection("github.labels", ["repo_id"]),
    milestones: store.collection("github.milestones", ["repo_id", "number"]),
    comments: store.collection("github.comments", ["repo_id"]),
    reviews: store.collection("github.reviews", ["repo_id", "pull_number"]),
    issueEvents: store.collection("github.issue_events", ["repo_id", "issue_number"]),
    branches: store.collection("github.branches", ["repo_id"]),
    branchProtections: store.collection("github.branch_protections", ["repo_id"]),
    refs: store.collection("github.refs", ["repo_id"]),
    commits: store.collection("github.commits", ["repo_id", "sha"]),
    trees: store.collection("github.trees", ["repo_id", "sha"]),
    blobs: store.collection("github.blobs", ["repo_id", "sha"]),
    tags: store.collection("github.tags", ["repo_id"]),
    releases: store.collection("github.releases", ["repo_id"]),
    releaseAssets: store.collection("github.release_assets", ["release_id", "repo_id"]),
    webhooks: store.collection("github.webhooks", ["repo_id", "org_id"]),
    workflows: store.collection("github.workflows", ["repo_id"]),
    workflowRuns: store.collection("github.workflow_runs", ["repo_id", "workflow_id"]),
    jobs: store.collection("github.jobs", ["run_id"]),
    artifacts: store.collection("github.artifacts", ["run_id", "repo_id"]),
    secrets: store.collection("github.secrets", ["repo_id", "org_id"]),
    checkRuns: store.collection("github.check_runs", ["repo_id", "head_sha"]),
    checkSuites: store.collection("github.check_suites", ["repo_id", "head_sha"]),
    oauthApps: store.collection("github.oauth_apps", ["client_id"]),
    apps: store.collection("github.apps", ["slug"]),
    appInstallations: store.collection("github.app_installations", [
      "app_id",
      "installation_id"
    ]),
    installationTokenMetadata: store.collection("github.installation_token_metadata", [
      "app_id",
      "installation_id"
    ]),
    oauthGrants: store.collection("github.oauth_grants", ["user_id", "client_id"])
  };
}
function generateNodeId(type, id) {
  return Buffer.from(`0:${type}${id}`).toString("base64").replace(/=+$/, "");
}
function generateSha() {
  return randomBytes(20).toString("hex");
}
function timestamp() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function userUrl(baseUrl, login) {
  return {
    url: `${baseUrl}/users/${login}`,
    html_url: `${baseUrl}/${login}`,
    repos_url: `${baseUrl}/users/${login}/repos`,
    followers_url: `${baseUrl}/users/${login}/followers`,
    following_url: `${baseUrl}/users/${login}/following{/other_user}`,
    gists_url: `${baseUrl}/users/${login}/gists{/gist_id}`,
    starred_url: `${baseUrl}/users/${login}/starred{/owner}{/repo}`,
    subscriptions_url: `${baseUrl}/users/${login}/subscriptions`,
    organizations_url: `${baseUrl}/users/${login}/orgs`,
    events_url: `${baseUrl}/users/${login}/events{/privacy}`,
    received_events_url: `${baseUrl}/users/${login}/received_events`,
    avatar_url: `${baseUrl}/avatars/u/${login}`
  };
}
function formatUser(user, baseUrl) {
  const urls = userUrl(baseUrl, user.login);
  return {
    login: user.login,
    id: user.id,
    node_id: user.node_id,
    avatar_url: urls.avatar_url,
    gravatar_id: user.gravatar_id,
    url: urls.url,
    html_url: urls.html_url,
    followers_url: urls.followers_url,
    following_url: urls.following_url,
    gists_url: urls.gists_url,
    starred_url: urls.starred_url,
    subscriptions_url: urls.subscriptions_url,
    organizations_url: urls.organizations_url,
    repos_url: urls.repos_url,
    events_url: urls.events_url,
    received_events_url: urls.received_events_url,
    type: user.type,
    site_admin: user.site_admin,
    user_view_type: "public"
  };
}
function formatUserFull(user, baseUrl) {
  return {
    ...formatUser(user, baseUrl),
    name: user.name,
    company: user.company,
    blog: user.blog,
    location: user.location,
    email: user.email,
    hireable: user.hireable,
    bio: user.bio,
    twitter_username: user.twitter_username,
    public_repos: user.public_repos,
    public_gists: user.public_gists,
    followers: user.followers,
    following: user.following,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}
function formatOwner(store, ownerId, ownerType, baseUrl) {
  if (ownerType === "Organization") {
    const org = store.orgs.get(ownerId);
    if (!org) return null;
    return formatOrgBrief(org, baseUrl);
  }
  const user = store.users.get(ownerId);
  if (!user) return null;
  return formatUser(user, baseUrl);
}
function formatOrgBrief(org, baseUrl) {
  return {
    login: org.login,
    id: org.id,
    node_id: org.node_id,
    url: `${baseUrl}/orgs/${org.login}`,
    html_url: `${baseUrl}/${org.login}`,
    repos_url: `${baseUrl}/orgs/${org.login}/repos`,
    events_url: `${baseUrl}/orgs/${org.login}/events`,
    hooks_url: `${baseUrl}/orgs/${org.login}/hooks`,
    issues_url: `${baseUrl}/orgs/${org.login}/issues`,
    members_url: `${baseUrl}/orgs/${org.login}/members{/member}`,
    public_members_url: `${baseUrl}/orgs/${org.login}/public_members{/member}`,
    avatar_url: `${baseUrl}/avatars/o/${org.login}`,
    description: org.description,
    type: "Organization",
    site_admin: false,
    user_view_type: "public"
  };
}
function permissionsFromLevel(level) {
  const levels = ["pull", "triage", "push", "maintain", "admin"];
  const idx = levels.indexOf(level);
  return {
    admin: idx >= 4,
    maintain: idx >= 3,
    push: idx >= 2,
    triage: idx >= 1,
    pull: idx >= 0
  };
}
function computeRepoPermissions(store, repo, authUserId) {
  if (repo.owner_type === "User" && repo.owner_id === authUserId) {
    return { admin: true, maintain: true, push: true, triage: true, pull: true };
  }
  if (repo.owner_type === "Organization") {
    for (const team of store.teams.all()) {
      if (team.org_id !== repo.owner_id) continue;
      const member = store.teamMembers.findBy("team_id", team.id).find((m) => m.user_id === authUserId);
      if (member) {
        return { admin: true, maintain: true, push: true, triage: true, pull: true };
      }
    }
  }
  const collab = store.collaborators.findBy("repo_id", repo.id).find((c) => c.user_id === authUserId);
  if (collab) {
    return permissionsFromLevel(collab.permission);
  }
  if (!repo.private) {
    return { admin: false, maintain: false, push: false, triage: false, pull: true };
  }
  return { admin: false, maintain: false, push: false, triage: false, pull: false };
}
function computeAuthorAssociation(store, userId, repoId) {
  const repo = store.repos.get(repoId);
  if (!repo) return "NONE";
  if (repo.owner_type === "User" && repo.owner_id === userId) return "OWNER";
  if (repo.owner_type === "Organization") {
    for (const team of store.teams.all()) {
      if (team.org_id !== repo.owner_id) continue;
      const member = store.teamMembers.findBy("team_id", team.id).find((m) => m.user_id === userId);
      if (member) return "MEMBER";
    }
  }
  const collab = store.collaborators.findBy("repo_id", repoId).find((c) => c.user_id === userId);
  if (collab) return "COLLABORATOR";
  return "NONE";
}
function formatOrgFull(org, baseUrl) {
  return {
    ...formatOrgBrief(org, baseUrl),
    name: org.name,
    company: org.company,
    blog: org.blog,
    location: org.location,
    email: org.email,
    twitter_username: org.twitter_username,
    is_verified: org.is_verified,
    has_organization_projects: org.has_organization_projects,
    has_repository_projects: org.has_repository_projects,
    public_repos: org.public_repos,
    public_gists: org.public_gists,
    followers: org.followers,
    following: org.following,
    created_at: org.created_at,
    updated_at: org.updated_at,
    members_can_create_repositories: org.members_can_create_repositories,
    default_repository_permission: org.default_repository_permission,
    billing_email: org.billing_email ?? null
  };
}
function formatRepo(repo, store, baseUrl, authUserId) {
  const owner = formatOwner(store, repo.owner_id, repo.owner_type, baseUrl);
  const ownerLogin2 = owner?.login ?? "unknown";
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  const htmlUrl = `${baseUrl}/${repo.full_name}`;
  return {
    id: repo.id,
    node_id: repo.node_id,
    name: repo.name,
    full_name: repo.full_name,
    private: repo.private,
    owner,
    html_url: htmlUrl,
    description: repo.description,
    fork: repo.fork,
    url: repoUrl,
    forks_url: `${repoUrl}/forks`,
    keys_url: `${repoUrl}/keys{/key_id}`,
    collaborators_url: `${repoUrl}/collaborators{/collaborator}`,
    teams_url: `${repoUrl}/teams`,
    hooks_url: `${repoUrl}/hooks`,
    issue_events_url: `${repoUrl}/issues/events{/number}`,
    events_url: `${repoUrl}/events`,
    assignees_url: `${repoUrl}/assignees{/user}`,
    branches_url: `${repoUrl}/branches{/branch}`,
    tags_url: `${repoUrl}/tags`,
    blobs_url: `${repoUrl}/git/blobs{/sha}`,
    git_tags_url: `${repoUrl}/git/tags{/sha}`,
    git_refs_url: `${repoUrl}/git/ref{/sha}`,
    trees_url: `${repoUrl}/git/trees{/sha}`,
    statuses_url: `${repoUrl}/statuses/{sha}`,
    languages_url: `${repoUrl}/languages`,
    stargazers_url: `${repoUrl}/stargazers`,
    contributors_url: `${repoUrl}/contributors`,
    subscribers_url: `${repoUrl}/subscribers`,
    subscription_url: `${repoUrl}/subscription`,
    commits_url: `${repoUrl}/commits{/sha}`,
    git_commits_url: `${repoUrl}/git/commits{/sha}`,
    comments_url: `${repoUrl}/comments{/number}`,
    issue_comment_url: `${repoUrl}/issues/comments{/number}`,
    contents_url: `${repoUrl}/contents/{+path}`,
    compare_url: `${repoUrl}/compare/{base}...{head}`,
    merges_url: `${repoUrl}/merges`,
    archive_url: `${repoUrl}/{archive_format}{/ref}`,
    downloads_url: `${repoUrl}/downloads`,
    issues_url: `${repoUrl}/issues{/number}`,
    pulls_url: `${repoUrl}/pulls{/number}`,
    milestones_url: `${repoUrl}/milestones{/number}`,
    notifications_url: `${repoUrl}/notifications{?since,all,participating}`,
    labels_url: `${repoUrl}/labels{/name}`,
    releases_url: `${repoUrl}/releases{/id}`,
    deployments_url: `${repoUrl}/deployments`,
    created_at: repo.created_at,
    updated_at: repo.updated_at,
    pushed_at: repo.pushed_at,
    git_url: `git://${baseUrl.replace(/^https?:\/\//, "")}/${repo.full_name}.git`,
    ssh_url: `git@${baseUrl.replace(/^https?:\/\//, "")}:${repo.full_name}.git`,
    clone_url: `${htmlUrl}.git`,
    svn_url: htmlUrl,
    homepage: repo.homepage,
    size: repo.size,
    stargazers_count: repo.stargazers_count,
    watchers_count: repo.watchers_count,
    language: repo.language,
    has_issues: repo.has_issues,
    has_projects: repo.has_projects,
    has_downloads: repo.has_downloads,
    has_wiki: repo.has_wiki,
    has_pages: repo.has_pages,
    has_discussions: repo.has_discussions,
    forks_count: repo.forks_count,
    mirror_url: null,
    archived: repo.archived,
    disabled: repo.disabled,
    open_issues_count: repo.open_issues_count,
    license: repo.license,
    allow_forking: repo.allow_forking,
    is_template: repo.is_template,
    topics: repo.topics,
    visibility: repo.visibility,
    forks: repo.forks_count,
    open_issues: repo.open_issues_count,
    watchers: repo.watchers_count,
    default_branch: repo.default_branch,
    permissions: authUserId !== void 0 ? computeRepoPermissions(store, repo, authUserId) : {
      admin: true,
      maintain: true,
      push: true,
      triage: true,
      pull: true
    },
    allow_rebase_merge: repo.allow_rebase_merge,
    allow_squash_merge: repo.allow_squash_merge,
    allow_merge_commit: repo.allow_merge_commit,
    allow_auto_merge: repo.allow_auto_merge,
    delete_branch_on_merge: repo.delete_branch_on_merge
  };
}
function formatIssue(issue, store, baseUrl) {
  const repo = store.repos.get(issue.repo_id);
  if (!repo) return null;
  const user = store.users.get(issue.user_id);
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  const labels = issue.label_ids.map((id) => store.labels.get(id)).filter(Boolean).map((l) => formatLabel(l, repo, baseUrl));
  const assignees = issue.assignee_ids.map((id) => store.users.get(id)).filter(Boolean).map((u) => formatUser(u, baseUrl));
  const milestone = issue.milestone_id ? store.milestones.get(issue.milestone_id) : null;
  const closedBy = issue.closed_by_id ? store.users.get(issue.closed_by_id) : null;
  return {
    url: `${repoUrl}/issues/${issue.number}`,
    repository_url: repoUrl,
    labels_url: `${repoUrl}/issues/${issue.number}/labels{/name}`,
    comments_url: `${repoUrl}/issues/${issue.number}/comments`,
    events_url: `${repoUrl}/issues/${issue.number}/events`,
    html_url: `${baseUrl}/${repo.full_name}/issues/${issue.number}`,
    id: issue.id,
    node_id: issue.node_id,
    number: issue.number,
    title: issue.title,
    user: user ? formatUser(user, baseUrl) : null,
    labels,
    state: issue.state,
    state_reason: issue.state_reason,
    locked: issue.locked,
    active_lock_reason: issue.active_lock_reason,
    assignee: assignees[0] ?? null,
    assignees,
    milestone: milestone ? formatMilestone(milestone, repo, store, baseUrl) : null,
    comments: issue.comments,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    closed_at: issue.closed_at,
    closed_by: closedBy ? formatUser(closedBy, baseUrl) : null,
    body: issue.body,
    reactions: defaultReactions(`${repoUrl}/issues/${issue.number}`),
    timeline_url: `${repoUrl}/issues/${issue.number}/timeline`,
    performed_via_github_app: null,
    author_association: computeAuthorAssociation(store, issue.user_id, issue.repo_id)
  };
}
function formatPullRequest(pr, store, baseUrl) {
  const repo = store.repos.get(pr.repo_id);
  if (!repo) return null;
  const user = store.users.get(pr.user_id);
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  const headRepo = store.repos.get(pr.head_repo_id);
  const baseRepo = store.repos.get(pr.base_repo_id);
  const labels = pr.label_ids.map((id) => store.labels.get(id)).filter(Boolean).map((l) => formatLabel(l, repo, baseUrl));
  const assignees = pr.assignee_ids.map((id) => store.users.get(id)).filter(Boolean).map((u) => formatUser(u, baseUrl));
  const requestedReviewers = pr.requested_reviewer_ids.map((id) => store.users.get(id)).filter(Boolean).map((u) => formatUser(u, baseUrl));
  const requestedTeams = pr.requested_team_ids.map((id) => store.teams.get(id)).filter(Boolean).map((t) => formatTeamBrief(t, store, baseUrl));
  const milestone = pr.milestone_id ? store.milestones.get(pr.milestone_id) : null;
  const mergedBy = pr.merged_by_id ? store.users.get(pr.merged_by_id) : null;
  return {
    url: `${repoUrl}/pulls/${pr.number}`,
    id: pr.id,
    node_id: pr.node_id,
    html_url: `${baseUrl}/${repo.full_name}/pull/${pr.number}`,
    diff_url: `${baseUrl}/${repo.full_name}/pull/${pr.number}.diff`,
    patch_url: `${baseUrl}/${repo.full_name}/pull/${pr.number}.patch`,
    issue_url: `${repoUrl}/issues/${pr.number}`,
    number: pr.number,
    state: pr.state,
    locked: pr.locked,
    title: pr.title,
    user: user ? formatUser(user, baseUrl) : null,
    body: pr.body,
    created_at: pr.created_at,
    updated_at: pr.updated_at,
    closed_at: pr.closed_at,
    merged_at: pr.merged_at,
    merge_commit_sha: pr.merge_commit_sha,
    assignee: assignees[0] ?? null,
    assignees,
    requested_reviewers: requestedReviewers,
    requested_teams: requestedTeams,
    labels,
    milestone: milestone ? formatMilestone(milestone, repo, store, baseUrl) : null,
    draft: pr.draft,
    commits_url: `${repoUrl}/pulls/${pr.number}/commits`,
    review_comments_url: `${repoUrl}/pulls/${pr.number}/comments`,
    review_comment_url: `${repoUrl}/pulls/comments{/number}`,
    comments_url: `${repoUrl}/issues/${pr.number}/comments`,
    statuses_url: `${repoUrl}/statuses/${pr.head_sha}`,
    head: {
      label: `${headRepo?.full_name?.split("/")[0] ?? "unknown"}:${pr.head_ref}`,
      ref: pr.head_ref,
      sha: pr.head_sha,
      user: headRepo ? formatOwner(store, headRepo.owner_id, headRepo.owner_type, baseUrl) : null,
      repo: headRepo ? formatRepo(headRepo, store, baseUrl) : null
    },
    base: {
      label: `${baseRepo?.full_name?.split("/")[0] ?? "unknown"}:${pr.base_ref}`,
      ref: pr.base_ref,
      sha: pr.base_sha,
      user: baseRepo ? formatOwner(store, baseRepo.owner_id, baseRepo.owner_type, baseUrl) : null,
      repo: baseRepo ? formatRepo(baseRepo, store, baseUrl) : null
    },
    _links: {
      self: { href: `${repoUrl}/pulls/${pr.number}` },
      html: { href: `${baseUrl}/${repo.full_name}/pull/${pr.number}` },
      issue: { href: `${repoUrl}/issues/${pr.number}` },
      comments: { href: `${repoUrl}/issues/${pr.number}/comments` },
      review_comments: { href: `${repoUrl}/pulls/${pr.number}/comments` },
      review_comment: { href: `${repoUrl}/pulls/comments{/number}` },
      commits: { href: `${repoUrl}/pulls/${pr.number}/commits` },
      statuses: { href: `${repoUrl}/statuses/${pr.head_sha}` }
    },
    author_association: computeAuthorAssociation(store, pr.user_id, pr.repo_id),
    auto_merge: pr.auto_merge,
    merged: pr.merged,
    mergeable: pr.mergeable,
    rebaseable: true,
    mergeable_state: pr.mergeable_state,
    merged_by: mergedBy ? formatUser(mergedBy, baseUrl) : null,
    comments: pr.comments,
    review_comments: pr.review_comments,
    maintainer_can_modify: true,
    commits: pr.commits,
    additions: pr.additions,
    deletions: pr.deletions,
    changed_files: pr.changed_files
  };
}
function formatLabel(label, repo, baseUrl) {
  return {
    id: label.id,
    node_id: label.node_id,
    url: `${baseUrl}/repos/${repo.full_name}/labels/${encodeURIComponent(label.name)}`,
    name: label.name,
    description: label.description,
    color: label.color,
    default: label.default
  };
}
function formatMilestone(m, repo, store, baseUrl) {
  const creator = store.users.get(m.creator_id);
  return {
    url: `${baseUrl}/repos/${repo.full_name}/milestones/${m.number}`,
    html_url: `${baseUrl}/${repo.full_name}/milestone/${m.number}`,
    labels_url: `${baseUrl}/repos/${repo.full_name}/milestones/${m.number}/labels`,
    id: m.id,
    node_id: m.node_id,
    number: m.number,
    title: m.title,
    description: m.description,
    creator: creator ? formatUser(creator, baseUrl) : null,
    open_issues: m.open_issues,
    closed_issues: m.closed_issues,
    state: m.state,
    created_at: m.created_at,
    updated_at: m.updated_at,
    due_on: m.due_on,
    closed_at: m.closed_at
  };
}
function formatComment(comment, store, baseUrl) {
  const repo = store.repos.get(comment.repo_id);
  if (!repo) return null;
  const user = store.users.get(comment.user_id);
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  if (comment.comment_type === "issue") {
    return {
      url: `${repoUrl}/issues/comments/${comment.id}`,
      html_url: `${baseUrl}/${repo.full_name}/issues/${comment.issue_number}#issuecomment-${comment.id}`,
      issue_url: `${repoUrl}/issues/${comment.issue_number}`,
      id: comment.id,
      node_id: comment.node_id,
      user: user ? formatUser(user, baseUrl) : null,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      author_association: computeAuthorAssociation(store, comment.user_id, comment.repo_id),
      body: comment.body,
      reactions: defaultReactions(`${repoUrl}/issues/comments/${comment.id}`),
      performed_via_github_app: null
    };
  }
  if (comment.comment_type === "review") {
    return {
      url: `${repoUrl}/pulls/comments/${comment.id}`,
      html_url: `${baseUrl}/${repo.full_name}/pull/${comment.pull_number}#discussion_r${comment.id}`,
      pull_request_url: `${repoUrl}/pulls/${comment.pull_number}`,
      id: comment.id,
      node_id: comment.node_id,
      diff_hunk: "",
      path: comment.path ?? "",
      position: comment.position,
      original_position: comment.position,
      commit_id: comment.commit_sha ?? "",
      original_commit_id: comment.commit_sha ?? "",
      in_reply_to_id: comment.in_reply_to_id,
      user: user ? formatUser(user, baseUrl) : null,
      body: comment.body,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      author_association: computeAuthorAssociation(store, comment.user_id, comment.repo_id),
      reactions: defaultReactions(`${repoUrl}/pulls/comments/${comment.id}`),
      line: comment.line,
      side: comment.side ?? "RIGHT",
      subject_type: comment.subject_type ?? "line",
      pull_request_review_id: comment.review_id
    };
  }
  return {
    url: `${repoUrl}/comments/${comment.id}`,
    html_url: `${baseUrl}/${repo.full_name}/commit/${comment.commit_sha}#commitcomment-${comment.id}`,
    id: comment.id,
    node_id: comment.node_id,
    user: user ? formatUser(user, baseUrl) : null,
    body: comment.body,
    path: comment.path,
    position: comment.position,
    line: comment.line,
    commit_id: comment.commit_sha,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    author_association: computeAuthorAssociation(store, comment.user_id, comment.repo_id),
    reactions: defaultReactions(`${repoUrl}/comments/${comment.id}`)
  };
}
function formatReview(review, store, baseUrl) {
  const repo = store.repos.get(review.repo_id);
  if (!repo) return null;
  const user = store.users.get(review.user_id);
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  return {
    id: review.id,
    node_id: review.node_id,
    user: user ? formatUser(user, baseUrl) : null,
    body: review.body ?? "",
    state: review.state,
    html_url: `${baseUrl}/${repo.full_name}/pull/${review.pull_number}#pullrequestreview-${review.id}`,
    pull_request_url: `${repoUrl}/pulls/${review.pull_number}`,
    _links: {
      html: { href: `${baseUrl}/${repo.full_name}/pull/${review.pull_number}#pullrequestreview-${review.id}` },
      pull_request: { href: `${repoUrl}/pulls/${review.pull_number}` }
    },
    submitted_at: review.submitted_at,
    commit_id: review.commit_id,
    author_association: computeAuthorAssociation(store, review.user_id, review.repo_id),
    created_at: review.created_at,
    updated_at: review.updated_at
  };
}
function formatTeamBrief(team, store, baseUrl) {
  const org = store.orgs.get(team.org_id);
  return {
    id: team.id,
    node_id: team.node_id,
    url: `${baseUrl}/teams/${team.id}`,
    html_url: `${baseUrl}/orgs/${org?.login}/teams/${team.slug}`,
    name: team.name,
    slug: team.slug,
    description: team.description,
    privacy: team.privacy,
    permission: team.permission,
    members_url: `${baseUrl}/teams/${team.id}/members{/member}`,
    repositories_url: `${baseUrl}/teams/${team.id}/repos`
  };
}
function formatBranch(branch, repo, baseUrl) {
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  return {
    name: branch.name,
    commit: {
      sha: branch.sha,
      url: `${repoUrl}/commits/${branch.sha}`
    },
    protected: branch.protected,
    protection_url: `${repoUrl}/branches/${branch.name}/protection`
  };
}
function formatRelease(release, store, baseUrl) {
  const repo = store.repos.get(release.repo_id);
  if (!repo) return null;
  const author = store.users.get(release.author_id);
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  const assets = store.releaseAssets.findBy("release_id", release.id);
  return {
    url: `${repoUrl}/releases/${release.id}`,
    html_url: `${baseUrl}/${repo.full_name}/releases/tag/${release.tag_name}`,
    assets_url: `${repoUrl}/releases/${release.id}/assets`,
    upload_url: `${repoUrl}/releases/${release.id}/assets{?name,label}`,
    tarball_url: `${repoUrl}/tarball/${release.tag_name}`,
    zipball_url: `${repoUrl}/zipball/${release.tag_name}`,
    id: release.id,
    node_id: release.node_id,
    tag_name: release.tag_name,
    target_commitish: release.target_commitish,
    name: release.name,
    draft: release.draft,
    prerelease: release.prerelease,
    created_at: release.created_at,
    published_at: release.published_at,
    author: author ? formatUser(author, baseUrl) : null,
    assets: assets.map((a) => formatReleaseAsset(a, repo, baseUrl)),
    body: release.body
  };
}
function formatReleaseAsset(asset, repo, baseUrl) {
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  const uploader = null;
  return {
    url: `${repoUrl}/releases/assets/${asset.id}`,
    id: asset.id,
    node_id: asset.node_id,
    name: asset.name,
    label: asset.label,
    uploader,
    content_type: asset.content_type,
    state: asset.state,
    size: asset.size,
    download_count: asset.download_count,
    created_at: asset.created_at,
    updated_at: asset.updated_at,
    browser_download_url: `${baseUrl}/${repo.full_name}/releases/download/${asset.name}`
  };
}
function formatWebhook(wh, baseUrl, ownerPath) {
  const pathPrefix = wh.repo_id != null ? `repos/${ownerPath}` : `orgs/${ownerPath}`;
  return {
    type: wh.repo_id ? "Repository" : "Organization",
    id: wh.id,
    name: wh.name,
    active: wh.active,
    events: wh.events,
    config: {
      content_type: wh.config.content_type,
      insecure_ssl: wh.config.insecure_ssl,
      url: wh.config.url
    },
    updated_at: wh.updated_at,
    created_at: wh.created_at,
    url: `${baseUrl}/${pathPrefix}/hooks/${wh.id}`,
    test_url: `${baseUrl}/${pathPrefix}/hooks/${wh.id}/tests`,
    ping_url: `${baseUrl}/${pathPrefix}/hooks/${wh.id}/pings`,
    deliveries_url: `${baseUrl}/${pathPrefix}/hooks/${wh.id}/deliveries`,
    last_response: wh.last_response
  };
}
function defaultReactions(url) {
  return {
    url: `${url}/reactions`,
    total_count: 0,
    "+1": 0,
    "-1": 0,
    laugh: 0,
    hooray: 0,
    confused: 0,
    heart: 0,
    rocket: 0,
    eyes: 0
  };
}
function lookupRepo(store, owner, repoName) {
  const fullName = `${owner}/${repoName}`;
  return store.repos.findOneBy("full_name", fullName);
}
function lookupOwner(store, login) {
  const user = store.users.findOneBy("login", login);
  if (user) return { type: "User", id: user.id, login: user.login };
  const org = store.orgs.findOneBy("login", login);
  if (org) return { type: "Organization", id: org.id, login: org.login };
  return null;
}
function getNextIssueNumber(store, repoId) {
  const issues = store.issues.findBy("repo_id", repoId);
  const prs = store.pullRequests.findBy("repo_id", repoId);
  const maxIssue = issues.reduce((max, i) => Math.max(max, i.number), 0);
  const maxPr = prs.reduce((max, p) => Math.max(max, p.number), 0);
  return Math.max(maxIssue, maxPr) + 1;
}
function getNextMilestoneNumber(store, repoId) {
  const milestones = store.milestones.findBy("repo_id", repoId);
  return milestones.reduce((max, m) => Math.max(max, m.number), 0) + 1;
}
function createErrorHandler(documentationUrl) {
  return async (c, next) => {
    if (documentationUrl) {
      c.set("docsUrl", documentationUrl);
    }
    await next();
  };
}
var errorHandler = createErrorHandler();
var ApiError = class extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = "ApiError";
  }
};
function notFound(resource) {
  return new ApiError(404, resource ? `${resource} not found` : "Not Found");
}
function unauthorized() {
  return new ApiError(401, "Requires authentication");
}
function forbidden() {
  return new ApiError(403, "Forbidden");
}
async function parseJsonBody(c) {
  try {
    const body = await c.req.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      return body;
    }
    return {};
  } catch {
    throw new ApiError(400, "Problems parsing JSON");
  }
}
var isDebug = typeof process !== "undefined" && (process.env.DEBUG === "1" || process.env.DEBUG === "true" || process.env.EMULATE_DEBUG === "1");
function debug(label, ...args) {
  if (isDebug) {
    console.log(`[${label}]`, ...args);
  }
}
var __dirname = dirname(fileURLToPath(import.meta.url));
var FONTS = {
  "geist-sans.woff2": readFileSync(join(__dirname, "fonts", "geist-sans.woff2")),
  "GeistPixel-Square.woff2": readFileSync(join(__dirname, "fonts", "GeistPixel-Square.woff2"))
};
var FAVICON = readFileSync(join(__dirname, "fonts", "favicon.ico"));
function parsePagination(c) {
  const page = Math.max(1, parseInt(c.req.query("page") ?? "1", 10) || 1);
  const per_page = Math.min(100, Math.max(1, parseInt(c.req.query("per_page") ?? "30", 10) || 30));
  return { page, per_page };
}
function setLinkHeader(c, totalCount, page, perPage) {
  const lastPage = Math.max(1, Math.ceil(totalCount / perPage));
  const baseUrl = new URL(c.req.url);
  const links = [];
  const makeLink = (p, rel) => {
    baseUrl.searchParams.set("page", String(p));
    baseUrl.searchParams.set("per_page", String(perPage));
    return `<${baseUrl.toString()}>; rel="${rel}"`;
  };
  if (page < lastPage) {
    links.push(makeLink(page + 1, "next"));
    links.push(makeLink(lastPage, "last"));
  }
  if (page > 1) {
    links.push(makeLink(1, "first"));
    links.push(makeLink(page - 1, "prev"));
  }
  if (links.length > 0) {
    c.header("Link", links.join(", "));
  }
}
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
var CSS = `
.inspector-json{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.8125rem;line-height:1.6;max-height:70vh;overflow:auto}
.inspector-detail{padding:14px 0;border-bottom:1px solid #0a3300}
.inspector-detail summary{cursor:pointer;overflow-wrap:anywhere}
.inspector-action{display:inline-block;margin-top:12px;padding:8px 12px;border:1px solid #0a3300;border-radius:6px;background:#001a00;color:#33ff00;font:inherit;font-size:.8125rem;cursor:pointer}
.inspector-action:hover{background:#0a3300}
.inspector-scroll{overflow-x:auto}
@font-face{
  font-family:'Geist';font-style:normal;font-weight:100 900;font-display:swap;
  src:url('/_emulate/fonts/geist-sans.woff2') format('woff2');
}
@font-face{
  font-family:'Geist Pixel';font-style:normal;font-weight:400;font-display:swap;
  src:url('/_emulate/fonts/GeistPixel-Square.woff2') format('woff2');
}
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif;
  background:#000;color:#33ff00;min-height:100vh;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
}
.emu-bar{
  border-bottom:1px solid #0a3300;padding:10px 20px;
  display:flex;align-items:center;gap:10px;font-size:.8125rem;color:#1a8c00;
}
.emu-bar-title{font-weight:600;color:#33ff00;font-family:'Geist Pixel',monospace;}
.emu-bar-links{margin-left:auto;display:flex;gap:16px;}
.emu-bar-links a{
  color:#1a8c00;font-size:.75rem;text-decoration:none;transition:color .15s;
}
.emu-bar-links a:hover{color:#33ff00;}
.emu-bar-links a .full{display:inline;}
.emu-bar-links a .short{display:none;}
@media(max-width:600px){
  .emu-bar-links a .full{display:none;}
  .emu-bar-links a .short{display:inline;}
}

.content{
  display:flex;align-items:center;justify-content:center;
  min-height:calc(100vh - 42px);padding:24px 16px;
}
.content-inner{width:100%;max-width:420px;}
.card-title{
  font-family:'Geist Pixel',monospace;
  font-size:1.125rem;font-weight:600;margin-bottom:4px;color:#33ff00;
}
.card-subtitle{color:#1a8c00;font-size:.8125rem;margin-bottom:18px;line-height:1.45;}
.powered-by{
  position:fixed;bottom:0;left:0;right:0;
  text-align:center;padding:12px;font-size:.6875rem;color:#0a3300;
  font-family:'Geist Pixel',monospace;
}
.powered-by a{color:#1a8c00;text-decoration:none;transition:color .15s;}
.powered-by a:hover{color:#33ff00;}

.error-title{
  font-family:'Geist Pixel',monospace;
  color:#ff4444;font-size:1.125rem;font-weight:600;margin-bottom:8px;
}
.error-msg{color:#1a8c00;font-size:.875rem;line-height:1.5;}
.error-card{text-align:center;}

.user-form{margin-bottom:8px;}
.user-form:last-of-type{margin-bottom:0;}
.user-btn{
  width:100%;display:flex;align-items:center;gap:12px;
  padding:10px 12px;border:1px solid #0a3300;border-radius:8px;
  background:#000;color:inherit;cursor:pointer;text-align:left;
  font:inherit;transition:border-color .15s;
}
.user-btn:hover{border-color:#33ff00;}
.avatar{
  width:36px;height:36px;border-radius:50%;
  background:#0a3300;color:#33ff00;font-weight:600;font-size:.875rem;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  font-family:'Geist Pixel',monospace;
}
.user-text{min-width:0;}
.user-login{font-weight:600;font-size:.875rem;display:block;color:#33ff00;}
.user-meta{color:#1a8c00;font-size:.75rem;margin-top:1px;}
.user-email{font-size:.6875rem;color:#116600;word-break:break-all;margin-top:1px;}

.settings-layout{
  max-width:920px;margin:0 auto;padding:28px 20px;
  display:flex;gap:28px;
}
.settings-sidebar{width:200px;flex-shrink:0;}
.settings-sidebar a{
  display:block;padding:6px 10px;border-radius:6px;color:#1a8c00;
  text-decoration:none;font-size:.8125rem;transition:color .15s;
}
.settings-sidebar a:hover{color:#33ff00;}
.settings-sidebar a.active{color:#33ff00;font-weight:600;}
.settings-main{flex:1;min-width:0;}

.s-card{
  padding:18px 0;margin-bottom:14px;border-bottom:1px solid #0a3300;
}
.s-card:last-child{border-bottom:none;}
.s-card-header{display:flex;align-items:center;gap:14px;margin-bottom:14px;}
.s-icon{
  width:42px;height:42px;border-radius:8px;
  background:#0a3300;display:flex;align-items:center;justify-content:center;
  font-size:1.125rem;font-weight:700;color:#116600;flex-shrink:0;
  font-family:'Geist Pixel',monospace;
}
.s-title{
  font-family:'Geist Pixel',monospace;
  font-size:1.25rem;font-weight:600;color:#33ff00;
}
.s-subtitle{font-size:.75rem;color:#1a8c00;margin-top:2px;}
.section-heading{
  font-size:.9375rem;font-weight:600;margin-bottom:10px;color:#33ff00;
  display:flex;align-items:center;justify-content:space-between;
}
.perm-list{list-style:none;}
.perm-list li{padding:5px 0;font-size:.8125rem;display:flex;align-items:center;gap:6px;color:#1a8c00;}
.check{color:#33ff00;}
.org-row{
  display:flex;align-items:center;gap:8px;padding:7px 0;
  border-bottom:1px solid #0a3300;font-size:.8125rem;
}
.org-row:last-child{border-bottom:none;}
.org-icon{
  width:22px;height:22px;border-radius:4px;background:#0a3300;
  display:flex;align-items:center;justify-content:center;
  font-size:.625rem;font-weight:700;color:#116600;flex-shrink:0;
  font-family:'Geist Pixel',monospace;
}
.org-name{font-weight:600;color:#33ff00;}
.badge{font-size:.6875rem;padding:1px 7px;border-radius:999px;font-weight:500;}
.badge-granted{background:#0a3300;color:#33ff00;}
.badge-denied{background:#1a0a0a;color:#ff4444;}
.badge-requested{background:#0a3300;color:#1a8c00;}
.btn-revoke{
  display:inline-block;padding:5px 14px;border-radius:6px;
  border:1px solid #0a3300;background:transparent;color:#ff4444;
  font-size:.75rem;font-weight:600;cursor:pointer;transition:border-color .15s;
}
.btn-revoke:hover{border-color:#ff4444;}
.info-text{color:#1a8c00;font-size:.75rem;line-height:1.5;margin-top:10px;}
.app-link{
  display:flex;align-items:center;gap:12px;padding:12px;
  border:1px solid #0a3300;border-radius:8px;background:#000;
  text-decoration:none;color:inherit;margin-bottom:8px;transition:border-color .15s;
}
.app-link:hover{border-color:#33ff00;}
.app-link-name{font-weight:600;font-size:.875rem;color:#33ff00;}
.app-link-scopes{font-size:.6875rem;color:#1a8c00;margin-top:1px;}
.empty{color:#1a8c00;text-align:center;padding:28px 0;font-size:.875rem;}

.inspector-layout{max-width:960px;margin:0 auto;padding:28px 20px;}
.inspector-tabs{display:flex;gap:4px;margin-bottom:20px;}
.inspector-tabs a{
  padding:7px 16px;border-radius:6px;text-decoration:none;
  font-size:.8125rem;color:#1a8c00;border:1px solid transparent;
  transition:color .15s,border-color .15s;
}
.inspector-tabs a:hover{color:#33ff00;}
.inspector-tabs a.active{color:#33ff00;font-weight:600;border-color:#0a3300;background:#0a3300;}
.inspector-section{margin-bottom:24px;}
.inspector-section h2{
  font-family:'Geist Pixel',monospace;
  font-size:1rem;font-weight:600;color:#33ff00;margin-bottom:10px;
}
.inspector-section h3{
  font-family:'Geist Pixel',monospace;
  font-size:.875rem;font-weight:600;color:#1a8c00;margin:16px 0 8px;
}
.inspector-table{width:100%;border-collapse:collapse;margin-bottom:12px;}
.inspector-table th,.inspector-table td{
  text-align:left;padding:8px 12px;border-bottom:1px solid #0a3300;
  font-size:.8125rem;
}
.inspector-table th{color:#1a8c00;font-weight:600;font-size:.75rem;text-transform:uppercase;letter-spacing:.04em;}
.inspector-table td{color:#33ff00;}
.inspector-table tbody tr{transition:background .1s;}
.inspector-table tbody tr:hover{background:#0a3300;}
.inspector-empty{color:#1a8c00;text-align:center;padding:20px 0;font-size:.8125rem;}

.checkout-layout{
  display:flex;min-height:calc(100vh - 42px);
}
.checkout-summary{
  flex:1;background:#020;padding:48px 40px 48px 10%;
  display:flex;flex-direction:column;justify-content:center;
  border-right:1px solid #0a3300;
}
.checkout-form-side{
  flex:1;background:#000;padding:48px 10% 48px 40px;
  display:flex;flex-direction:column;justify-content:center;
}
.checkout-merchant{
  display:flex;align-items:center;gap:10px;margin-bottom:6px;
}
.checkout-merchant-name{
  font-family:'Geist Pixel',monospace;
  font-size:.9375rem;font-weight:600;color:#33ff00;
}
.checkout-test-badge{
  font-size:.625rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;
  background:#0a3300;color:#1a8c00;padding:2px 8px;border-radius:4px;
}
.checkout-total{
  font-family:'Geist Pixel',monospace;
  font-size:2rem;font-weight:700;color:#33ff00;margin:8px 0 28px;
}
.checkout-line-item{
  display:flex;align-items:center;gap:14px;padding:14px 0;
  border-bottom:1px solid #0a3300;
}
.checkout-line-item:first-child{border-top:1px solid #0a3300;}
.checkout-item-icon{
  width:42px;height:42px;border-radius:6px;background:#0a3300;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  font-family:'Geist Pixel',monospace;font-size:.875rem;font-weight:700;color:#116600;
}
.checkout-item-details{flex:1;min-width:0;}
.checkout-item-name{font-size:.875rem;font-weight:600;color:#33ff00;}
.checkout-item-qty{font-size:.75rem;color:#1a8c00;margin-top:2px;}
.checkout-item-price{
  font-size:.875rem;font-weight:600;color:#33ff00;text-align:right;white-space:nowrap;
}
.checkout-item-unit{font-size:.6875rem;color:#1a8c00;text-align:right;margin-top:2px;}
.checkout-totals{margin-top:20px;}
.checkout-totals-row{
  display:flex;justify-content:space-between;padding:6px 0;
  font-size:.8125rem;color:#1a8c00;
}
.checkout-totals-row.total{
  border-top:1px solid #0a3300;margin-top:8px;padding-top:14px;
  font-size:.9375rem;font-weight:600;color:#33ff00;
}
.checkout-form-section{margin-bottom:24px;}
.checkout-form-label{
  font-size:.8125rem;font-weight:600;color:#33ff00;margin-bottom:8px;display:block;
}
.checkout-input{
  width:100%;padding:10px 12px;border:1px solid #0a3300;border-radius:6px;
  background:#020;color:#33ff00;font:inherit;font-size:.875rem;
  transition:border-color .15s;outline:none;
}
.checkout-input:focus{border-color:#33ff00;}
.checkout-input::placeholder{color:#116600;}
.checkout-card-box{
  border:1px solid #0a3300;border-radius:6px;padding:14px;
  background:#020;
}
.checkout-card-row{
  display:flex;gap:12px;margin-top:10px;
}
.checkout-card-row .checkout-input{flex:1;}
.checkout-sim-note{
  font-size:.6875rem;color:#1a8c00;margin-top:10px;text-align:center;
  font-style:italic;
}
.checkout-pay-btn{
  width:100%;padding:14px;border:none;border-radius:8px;
  background:#33ff00;color:#000;font:inherit;font-size:.9375rem;font-weight:700;
  cursor:pointer;transition:background .15s;
  font-family:'Geist Pixel',monospace;
}
.checkout-pay-btn:hover{background:#44ff22;}
.checkout-cancel{
  text-align:center;margin-top:14px;
}
.checkout-cancel a{
  color:#1a8c00;text-decoration:none;font-size:.8125rem;
  transition:color .15s;
}
.checkout-cancel a:hover{color:#33ff00;}
@media(max-width:768px){
  .checkout-layout{flex-direction:column;}
  .checkout-summary{padding:32px 20px;border-right:none;border-bottom:1px solid #0a3300;}
  .checkout-form-side{padding:32px 20px;}
}
`;
var POWERED_BY = `<div class="powered-by">Powered by <a href="https://emulate.dev" target="_blank" rel="noopener">emulate</a></div>`;
function emuBar(service) {
  const title = service ? `${escapeHtml(service)} Emulator` : "Emulator";
  return `<div class="emu-bar">
  <span class="emu-bar-title">${title}</span>
  <nav class="emu-bar-links">
    <a href="https://github.com/vercel-labs/emulate/issues" target="_blank" rel="noopener"><span class="full">Report Issue</span><span class="short">Report</span></a>
    <a href="https://github.com/vercel-labs/emulate" target="_blank" rel="noopener"><span class="full">Source Code</span><span class="short">Source</span></a>
    <a href="https://emulate.dev" target="_blank" rel="noopener"><span class="full">Learn More</span><span class="short">Learn</span></a>
  </nav>
</div>`;
}
function head(title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="icon" href="/_emulate/favicon.ico"/>
<title>${escapeHtml(title)} | emulate</title>
<style>${CSS}</style>
</head>`;
}
function renderCardPage(title, subtitle, body, service) {
  return `${head(title)}
<body>
${emuBar(service)}
<div class="content">
  <div class="content-inner">
    <div class="card-title">${escapeHtml(title)}</div>
    <div class="card-subtitle">${subtitle}</div>
    ${body}
  </div>
</div>
${POWERED_BY}
</body></html>`;
}
function renderErrorPage(title, message, service) {
  return `${head(title)}
<body>
${emuBar(service)}
<div class="content">
  <div class="content-inner error-card">
    <div class="error-title">${escapeHtml(title)}</div>
    <div class="error-msg">${escapeHtml(message)}</div>
  </div>
</div>
${POWERED_BY}
</body></html>`;
}
function renderSettingsPage(title, sidebarHtml, bodyHtml, service) {
  return `${head(title)}
<body>
${emuBar(service)}
<div class="settings-layout">
  <nav class="settings-sidebar">${sidebarHtml}</nav>
  <div class="settings-main">${bodyHtml}</div>
</div>
${POWERED_BY}
</body></html>`;
}
function renderUserButton(opts) {
  const hiddens = Object.entries(opts.hiddenFields).map(([k, v]) => `<input type="hidden" name="${escapeAttr(k)}" value="${escapeAttr(v)}"/>`).join("");
  const nameLine = opts.name ? `<div class="user-meta">${escapeHtml(opts.name)}</div>` : "";
  const emailLine = opts.email ? `<div class="user-email">${escapeHtml(opts.email)}</div>` : "";
  return `<form class="user-form" method="post" action="${escapeAttr(opts.formAction)}">
${hiddens}
<button type="submit" class="user-btn">
  <span class="avatar">${escapeHtml(opts.letter)}</span>
  <span class="user-text">
    <span class="user-login">${escapeHtml(opts.login)}</span>
    ${nameLine}${emailLine}
  </span>
</button>
</form>`;
}
function normalizeUri(uri) {
  try {
    const u = new URL(uri);
    return `${u.origin}${u.pathname.replace(/\/+$/, "")}`;
  } catch {
    return uri.replace(/\/+$/, "").split("?")[0];
  }
}
function matchesRedirectUri(incoming, registered) {
  const normalized = normalizeUri(incoming);
  return registered.some((r) => normalizeUri(r) === normalized);
}
function constantTimeSecretEqual(a, b) {
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
function parseCookies(header) {
  const cookies = {};
  for (const part of header.split(";")) {
    const [k, ...v] = part.split("=");
    if (k) cookies[k.trim()] = v.join("=").trim();
  }
  return cookies;
}
function ownerLoginOf(gh, repo) {
  if (repo.owner_type === "User") {
    return gh.users.get(repo.owner_id)?.login ?? "unknown";
  }
  return gh.orgs.get(repo.owner_id)?.login ?? "unknown";
}
function isOrgMember(gh, userId, orgId) {
  for (const team of gh.teams.all()) {
    if (team.org_id !== orgId) continue;
    const m = gh.teamMembers.findBy("team_id", team.id).find((x) => x.user_id === userId);
    if (m) return true;
  }
  return false;
}
function getActorUser(gh, authUser) {
  return gh.users.findOneBy("login", authUser.login);
}
function installationCanAccessRepo(authUser, repo) {
  const installation = authUser.installation;
  if (!installation) return false;
  if (repo.owner_id !== installation.accountId || repo.owner_type !== installation.accountType) return false;
  return installation.repositorySelection === "all" || installation.repositoryIds.includes(repo.id);
}
function installationActor(gh, authUser) {
  const installation = authUser.installation;
  const app = gh.apps.findOneBy("app_id", installation.appId);
  const login = `${app?.slug ?? `app-${installation.appId}`}[bot]`;
  const existing = gh.users.findOneBy("login", login);
  if (existing) return existing;
  const actor = gh.users.insert({
    login,
    node_id: "",
    avatar_url: "",
    gravatar_id: "",
    type: "Bot",
    site_admin: false,
    name: app?.name ?? "GitHub App",
    company: null,
    blog: "",
    location: null,
    email: `${installation.appId}+${login}@users.noreply.github.com`,
    hireable: null,
    bio: null,
    twitter_username: null,
    public_repos: 0,
    public_gists: 0,
    followers: 0,
    following: 0
  });
  gh.users.update(actor.id, { node_id: generateNodeId("Bot", actor.id) });
  return gh.users.get(actor.id);
}
function canAccessRepo(gh, authUser, repo) {
  if (!repo.private) return true;
  if (!authUser) return false;
  if (authUser.installation) return installationCanAccessRepo(authUser, repo);
  const user = getActorUser(gh, authUser);
  if (!user) return false;
  if (repo.owner_type === "User" && repo.owner_id === user.id) return true;
  if (repo.owner_type === "Organization" && isOrgMember(gh, user.id, repo.owner_id)) return true;
  return Boolean(gh.collaborators.findBy("repo_id", repo.id).find((c) => c.user_id === user.id));
}
function assertRepoRead(gh, authUser, repo) {
  if (canAccessRepo(gh, authUser, repo)) return;
  if (!authUser) throw unauthorized();
  throw forbidden();
}
function hasInstallationPermission(authUser, permissions, required) {
  const requiredRank = required === "write" ? 2 : 1;
  return permissions.some((name) => {
    const granted = authUser.installation?.permissions[name];
    const grantedRank = granted === "write" ? 2 : granted === "read" ? 1 : 0;
    return grantedRank >= requiredRank;
  });
}
function canAccessRepoWithPermission(gh, authUser, repo, permissions, required) {
  if (required === "write" && authUser?.installation && !installationCanAccessRepo(authUser, repo)) return false;
  if (!canAccessRepo(gh, authUser, repo)) return false;
  if (required === "write" && !authUser) return false;
  if (!authUser?.installation || !repo.private && required === "read") return true;
  return hasInstallationPermission(authUser, permissions, required);
}
function assertRepoPermission(gh, authUser, repo, permissions, required = "read") {
  const accepted = Array.isArray(permissions) ? permissions : [permissions];
  if (!canAccessRepoWithPermission(gh, authUser, repo, accepted, required)) {
    if (!authUser) throw unauthorized();
    throw forbidden();
  }
}
function canReadRepoContents(gh, authUser, repo) {
  return canAccessRepoWithPermission(gh, authUser, repo, ["contents"], "read");
}
function assertRepoContentsRead(gh, authUser, repo) {
  assertRepoPermission(gh, authUser, repo, "contents");
}
function assertAuthenticatedUser(gh, authUser) {
  if (!authUser) throw unauthorized();
  const user = getActorUser(gh, authUser);
  if (!user) throw unauthorized();
  return user;
}
function assertAuthenticatedActor(gh, authUser) {
  if (!authUser) throw unauthorized();
  if (authUser.installation) return installationActor(gh, authUser);
  return assertAuthenticatedUser(gh, authUser);
}
function hasRepoAdmin(gh, user, repo) {
  if (repo.owner_type === "User" && repo.owner_id === user.id) return true;
  if (repo.owner_type === "Organization" && isOrgMember(gh, user.id, repo.owner_id)) return true;
  const collab = gh.collaborators.findBy("repo_id", repo.id).find((c) => c.user_id === user.id);
  return collab?.permission === "admin" || collab?.permission === "maintain";
}
function grantsRepoWrite(permission) {
  return permission === "push" || permission === "write" || permission === "maintain" || permission === "admin";
}
function hasRepoContentsWrite(gh, user, repo) {
  if (repo.owner_type === "User" && repo.owner_id === user.id) return true;
  const collaborator = gh.collaborators.findBy("repo_id", repo.id).find((c) => c.user_id === user.id);
  if (collaborator && grantsRepoWrite(collaborator.permission)) return true;
  if (repo.owner_type !== "Organization") return false;
  const memberships = gh.teamMembers.findBy("user_id", user.id).filter((membership) => {
    return gh.teams.get(membership.team_id)?.org_id === repo.owner_id;
  });
  if (!memberships.length) return false;
  const isOrgAdmin = memberships.some((membership) => {
    const team = gh.teams.get(membership.team_id);
    return team?.slug === "members" && membership.role === "maintainer";
  });
  if (isOrgAdmin) return true;
  const org = gh.orgs.get(repo.owner_id);
  if (org && grantsRepoWrite(org.default_repository_permission)) return true;
  return memberships.some((membership) => {
    const team = gh.teams.get(membership.team_id);
    if (!team || !grantsRepoWrite(team.permission)) return false;
    return gh.teamRepos.findBy("team_id", team.id).some((link) => link.repo_id === repo.id);
  });
}
function assertRepoContentsWrite(gh, authUser, repo) {
  if (authUser?.installation) {
    if (!installationCanAccessRepo(authUser, repo)) throw forbidden();
    if (authUser.installation.permissions.contents !== "write") throw forbidden();
    if (repo.archived) throw new ApiError(403, "Repository was archived so is read-only.");
    return installationActor(gh, authUser);
  }
  const user = assertAuthenticatedUser(gh, authUser);
  if (!hasRepoContentsWrite(gh, user, repo)) throw forbidden();
  if (repo.archived) throw new ApiError(403, "Repository was archived so is read-only.");
  return user;
}
function hasBranchProtectionBypass(gh, user, repo) {
  if (user.site_admin) return true;
  if (repo.owner_type === "User") return repo.owner_id === user.id;
  const isOrgAdmin = gh.teamMembers.findBy("user_id", user.id).some((membership) => {
    const team = gh.teams.get(membership.team_id);
    return team?.org_id === repo.owner_id && team.slug === "members" && membership.role === "maintainer";
  });
  if (isOrgAdmin) return true;
  return gh.collaborators.findBy("repo_id", repo.id).some((collaborator) => collaborator.user_id === user.id && collaborator.permission === "admin");
}
function branchRestrictionsAllow(gh, user, repo, users, teams) {
  const login = user.login.toLowerCase();
  if (users.some((allowed) => allowed.toLowerCase() === login)) return true;
  if (repo.owner_type !== "Organization") return false;
  const allowedTeams = new Set(teams.map((team) => team.toLowerCase()));
  return gh.teamMembers.findBy("user_id", user.id).some((membership) => {
    const team = gh.teams.get(membership.team_id);
    return team?.org_id === repo.owner_id && allowedTeams.has(team.slug.toLowerCase());
  });
}
function introducedRangeContainsMerge(gh, repoId, currentSha, targetSha) {
  const commits = new Map(gh.commits.findBy("repo_id", repoId).map((commit) => [commit.sha, commit]));
  const currentReachable = /* @__PURE__ */ new Set();
  const currentStack = [currentSha];
  while (currentStack.length) {
    const sha = currentStack.pop();
    if (currentReachable.has(sha)) continue;
    currentReachable.add(sha);
    const commit = commits.get(sha);
    if (commit) currentStack.push(...commit.parent_shas);
  }
  const visited = /* @__PURE__ */ new Set();
  const targetStack = [targetSha];
  while (targetStack.length) {
    const sha = targetStack.pop();
    if (visited.has(sha) || currentReachable.has(sha)) continue;
    visited.add(sha);
    const commit = commits.get(sha);
    if (!commit) continue;
    if (commit.parent_shas.length > 1) return true;
    targetStack.push(...commit.parent_shas);
  }
  return false;
}
function assertBranchUpdateAllowed(gh, user, repo, branchName, options = {}) {
  const protection = gh.branchProtections.findBy("repo_id", repo.id).find((candidate) => candidate.branch_name === branchName);
  if (!protection) return;
  if (hasBranchProtectionBypass(gh, user, repo) && !protection.enforce_admins) return;
  const restricted = protection.restrictions && !branchRestrictionsAllow(gh, user, repo, protection.restrictions.users, protection.restrictions.teams);
  const blockedDeletion = options.deletion === true && !protection.allow_deletions;
  const requiredContexts = protection.required_status_checks?.contexts ?? [];
  const successfulConclusions = /* @__PURE__ */ new Set(["success", "neutral", "skipped"]);
  const requiredChecksPassed = requiredContexts.every((context) => {
    if (!options.targetSha) return false;
    const latest = gh.checkRuns.findBy("repo_id", repo.id).filter((run) => run.head_sha === options.targetSha && run.name === context).sort((left, right) => {
      if (left.updated_at !== right.updated_at) return right.updated_at.localeCompare(left.updated_at);
      return right.id - left.id;
    })[0];
    return latest?.status === "completed" && latest.conclusion !== null && successfulConclusions.has(latest.conclusion);
  });
  const requirementsBlockDirectUpdate = options.deletion !== true && (protection.required_pull_request_reviews !== null || requiredContexts.length > 0 && !requiredChecksPassed || protection.required_signatures);
  const invalidHistory = options.deletion !== true && protection.required_linear_history && (options.currentSha && options.targetSha ? introducedRangeContainsMerge(gh, repo.id, options.currentSha, options.targetSha) : (options.parentCount ?? 1) > 1);
  const blockedForcePush = options.deletion !== true && options.force === true && !protection.allow_force_pushes;
  if (restricted || blockedDeletion || requirementsBlockDirectUpdate || invalidHistory || blockedForcePush) {
    throw new ApiError(409, `Protected branch update failed for refs/heads/${branchName}.`);
  }
}
function assertRepoAdmin(gh, authUser, repo) {
  if (authUser?.installation) {
    assertRepoPermission(gh, authUser, repo, "administration", "write");
    return assertAuthenticatedActor(gh, authUser);
  }
  const user = assertAuthenticatedUser(gh, authUser);
  if (hasRepoAdmin(gh, user, repo)) return user;
  throw forbidden();
}
function assertRepoWrite(gh, authUser, repo, permissions) {
  if (authUser?.installation) {
    assertRepoPermission(gh, authUser, repo, permissions, "write");
    return assertAuthenticatedActor(gh, authUser);
  }
  const user = assertAuthenticatedUser(gh, authUser);
  if (!repo.private) return user;
  if (!canAccessRepo(gh, authUser, repo)) throw forbidden();
  return user;
}
function assertIssueWrite(gh, authUser, repo) {
  assertRepoPermission(gh, authUser, repo, "issues", "write");
  return assertAuthenticatedActor(gh, authUser);
}
function listReposForUser(gh, user, type) {
  const owned = gh.repos.all().filter((r) => r.owner_id === user.id && r.owner_type === "User");
  const member = gh.collaborators.findBy("user_id", user.id).map((c) => gh.repos.get(c.repo_id)).filter((r) => Boolean(r)).filter((r) => !(r.owner_id === user.id && r.owner_type === "User"));
  if (type === "owner") return owned;
  if (type === "member") return member;
  const map = /* @__PURE__ */ new Map();
  for (const r of owned) map.set(r.id, r);
  for (const r of member) map.set(r.id, r);
  return Array.from(map.values());
}
function sortRepos(repos, sort, direction) {
  const mul = direction === "asc" ? 1 : -1;
  const sorted = [...repos];
  sorted.sort((a, b) => {
    if (sort === "full_name") {
      return a.full_name.localeCompare(b.full_name) * mul;
    }
    const field = sort === "created" ? "created_at" : sort === "updated" ? "updated_at" : "pushed_at";
    const av = a[field] ?? "";
    const bv = b[field] ?? "";
    if (av < bv) return -1 * mul;
    if (av > bv) return 1 * mul;
    return 0;
  });
  return sorted;
}
function orgsForUser(gh, userId) {
  const memberships = gh.teamMembers.findBy("user_id", userId);
  const orgIds = /* @__PURE__ */ new Set();
  for (const m of memberships) {
    const team = gh.teams.get(m.team_id);
    if (team) orgIds.add(team.org_id);
  }
  const orgs = [...orgIds].map((id) => gh.orgs.get(id)).filter((o) => Boolean(o));
  orgs.sort((a, b) => a.login.localeCompare(b.login));
  return orgs;
}
function usersRoutes({ app, store, baseUrl }) {
  const gh = getGitHubStore(store);
  app.get("/user", (c) => {
    const authUser = c.get("authUser");
    if (!authUser) {
      throw unauthorized();
    }
    const user = gh.users.findOneBy("login", authUser.login);
    if (!user) {
      throw notFound();
    }
    return c.json(formatUserFull(user, baseUrl));
  });
  app.patch("/user", async (c) => {
    const authUser = c.get("authUser");
    if (!authUser) {
      throw unauthorized();
    }
    const existing = gh.users.findOneBy("login", authUser.login);
    if (!existing) {
      throw notFound();
    }
    const body = await parseJsonBody(c);
    const patch = {};
    if ("name" in body) {
      if (body.name === null) patch.name = null;
      else if (typeof body.name === "string") patch.name = body.name;
    }
    if ("email" in body) {
      if (body.email === null) patch.email = null;
      else if (typeof body.email === "string") patch.email = body.email;
    }
    if ("blog" in body && typeof body.blog === "string") {
      patch.blog = body.blog;
    }
    if ("twitter_username" in body) {
      if (body.twitter_username === null) patch.twitter_username = null;
      else if (typeof body.twitter_username === "string") {
        patch.twitter_username = body.twitter_username;
      }
    }
    if ("company" in body) {
      if (body.company === null) patch.company = null;
      else if (typeof body.company === "string") patch.company = body.company;
    }
    if ("location" in body) {
      if (body.location === null) patch.location = null;
      else if (typeof body.location === "string") patch.location = body.location;
    }
    if ("hireable" in body) {
      if (body.hireable === null) patch.hireable = null;
      else if (typeof body.hireable === "boolean") patch.hireable = body.hireable;
    }
    if ("bio" in body) {
      if (body.bio === null) patch.bio = null;
      else if (typeof body.bio === "string") patch.bio = body.bio;
    }
    const updated = gh.users.update(existing.id, patch);
    if (!updated) {
      throw notFound();
    }
    return c.json(formatUserFull(updated, baseUrl));
  });
  app.get("/user/repos", (c) => {
    const authUser = c.get("authUser");
    const user = assertAuthenticatedUser(gh, authUser);
    const typeRaw = (c.req.query("type") ?? "all").toLowerCase();
    if (typeRaw !== "all" && typeRaw !== "owner" && typeRaw !== "member") {
      throw new ApiError(422, "Invalid type parameter");
    }
    const type = typeRaw;
    const sortRaw = (c.req.query("sort") ?? "full_name").toLowerCase();
    if (sortRaw !== "created" && sortRaw !== "updated" && sortRaw !== "pushed" && sortRaw !== "full_name") {
      throw new ApiError(422, "Invalid sort parameter");
    }
    const sort = sortRaw;
    const direction = c.req.query("direction")?.toLowerCase() ?? (sort === "full_name" ? "asc" : "desc");
    if (direction !== "asc" && direction !== "desc") {
      throw new ApiError(422, "Invalid direction parameter");
    }
    const { page, per_page } = parsePagination(c);
    const allRepos = sortRepos(listReposForUser(gh, user, type), sort, direction).filter(
      (r) => canAccessRepo(gh, authUser, r)
    );
    const total = allRepos.length;
    const start = (page - 1) * per_page;
    const items = allRepos.slice(start, start + per_page).map((r) => formatRepo(r, gh, baseUrl));
    setLinkHeader(c, total, page, per_page);
    return c.json(items);
  });
  app.get("/users", (c) => {
    const since = Math.max(0, parseInt(c.req.query("since") ?? "0", 10) || 0);
    const perPage = Math.min(100, Math.max(1, parseInt(c.req.query("per_page") ?? "30", 10) || 30));
    const ordered = gh.users.all().filter((u) => u.id > since).sort((a, b) => a.id - b.id);
    const page = ordered.slice(0, perPage);
    if (page.length === perPage && ordered.length > perPage) {
      const lastId = page[page.length - 1].id;
      const nextUrl = new URL(c.req.url);
      nextUrl.searchParams.set("since", String(lastId));
      nextUrl.searchParams.set("per_page", String(perPage));
      c.header("Link", `<${nextUrl.toString()}>; rel="next"`);
    }
    return c.json(page.map((u) => formatUser(u, baseUrl)));
  });
  app.get("/users/:username/repos", (c) => {
    const username = c.req.param("username");
    const user = gh.users.findOneBy("login", username);
    if (!user) {
      throw notFound();
    }
    const typeRaw = (c.req.query("type") ?? "owner").toLowerCase();
    if (typeRaw !== "all" && typeRaw !== "owner" && typeRaw !== "member") {
      throw new ApiError(422, "Invalid type parameter");
    }
    const type = typeRaw;
    const sortRaw = (c.req.query("sort") ?? "full_name").toLowerCase();
    if (sortRaw !== "created" && sortRaw !== "updated" && sortRaw !== "pushed" && sortRaw !== "full_name") {
      throw new ApiError(422, "Invalid sort parameter");
    }
    const sort = sortRaw;
    const direction = c.req.query("direction")?.toLowerCase() ?? (sort === "full_name" ? "asc" : "desc");
    if (direction !== "asc" && direction !== "desc") {
      throw new ApiError(422, "Invalid direction parameter");
    }
    const { page, per_page } = parsePagination(c);
    const allRepos = sortRepos(listReposForUser(gh, user, type), sort, direction);
    const total = allRepos.length;
    const start = (page - 1) * per_page;
    const items = allRepos.slice(start, start + per_page).map((r) => formatRepo(r, gh, baseUrl));
    setLinkHeader(c, total, page, per_page);
    return c.json(items);
  });
  app.get("/users/:username/orgs", (c) => {
    const username = c.req.param("username");
    const user = gh.users.findOneBy("login", username);
    if (!user) {
      throw notFound();
    }
    const orgs = orgsForUser(gh, user.id);
    return c.json(orgs.map((o) => formatOrgBrief(o, baseUrl)));
  });
  app.get("/users/:username/followers", (c) => {
    const username = c.req.param("username");
    if (!gh.users.findOneBy("login", username)) {
      throw notFound();
    }
    const { page, per_page } = parsePagination(c);
    setLinkHeader(c, 0, page, per_page);
    return c.json([]);
  });
  app.get("/users/:username/following", (c) => {
    const username = c.req.param("username");
    if (!gh.users.findOneBy("login", username)) {
      throw notFound();
    }
    const { page, per_page } = parsePagination(c);
    setLinkHeader(c, 0, page, per_page);
    return c.json([]);
  });
  app.get("/users/:username/hovercard", (c) => {
    const username = c.req.param("username");
    if (!gh.users.findOneBy("login", username)) {
      throw notFound();
    }
    return c.json({ contexts: [] });
  });
  app.get("/users/:username", (c) => {
    const username = c.req.param("username");
    const user = gh.users.findOneBy("login", username);
    if (!user) {
      throw notFound();
    }
    return c.json(formatUserFull(user, baseUrl));
  });
}
function gitObjectSha(type, content) {
  const header = Buffer.from(`${type} ${content.byteLength}\0`, "utf8");
  return createHash("sha1").update(header).update(content).digest("hex");
}
function blobBytes(blob) {
  return blob.encoding === "base64" ? Buffer.from(blob.content, "base64") : Buffer.from(blob.content, "utf8");
}
function findOrCreateBlob(gh, repoId, content) {
  const sha = gitObjectSha("blob", content);
  const sameSha = gh.blobs.findBy("repo_id", repoId).find((blob2) => blob2.sha === sha);
  if (sameSha) return sameSha;
  const text = content.toString("utf8");
  const isText = !text.includes("\0") && Buffer.from(text, "utf8").equals(content);
  const blob = gh.blobs.insert({
    repo_id: repoId,
    sha,
    node_id: "",
    content: isText ? text : content.toString("base64"),
    encoding: isText ? "utf-8" : "base64",
    size: content.byteLength
  });
  gh.blobs.update(blob.id, { node_id: generateNodeId("Blob", blob.id) });
  return gh.blobs.get(blob.id);
}
function treeContent(entries) {
  const ordered = [...entries].sort((left, right) => {
    const leftName = left.type === "tree" ? `${left.path}/` : left.path;
    const rightName = right.type === "tree" ? `${right.path}/` : right.path;
    return Buffer.compare(Buffer.from(leftName, "utf8"), Buffer.from(rightName, "utf8"));
  });
  return Buffer.concat(
    ordered.flatMap((entry) => [
      Buffer.from(`${entry.mode.replace(/^0+/, "")} ${entry.path}\0`, "utf8"),
      Buffer.from(entry.sha, "hex")
    ])
  );
}
function findOrCreateTree(gh, repoId, entries) {
  const sha = gitObjectSha("tree", treeContent(entries));
  const sameSha = gh.trees.findBy("repo_id", repoId).find((tree2) => tree2.sha === sha);
  if (sameSha) return sameSha;
  const tree = gh.trees.insert({
    repo_id: repoId,
    sha,
    node_id: "",
    tree: [...entries].sort((left, right) => left.path.localeCompare(right.path)),
    truncated: false
  });
  gh.trees.update(tree.id, { node_id: generateNodeId("Tree", tree.id) });
  return gh.trees.get(tree.id);
}
function gitIdentityDate(date) {
  const milliseconds = Date.parse(date);
  if (!Number.isFinite(milliseconds)) throw new Error(`Invalid Git identity date: ${date}`);
  const zone = date.match(/(Z|([+-])(\d{2}):?(\d{2}))$/i);
  const offset = !zone || zone[1].toUpperCase() === "Z" ? "+0000" : `${zone[2]}${zone[3]}${zone[4]}`;
  return `${Math.floor(milliseconds / 1e3)} ${offset}`;
}
function gitCommitContent(data) {
  const headers = [`tree ${data.tree_sha}`, ...data.parent_shas.map((sha) => `parent ${sha}`)];
  headers.push(`author ${data.author_name} <${data.author_email}> ${gitIdentityDate(data.author_date)}`);
  headers.push(`committer ${data.committer_name} <${data.committer_email}> ${gitIdentityDate(data.committer_date)}`);
  const message = data.message.endsWith("\n") ? data.message : `${data.message}
`;
  return Buffer.from(`${headers.join("\n")}

${message}`, "utf8");
}
function findOrCreateCommit(gh, repoId, data) {
  const sha = gitObjectSha("commit", gitCommitContent(data));
  const existing = gh.commits.findBy("repo_id", repoId).find((commit2) => commit2.sha === sha);
  if (existing) return existing;
  const commit = gh.commits.insert({
    repo_id: repoId,
    sha,
    node_id: "",
    ...data
  });
  gh.commits.update(commit.id, { node_id: generateNodeId("Commit", commit.id) });
  return gh.commits.get(commit.id);
}
function findCommitBySha(gh, repoId, sha) {
  return gh.commits.findBy("repo_id", repoId).find((c) => c.sha === sha);
}
function peelToCommit(gh, repoId, sha) {
  const commit = findCommitBySha(gh, repoId, sha);
  if (commit) return commit;
  const tag = gh.tags.findBy("repo_id", repoId).find((t) => t.sha === sha);
  if (tag) return peelToCommit(gh, repoId, tag.object_sha);
  return void 0;
}
function resolveRefToCommit(gh, repo, refParam) {
  const ref = !refParam || refParam === "HEAD" ? repo.default_branch : refParam;
  const branchName = ref.startsWith("refs/heads/") ? ref.slice("refs/heads/".length) : ref.startsWith("heads/") ? ref.slice("heads/".length) : ref;
  const branch = resolveBranchToCommit(gh, repo, branchName);
  if (branch && !ref.startsWith("tags/") && !ref.startsWith("refs/tags/")) return branch;
  const refs = gh.refs.findBy("repo_id", repo.id);
  const candidates = ref.startsWith("refs/") ? [ref] : ref.startsWith("heads/") || ref.startsWith("tags/") ? [`refs/${ref}`] : [`refs/heads/${ref}`, `refs/tags/${ref}`];
  const refRec = candidates.map((candidate) => refs.find((r) => r.ref === candidate)).find(Boolean);
  if (refRec) return peelToCommit(gh, repo.id, refRec.sha);
  const commits = gh.commits.findBy("repo_id", repo.id);
  const exact = commits.find((c) => c.sha === ref);
  if (exact) return exact;
  if (/^[0-9a-f]{4,39}$/.test(ref)) {
    return commits.find((c) => c.sha.startsWith(ref));
  }
  return void 0;
}
function resolveBranchToCommit(gh, repo, branchName) {
  const branch = gh.branches.findBy("repo_id", repo.id).find((b) => b.name === branchName);
  const ref = gh.refs.findBy("repo_id", repo.id).find((r) => r.ref === `refs/heads/${branchName}`);
  const sha = ref?.sha ?? branch?.sha;
  return sha ? peelToCommit(gh, repo.id, sha) : void 0;
}
function flattenTree(gh, repoId, treeSha) {
  const blobs = /* @__PURE__ */ new Map();
  const dirs = /* @__PURE__ */ new Map();
  const registerParentDirs = (path) => {
    const parts = path.split("/");
    for (let i = 1; i < parts.length; i++) {
      const dir = parts.slice(0, i).join("/");
      if (!dirs.has(dir)) dirs.set(dir, "");
    }
  };
  const walk = (sha, prefix, ancestors) => {
    if (ancestors.has(sha)) return;
    const tree = gh.trees.findBy("repo_id", repoId).find((t) => t.sha === sha);
    if (!tree) return;
    const nextAncestors = new Set(ancestors).add(sha);
    for (const e of tree.tree) {
      const path = prefix ? `${prefix}/${e.path}` : e.path;
      if (e.type !== "tree") {
        blobs.set(path, { mode: e.mode, type: e.type, sha: e.sha, size: e.size });
        registerParentDirs(path);
      } else {
        dirs.set(path, e.sha);
        registerParentDirs(path);
        walk(e.sha, path, nextAncestors);
      }
    }
  };
  walk(treeSha, "", /* @__PURE__ */ new Set());
  return { blobs, dirs };
}
function listAncestors(gh, repoId, headSha) {
  const reachable = /* @__PURE__ */ new Map();
  const stack = [headSha];
  while (stack.length) {
    const sha = stack.pop();
    if (reachable.has(sha)) continue;
    const commit = findCommitBySha(gh, repoId, sha);
    if (!commit) continue;
    reachable.set(sha, commit);
    for (const p of commit.parent_shas) stack.push(p);
  }
  const childCounts = new Map([...reachable.keys()].map((sha) => [sha, 0]));
  for (const commit of reachable.values()) {
    for (const parentSha of commit.parent_shas) {
      if (reachable.has(parentSha)) childCounts.set(parentSha, childCounts.get(parentSha) + 1);
    }
  }
  const eligible = [...reachable.values()].filter((commit) => childCounts.get(commit.sha) === 0);
  const out = [];
  while (eligible.length) {
    eligible.sort(
      (a, b) => a.committer_date === b.committer_date ? b.id - a.id : a.committer_date < b.committer_date ? 1 : -1
    );
    const commit = eligible.shift();
    out.push(commit);
    for (const parentSha of commit.parent_shas) {
      if (!reachable.has(parentSha)) continue;
      const remainingChildren = childCounts.get(parentSha) - 1;
      childCounts.set(parentSha, remainingChildren);
      if (remainingChildren === 0) eligible.push(reachable.get(parentSha));
    }
  }
  return out;
}
function blobText(gh, repoId, sha) {
  const blob = gh.blobs.findBy("repo_id", repoId).find((b) => b.sha === sha);
  if (!blob) return null;
  if (blob.encoding !== "base64") return blob.content.includes("\0") ? null : blob.content;
  const bytes = Buffer.from(blob.content, "base64");
  const text = bytes.toString("utf8");
  if (text.includes("\0") || !Buffer.from(text, "utf8").equals(bytes)) return null;
  return text;
}
function encodeContentPath(path) {
  return path.split("/").map((part) => encodeURIComponent(part)).join("/");
}
function commitEmailMatchesUser(email, user) {
  const normalized = email.toLowerCase();
  const login = user.login.toLowerCase();
  if (user.email?.toLowerCase() === normalized) return true;
  if (normalized === `${login}@localhost`) return true;
  if (normalized === `${login}@users.noreply.github.com`) return true;
  return normalized.endsWith(`+${login}@users.noreply.github.com`);
}
function resolveCommitUser(gh, email) {
  return gh.users.all().find((user) => commitEmailMatchesUser(email, user));
}
function commitIdentityMatches(gh, email, query) {
  if (email.toLowerCase() === query.toLowerCase()) return true;
  return resolveCommitUser(gh, email)?.login.toLowerCase() === query.toLowerCase();
}
function lcsOps(a, b) {
  const n = a.length;
  const m = b.length;
  const dp = [];
  for (let i2 = 0; i2 <= n; i2++) dp.push(new Uint32Array(m + 1));
  for (let i2 = n - 1; i2 >= 0; i2--) {
    for (let j2 = m - 1; j2 >= 0; j2--) {
      dp[i2][j2] = a[i2] === b[j2] ? dp[i2 + 1][j2 + 1] + 1 : Math.max(dp[i2 + 1][j2], dp[i2][j2 + 1]);
    }
  }
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: "eq", text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: "del", text: a[i] });
      i++;
    } else {
      ops.push({ type: "ins", text: b[j] });
      j++;
    }
  }
  while (i < n) ops.push({ type: "del", text: a[i++] });
  while (j < m) ops.push({ type: "ins", text: b[j++] });
  return ops;
}
function myersBisectOps(a, b) {
  const n = a.length;
  const m = b.length;
  const maxD = Math.ceil((n + m) / 2);
  const offset = maxD;
  const vectorLength = maxD * 2;
  const forward = new Int32Array(vectorLength);
  const reverse = new Int32Array(vectorLength);
  forward.fill(-1);
  reverse.fill(-1);
  forward[offset + 1] = 0;
  reverse[offset + 1] = 0;
  const delta = n - m;
  const frontOverlaps = delta % 2 !== 0;
  let forwardStart = 0;
  let forwardEnd = 0;
  let reverseStart = 0;
  let reverseEnd = 0;
  const split = (x, y) => {
    if (x === 0 && y === 0 || x === n && y === m) {
      return [...a.map((text) => ({ type: "del", text })), ...b.map((text) => ({ type: "ins", text }))];
    }
    return [...diffOps(a.slice(0, x), b.slice(0, y)), ...diffOps(a.slice(x), b.slice(y))];
  };
  for (let d = 0; d < maxD; d++) {
    for (let k = -d + forwardStart; k <= d - forwardEnd; k += 2) {
      const index = offset + k;
      let x;
      if (k === -d || k !== d && forward[index - 1] < forward[index + 1]) {
        x = forward[index + 1];
      } else {
        x = forward[index - 1] + 1;
      }
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      forward[index] = x;
      if (x > n) {
        forwardEnd += 2;
      } else if (y > m) {
        forwardStart += 2;
      } else if (frontOverlaps) {
        const reverseIndex = offset + delta - k;
        if (reverseIndex >= 0 && reverseIndex < vectorLength && reverse[reverseIndex] !== -1) {
          const reverseX = n - reverse[reverseIndex];
          if (x >= reverseX) return split(x, y);
        }
      }
    }
    for (let k = -d + reverseStart; k <= d - reverseEnd; k += 2) {
      const index = offset + k;
      let x;
      if (k === -d || k !== d && reverse[index - 1] < reverse[index + 1]) {
        x = reverse[index + 1];
      } else {
        x = reverse[index - 1] + 1;
      }
      let y = x - k;
      while (x < n && y < m && a[n - x - 1] === b[m - y - 1]) {
        x++;
        y++;
      }
      reverse[index] = x;
      if (x > n) {
        reverseEnd += 2;
      } else if (y > m) {
        reverseStart += 2;
      } else if (!frontOverlaps) {
        const forwardIndex = offset + delta - k;
        if (forwardIndex >= 0 && forwardIndex < vectorLength && forward[forwardIndex] !== -1) {
          const forwardX = forward[forwardIndex];
          const forwardY = offset + forwardX - forwardIndex;
          const reverseX = n - x;
          if (forwardX >= reverseX) return split(forwardX, forwardY);
        }
      }
    }
  }
  return [...a.map((text) => ({ type: "del", text })), ...b.map((text) => ({ type: "ins", text }))];
}
function diffOps(a, b) {
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }
  const midA = a.slice(start, endA);
  const midB = b.slice(start, endB);
  let mid;
  if (!midA.length) {
    mid = midB.map((text) => ({ type: "ins", text }));
  } else if (!midB.length) {
    mid = midA.map((text) => ({ type: "del", text }));
  } else {
    mid = midA.length * midB.length > 25e4 ? myersBisectOps(midA, midB) : lcsOps(midA, midB);
  }
  return [
    ...a.slice(0, start).map((text) => ({ type: "eq", text })),
    ...mid,
    ...a.slice(endA).map((text) => ({ type: "eq", text }))
  ];
}
var PATCH_CONTEXT = 3;
var PATCH_MAX_LINES = 1e4;
function opsToPatch(ops) {
  const changeIdx = ops.map((o, i) => o.type === "eq" ? -1 : i).filter((i) => i >= 0);
  if (!changeIdx.length) return void 0;
  const groups = [];
  let gs = changeIdx[0];
  let ge = changeIdx[0];
  for (const idx of changeIdx.slice(1)) {
    if (idx - ge - 1 <= PATCH_CONTEXT * 2) {
      ge = idx;
    } else {
      groups.push([gs, ge]);
      gs = idx;
      ge = idx;
    }
  }
  groups.push([gs, ge]);
  const chunks = [];
  for (const [s, e] of groups) {
    const lo = Math.max(0, s - PATCH_CONTEXT);
    const hi = Math.min(ops.length - 1, e + PATCH_CONTEXT);
    const slice = ops.slice(lo, hi + 1);
    const oldCount = slice.filter((o) => o.type !== "ins").length;
    const newCount = slice.filter((o) => o.type !== "del").length;
    const oldStart = oldCount === 0 ? slice[0].oldLine - 1 : slice[0].oldLine;
    const newStart = newCount === 0 ? slice[0].newLine - 1 : slice[0].newLine;
    chunks.push(`@@ -${oldStart},${oldCount} +${newStart},${newCount} @@`);
    for (const o of slice) {
      const terminated = o.text.endsWith("\n");
      const text = terminated ? o.text.slice(0, -1) : o.text;
      chunks.push(`${o.type === "eq" ? " " : o.type === "del" ? "-" : "+"}${text}`);
      if (!terminated) chunks.push("\\ No newline at end of file");
    }
  }
  return chunks.join("\n");
}
function diffText(oldText, newText) {
  const splitLines = (t) => {
    if (t === null || t === "") return [];
    const terminated = t.endsWith("\n");
    const lines = t.split("\n");
    if (terminated) lines.pop();
    return lines.map((line, index) => terminated || index < lines.length - 1 ? `${line}
` : line);
  };
  const a = splitLines(oldText);
  const b = splitLines(newText);
  const ops = diffOps(a, b);
  let additions = 0;
  let deletions = 0;
  let oldLine = 1;
  let newLine = 1;
  const annotated = ops.map((o) => {
    const entry = { ...o, oldLine, newLine };
    if (o.type === "eq") {
      oldLine++;
      newLine++;
    } else if (o.type === "del") {
      deletions++;
      oldLine++;
    } else {
      additions++;
      newLine++;
    }
    return entry;
  });
  const patch = a.length + b.length > PATCH_MAX_LINES ? void 0 : opsToPatch(annotated);
  return { additions, deletions, patch };
}
function diffTrees(gh, repoId, baseTreeSha, headTreeSha) {
  const base = baseTreeSha ? flattenTree(gh, repoId, baseTreeSha) : { blobs: /* @__PURE__ */ new Map(), dirs: /* @__PURE__ */ new Map() };
  const head2 = flattenTree(gh, repoId, headTreeSha);
  const paths = [.../* @__PURE__ */ new Set([...base.blobs.keys(), ...head2.blobs.keys()])].sort();
  const out = [];
  const pairedPaths = /* @__PURE__ */ new Set();
  const addedBySha = /* @__PURE__ */ new Map();
  for (const path of paths) {
    if (base.blobs.has(path)) continue;
    const entry = head2.blobs.get(path);
    if (!entry) continue;
    const candidates = addedBySha.get(entry.sha) ?? [];
    candidates.push(path);
    addedBySha.set(entry.sha, candidates);
  }
  for (const previousPath of paths) {
    const before = base.blobs.get(previousPath);
    if (!before || head2.blobs.has(previousPath)) continue;
    const candidates = addedBySha.get(before.sha)?.filter((path) => !pairedPaths.has(path)) ?? [];
    const filename = candidates.find((path) => head2.blobs.get(path)?.mode === before.mode) ?? candidates[0];
    if (!filename) continue;
    pairedPaths.add(previousPath);
    pairedPaths.add(filename);
    out.push({
      sha: before.sha,
      filename,
      previous_filename: previousPath,
      status: "renamed",
      additions: 0,
      deletions: 0,
      changes: 0
    });
  }
  for (const path of paths) {
    if (pairedPaths.has(path)) continue;
    const before = base.blobs.get(path);
    const after = head2.blobs.get(path);
    if (before && after && before.sha === after.sha && before.mode === after.mode) continue;
    const status = !before ? "added" : !after ? "removed" : "modified";
    const oldText = before ? blobText(gh, repoId, before.sha) : "";
    const newText = after ? blobText(gh, repoId, after.sha) : "";
    const binary = oldText === null || newText === null;
    const diff = binary ? { additions: 0, deletions: 0, patch: void 0 } : diffText(oldText, newText);
    out.push({
      sha: (after ?? before).sha,
      filename: path,
      status,
      additions: diff.additions,
      deletions: diff.deletions,
      changes: diff.additions + diff.deletions,
      patch: diff.patch
    });
  }
  return out.sort((left, right) => left.filename.localeCompare(right.filename));
}
function formatFileDiff(diff, repo, baseSha, headSha, baseUrl) {
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  const encodedPath = encodeContentPath(diff.filename);
  const contentSha = diff.status === "removed" && baseSha ? baseSha : headSha;
  return {
    sha: diff.sha,
    filename: diff.filename,
    status: diff.status,
    additions: diff.additions,
    deletions: diff.deletions,
    changes: diff.changes,
    blob_url: `${baseUrl}/${repo.full_name}/blob/${contentSha}/${encodedPath}`,
    raw_url: `${baseUrl}/${repo.full_name}/raw/${contentSha}/${encodedPath}`,
    contents_url: `${repoUrl}/contents/${encodedPath}?ref=${contentSha}`,
    ...diff.previous_filename !== void 0 ? { previous_filename: diff.previous_filename } : {},
    ...diff.patch !== void 0 ? { patch: diff.patch } : {}
  };
}
function formatCommitItem(gh, repo, c, baseUrl) {
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  const authorUser = resolveCommitUser(gh, c.author_email);
  const committerUser = resolveCommitUser(gh, c.committer_email);
  const commentCount = gh.comments.findBy("repo_id", repo.id).filter((comment) => comment.comment_type === "commit" && comment.commit_sha === c.sha).length;
  return {
    sha: c.sha,
    node_id: c.node_id,
    commit: {
      author: { name: c.author_name, email: c.author_email, date: c.author_date },
      committer: { name: c.committer_name, email: c.committer_email, date: c.committer_date },
      message: c.message,
      tree: { sha: c.tree_sha, url: `${repoUrl}/git/trees/${c.tree_sha}` },
      url: `${repoUrl}/git/commits/${c.sha}`,
      comment_count: commentCount,
      verification: { verified: false, reason: "unsigned", signature: null, payload: null, verified_at: null }
    },
    url: `${repoUrl}/commits/${c.sha}`,
    html_url: `${baseUrl}/${repo.full_name}/commit/${c.sha}`,
    comments_url: `${repoUrl}/commits/${c.sha}/comments`,
    author: authorUser ? formatUser(authorUser, baseUrl) : null,
    committer: committerUser ? formatUser(committerUser, baseUrl) : null,
    parents: c.parent_shas.map((sha) => ({
      sha,
      url: `${repoUrl}/commits/${sha}`,
      html_url: `${baseUrl}/${repo.full_name}/commit/${sha}`
    }))
  };
}
function formatGitCommit(repo, c, baseUrl) {
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  return {
    sha: c.sha,
    node_id: c.node_id,
    url: `${repoUrl}/git/commits/${c.sha}`,
    html_url: `${baseUrl}/${repo.full_name}/commit/${c.sha}`,
    author: { name: c.author_name, email: c.author_email, date: c.author_date },
    committer: { name: c.committer_name, email: c.committer_email, date: c.committer_date },
    message: c.message,
    tree: { sha: c.tree_sha, url: `${repoUrl}/git/trees/${c.tree_sha}` },
    parents: c.parent_shas.map((sha) => ({
      sha,
      url: `${repoUrl}/git/commits/${sha}`,
      html_url: `${baseUrl}/${repo.full_name}/commit/${sha}`
    })),
    verification: { verified: false, reason: "unsigned", signature: null, payload: null, verified_at: null }
  };
}
var LICENSE_TEMPLATES = {
  mit: { key: "mit", name: "MIT License", spdx_id: "MIT" },
  "apache-2.0": { key: "apache-2.0", name: "Apache License 2.0", spdx_id: "Apache-2.0" },
  "gpl-3.0": { key: "gpl-3.0", name: "GNU General Public License v3.0", spdx_id: "GPL-3.0" },
  "bsd-3-clause": {
    key: "bsd-3-clause",
    name: 'BSD 3-Clause "New" or "Revised" License',
    spdx_id: "BSD-3-Clause"
  },
  unlicense: { key: "unlicense", name: "The Unlicense", spdx_id: "Unlicense" }
};
function resolveLicenseTemplate(template) {
  const key = template.trim().toLowerCase();
  return LICENSE_TEMPLATES[key] ?? null;
}
function validateRepoName(name) {
  if (typeof name !== "string" || !name.trim()) {
    throw new ApiError(422, "Invalid repository name");
  }
  const trimmed = name.trim();
  if (trimmed.length > 100 || !/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
    throw new ApiError(422, "Invalid repository name");
  }
  return trimmed;
}
function seedInitialGit(gh, repo, actor, readmeTitle) {
  const repoId = repo.id;
  const readme = `# ${readmeTitle ?? repo.name}
`;
  const size = Buffer.byteLength(readme, "utf8");
  const blob = findOrCreateBlob(gh, repoId, Buffer.from(readme, "utf8"));
  const tree = findOrCreateTree(gh, repoId, [{ path: "README.md", mode: "100644", type: "blob", sha: blob.sha, size }]);
  const authorName = actor?.name ?? actor?.login ?? "User";
  const login = actor?.login ?? "user";
  const email = actor?.email ?? `${login}@users.noreply.github.com`;
  const now = timestamp();
  const commit = findOrCreateCommit(gh, repoId, {
    message: "Initial commit",
    author_name: authorName,
    author_email: email,
    author_date: now,
    committer_name: authorName,
    committer_email: email,
    committer_date: now,
    tree_sha: tree.sha,
    parent_shas: [],
    user_id: actor?.id ?? null
  });
  gh.branches.insert({
    repo_id: repoId,
    name: repo.default_branch,
    sha: commit.sha,
    protected: false
  });
  const ref = gh.refs.insert({
    repo_id: repoId,
    ref: `refs/heads/${repo.default_branch}`,
    sha: commit.sha,
    node_id: ""
  });
  gh.refs.update(ref.id, { node_id: generateNodeId("Ref", ref.id) });
  gh.repos.update(repo.id, {
    size,
    pushed_at: now,
    language: "Markdown",
    languages: { Markdown: size }
  });
}
function bumpPublicRepos(gh, ownerId, ownerType, delta) {
  if (delta === 0) return;
  if (ownerType === "User") {
    const u = gh.users.get(ownerId);
    if (u) gh.users.update(ownerId, { public_repos: Math.max(0, u.public_repos + delta) });
  } else {
    const o = gh.orgs.get(ownerId);
    if (o) gh.orgs.update(ownerId, { public_repos: Math.max(0, o.public_repos + delta) });
  }
}
function createRepoRecord(gh, params, actor) {
  const name = validateRepoName(params.name);
  const fullName = `${params.owner_login}/${name}`;
  if (gh.repos.findOneBy("full_name", fullName)) {
    throw new ApiError(422, "Repository already exists");
  }
  const isPrivate = params.private;
  const visibility = isPrivate ? "private" : "public";
  const license = typeof params.license_template === "string" ? resolveLicenseTemplate(params.license_template) : null;
  const repo = gh.repos.insert({
    node_id: "",
    name,
    full_name: fullName,
    owner_id: params.owner_id,
    owner_type: params.owner_type,
    private: isPrivate,
    description: params.description,
    fork: false,
    forked_from_id: null,
    homepage: params.homepage,
    language: null,
    languages: {},
    forks_count: 0,
    stargazers_count: 0,
    watchers_count: 0,
    size: 0,
    default_branch: params.default_branch,
    open_issues_count: 0,
    topics: [],
    has_issues: params.has_issues,
    has_projects: params.has_projects,
    has_wiki: params.has_wiki,
    has_pages: false,
    has_downloads: true,
    has_discussions: false,
    archived: false,
    disabled: false,
    visibility,
    pushed_at: null,
    allow_rebase_merge: params.allow_rebase_merge ?? true,
    allow_squash_merge: params.allow_squash_merge ?? true,
    allow_merge_commit: params.allow_merge_commit ?? true,
    allow_auto_merge: false,
    delete_branch_on_merge: params.delete_branch_on_merge ?? false,
    allow_forking: true,
    is_template: false,
    license
  });
  gh.repos.update(repo.id, { node_id: generateNodeId("Repository", repo.id) });
  if (!isPrivate) {
    bumpPublicRepos(gh, params.owner_id, params.owner_type, 1);
  }
  const updated = gh.repos.get(repo.id);
  if (params.auto_init) {
    seedInitialGit(gh, updated, actor);
  }
  return gh.repos.get(repo.id);
}
function deleteRepoCascade(gh, repo) {
  const repoId = repo.id;
  const wasPublic = !repo.private;
  const delByRepo = (col) => {
    for (const item of col.findBy("repo_id", repoId)) {
      col.delete(item.id);
    }
  };
  delByRepo(gh.collaborators);
  delByRepo(gh.issues);
  delByRepo(gh.pullRequests);
  delByRepo(gh.labels);
  delByRepo(gh.milestones);
  delByRepo(gh.comments);
  delByRepo(gh.reviews);
  delByRepo(gh.issueEvents);
  delByRepo(gh.branches);
  delByRepo(gh.branchProtections);
  delByRepo(gh.refs);
  delByRepo(gh.commits);
  delByRepo(gh.trees);
  delByRepo(gh.blobs);
  delByRepo(gh.tags);
  for (const rel of gh.releases.findBy("repo_id", repoId)) {
    for (const a of gh.releaseAssets.findBy("release_id", rel.id)) {
      gh.releaseAssets.delete(a.id);
    }
    gh.releases.delete(rel.id);
  }
  delByRepo(gh.webhooks);
  delByRepo(gh.workflows);
  for (const run of gh.workflowRuns.findBy("repo_id", repoId)) {
    for (const j of gh.jobs.findBy("run_id", run.id)) {
      gh.jobs.delete(j.id);
    }
    for (const a of gh.artifacts.findBy("run_id", run.id)) {
      gh.artifacts.delete(a.id);
    }
    gh.workflowRuns.delete(run.id);
  }
  delByRepo(gh.secrets);
  delByRepo(gh.checkRuns);
  delByRepo(gh.checkSuites);
  gh.repos.delete(repoId);
  if (wasPublic) {
    bumpPublicRepos(gh, repo.owner_id, repo.owner_type, -1);
  }
  if (repo.forked_from_id) {
    const parent = gh.repos.get(repo.forked_from_id);
    if (parent && parent.forks_count > 0) {
      gh.repos.update(parent.id, { forks_count: parent.forks_count - 1 });
    }
  }
}
function formatTagItem(tag, repo, baseUrl) {
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  return {
    name: tag.tag,
    zipball_url: `${repoUrl}/zipball/${encodeURIComponent(tag.tag)}`,
    tarball_url: `${repoUrl}/tarball/${encodeURIComponent(tag.tag)}`,
    commit: {
      sha: tag.sha,
      url: `${repoUrl}/commits/${tag.sha}`
    },
    node_id: tag.node_id
  };
}
function parsePermission(raw) {
  if (raw === void 0) return void 0;
  if (raw === "pull" || raw === "triage" || raw === "push" || raw === "maintain" || raw === "admin") {
    return raw;
  }
  return void 0;
}
function reposRoutes({ app, store, webhooks, baseUrl }) {
  const gh = getGitHubStore(store);
  app.get("/repos/:owner/:repo", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoRead(gh, c.get("authUser"), repo);
    return c.json(formatRepo(repo, gh, baseUrl));
  });
  app.get("/repositories/:id", (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isInteger(id)) throw notFound();
    const repo = gh.repos.get(id);
    if (!repo) throw notFound();
    assertRepoRead(gh, c.get("authUser"), repo);
    return c.json(formatRepo(repo, gh, baseUrl));
  });
  app.post("/user/repos", async (c) => {
    const authUser = c.get("authUser");
    const user = assertAuthenticatedUser(gh, authUser);
    const body = await parseJsonBody(c);
    const finalRepo = createRepoRecord(
      gh,
      {
        name: body.name,
        description: typeof body.description === "string" ? body.description : null,
        private: typeof body.private === "boolean" ? body.private : false,
        homepage: typeof body.homepage === "string" ? body.homepage : null,
        has_issues: typeof body.has_issues === "boolean" ? body.has_issues : true,
        has_projects: typeof body.has_projects === "boolean" ? body.has_projects : true,
        has_wiki: typeof body.has_wiki === "boolean" ? body.has_wiki : true,
        auto_init: body.auto_init === true,
        license_template: typeof body.license_template === "string" ? body.license_template : void 0,
        gitignore_template: typeof body.gitignore_template === "string" ? body.gitignore_template : void 0,
        owner_id: user.id,
        owner_type: "User",
        owner_login: user.login,
        default_branch: "main",
        baseUrl,
        allow_rebase_merge: typeof body.allow_rebase_merge === "boolean" ? body.allow_rebase_merge : void 0,
        allow_squash_merge: typeof body.allow_squash_merge === "boolean" ? body.allow_squash_merge : void 0,
        allow_merge_commit: typeof body.allow_merge_commit === "boolean" ? body.allow_merge_commit : void 0,
        delete_branch_on_merge: typeof body.delete_branch_on_merge === "boolean" ? body.delete_branch_on_merge : void 0
      },
      user
    );
    webhooks.dispatch(
      "repository",
      "created",
      { action: "created", repository: formatRepo(finalRepo, gh, baseUrl), sender: formatUser(user, baseUrl) },
      user.login,
      finalRepo.name
    );
    return c.json(formatRepo(finalRepo, gh, baseUrl), 201);
  });
  app.post("/orgs/:org/repos", async (c) => {
    const authUser = c.get("authUser");
    const user = assertAuthenticatedUser(gh, authUser);
    const orgLogin = c.req.param("org");
    const org = gh.orgs.findOneBy("login", orgLogin);
    if (!org) throw notFound();
    if (!isOrgMember(gh, user.id, org.id)) {
      throw forbidden();
    }
    const body = await parseJsonBody(c);
    const finalRepo = createRepoRecord(
      gh,
      {
        name: body.name,
        description: typeof body.description === "string" ? body.description : null,
        private: typeof body.private === "boolean" ? body.private : false,
        homepage: typeof body.homepage === "string" ? body.homepage : null,
        has_issues: typeof body.has_issues === "boolean" ? body.has_issues : true,
        has_projects: typeof body.has_projects === "boolean" ? body.has_projects : true,
        has_wiki: typeof body.has_wiki === "boolean" ? body.has_wiki : true,
        auto_init: body.auto_init === true,
        license_template: typeof body.license_template === "string" ? body.license_template : void 0,
        gitignore_template: typeof body.gitignore_template === "string" ? body.gitignore_template : void 0,
        owner_id: org.id,
        owner_type: "Organization",
        owner_login: org.login,
        default_branch: "main",
        baseUrl,
        allow_rebase_merge: typeof body.allow_rebase_merge === "boolean" ? body.allow_rebase_merge : void 0,
        allow_squash_merge: typeof body.allow_squash_merge === "boolean" ? body.allow_squash_merge : void 0,
        allow_merge_commit: typeof body.allow_merge_commit === "boolean" ? body.allow_merge_commit : void 0,
        delete_branch_on_merge: typeof body.delete_branch_on_merge === "boolean" ? body.delete_branch_on_merge : void 0
      },
      user
    );
    webhooks.dispatch(
      "repository",
      "created",
      { action: "created", repository: formatRepo(finalRepo, gh, baseUrl), sender: formatUser(user, baseUrl) },
      org.login,
      finalRepo.name
    );
    return c.json(formatRepo(finalRepo, gh, baseUrl), 201);
  });
  app.patch("/repos/:owner/:repo", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoRead(gh, c.get("authUser"), repo);
    const authUser = c.get("authUser");
    const user = assertAuthenticatedUser(gh, authUser);
    if (!hasRepoAdmin(gh, user, repo)) throw forbidden();
    const body = await parseJsonBody(c);
    const patch = {};
    if (typeof body.name === "string") {
      const newName = validateRepoName(body.name);
      const login = ownerLoginOf(gh, repo);
      const newFull = `${login}/${newName}`;
      if (newFull !== repo.full_name && gh.repos.findOneBy("full_name", newFull)) {
        throw new ApiError(422, "Repository already exists");
      }
      patch.name = newName;
      patch.full_name = newFull;
    }
    if ("description" in body) {
      patch.description = body.description === null ? null : String(body.description);
    }
    if ("homepage" in body && (typeof body.homepage === "string" || body.homepage === null)) {
      patch.homepage = body.homepage;
    }
    if (typeof body.private === "boolean") {
      patch.private = body.private;
      patch.visibility = body.private ? "private" : "public";
    }
    if (typeof body.has_issues === "boolean") patch.has_issues = body.has_issues;
    if (typeof body.has_projects === "boolean") patch.has_projects = body.has_projects;
    if (typeof body.has_wiki === "boolean") patch.has_wiki = body.has_wiki;
    if (typeof body.has_pages === "boolean") patch.has_pages = body.has_pages;
    if (typeof body.has_downloads === "boolean") patch.has_downloads = body.has_downloads;
    if (typeof body.has_discussions === "boolean") patch.has_discussions = body.has_discussions;
    if (typeof body.archived === "boolean") patch.archived = body.archived;
    if (typeof body.disabled === "boolean") patch.disabled = body.disabled;
    if (typeof body.default_branch === "string") patch.default_branch = body.default_branch;
    if (Array.isArray(body.topics)) {
      patch.topics = body.topics.filter((t) => typeof t === "string");
    }
    if (typeof body.visibility === "string") {
      const v = body.visibility;
      if (v === "public" || v === "private" || v === "internal") {
        patch.visibility = v;
        patch.private = v !== "public";
      }
    }
    if ("license" in body) {
      if (body.license === null) patch.license = null;
      else if (typeof body.license === "object" && body.license !== null) {
        const L = body.license;
        if (typeof L.key === "string" && typeof L.name === "string" && typeof L.spdx_id === "string") {
          patch.license = { key: L.key, name: L.name, spdx_id: L.spdx_id };
        }
      }
    }
    if (typeof body.allow_rebase_merge === "boolean") patch.allow_rebase_merge = body.allow_rebase_merge;
    if (typeof body.allow_squash_merge === "boolean") patch.allow_squash_merge = body.allow_squash_merge;
    if (typeof body.allow_merge_commit === "boolean") patch.allow_merge_commit = body.allow_merge_commit;
    if (typeof body.allow_auto_merge === "boolean") patch.allow_auto_merge = body.allow_auto_merge;
    if (typeof body.delete_branch_on_merge === "boolean") {
      patch.delete_branch_on_merge = body.delete_branch_on_merge;
    }
    if (typeof body.allow_forking === "boolean") patch.allow_forking = body.allow_forking;
    if (typeof body.is_template === "boolean") patch.is_template = body.is_template;
    const oldPrivate = repo.private;
    const updated = gh.repos.update(repo.id, patch);
    if (!updated) throw notFound();
    if (oldPrivate !== updated.private) {
      const delta = updated.private ? -1 : 1;
      bumpPublicRepos(gh, updated.owner_id, updated.owner_type, delta);
    }
    webhooks.dispatch(
      "repository",
      "edited",
      { action: "edited", repository: formatRepo(updated, gh, baseUrl), sender: formatUser(user, baseUrl) },
      ownerLoginOf(gh, updated),
      updated.name
    );
    return c.json(formatRepo(updated, gh, baseUrl));
  });
  app.delete("/repos/:owner/:repo", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const authUser = c.get("authUser");
    const user = assertAuthenticatedUser(gh, authUser);
    if (!hasRepoAdmin(gh, user, repo)) throw forbidden();
    webhooks.dispatch(
      "repository",
      "deleted",
      { action: "deleted", repository: formatRepo(repo, gh, baseUrl), sender: formatUser(user, baseUrl) },
      owner,
      repoName
    );
    deleteRepoCascade(gh, repo);
    return c.body(null, 204);
  });
  app.get("/repos/:owner/:repo/topics", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoRead(gh, c.get("authUser"), repo);
    return c.json({ names: repo.topics });
  });
  app.put("/repos/:owner/:repo/topics", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const authUser = c.get("authUser");
    const user = assertAuthenticatedUser(gh, authUser);
    if (!hasRepoAdmin(gh, user, repo)) throw forbidden();
    const body = await parseJsonBody(c);
    const names = Array.isArray(body.names) ? body.names.filter((n) => typeof n === "string") : [];
    const updated = gh.repos.update(repo.id, { topics: names });
    if (!updated) throw notFound();
    return c.json({ names: updated.topics });
  });
  app.get("/repos/:owner/:repo/languages", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoRead(gh, c.get("authUser"), repo);
    return c.json(repo.languages);
  });
  app.get("/repos/:owner/:repo/contributors", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoRead(gh, c.get("authUser"), repo);
    const collabUsers = gh.collaborators.findBy("repo_id", repo.id).map((col) => gh.users.get(col.user_id)).filter((u) => Boolean(u));
    const ownerUser = repo.owner_type === "User" ? gh.users.get(repo.owner_id) : void 0;
    const map = /* @__PURE__ */ new Map();
    if (ownerUser) map.set(ownerUser.id, ownerUser);
    for (const u of collabUsers) map.set(u.id, u);
    const all = [...map.values()].sort((a, b) => a.login.localeCompare(b.login));
    const { page, per_page } = parsePagination(c);
    const total = all.length;
    const start = (page - 1) * per_page;
    const slice = all.slice(start, start + per_page);
    setLinkHeader(c, total, page, per_page);
    return c.json(
      slice.map((u) => ({
        ...formatUser(u, baseUrl),
        contributions: 1
      }))
    );
  });
  app.get("/repos/:owner/:repo/forks", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoRead(gh, c.get("authUser"), repo);
    const forks = gh.repos.all().filter((r) => r.forked_from_id === repo.id).sort((a, b) => a.created_at < b.created_at ? 1 : -1);
    const { page, per_page } = parsePagination(c);
    const total = forks.length;
    const start = (page - 1) * per_page;
    const slice = forks.slice(start, start + per_page);
    setLinkHeader(c, total, page, per_page);
    return c.json(slice.map((r) => formatRepo(r, gh, baseUrl)));
  });
  app.post("/repos/:owner/:repo/forks", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const parent = lookupRepo(gh, owner, repoName);
    if (!parent) throw notFound();
    const authUser = c.get("authUser");
    const user = assertAuthenticatedUser(gh, authUser);
    assertRepoRead(gh, authUser, parent);
    const body = await parseJsonBody(c);
    let ownerType = "User";
    let ownerId = user.id;
    let fullName = "";
    const forkName = typeof body.name === "string" && body.name.trim() ? validateRepoName(body.name) : parent.name;
    if (typeof body.organization === "string" && body.organization.trim()) {
      const org = gh.orgs.findOneBy("login", body.organization.trim());
      if (!org) throw notFound();
      if (!isOrgMember(gh, user.id, org.id)) throw forbidden();
      ownerType = "Organization";
      ownerId = org.id;
      fullName = `${org.login}/${forkName}`;
    } else {
      fullName = `${user.login}/${forkName}`;
    }
    if (gh.repos.findOneBy("full_name", fullName)) {
      throw new ApiError(422, "Repository already exists");
    }
    const isPrivate = parent.private;
    const visibility = isPrivate ? "private" : "public";
    const repo = gh.repos.insert({
      node_id: "",
      name: forkName,
      full_name: fullName,
      owner_id: ownerId,
      owner_type: ownerType,
      private: isPrivate,
      description: parent.description,
      fork: true,
      forked_from_id: parent.id,
      homepage: parent.homepage,
      language: parent.language,
      languages: { ...parent.languages },
      forks_count: 0,
      stargazers_count: 0,
      watchers_count: 0,
      size: parent.size,
      default_branch: parent.default_branch,
      open_issues_count: 0,
      topics: [...parent.topics],
      has_issues: parent.has_issues,
      has_projects: parent.has_projects,
      has_wiki: parent.has_wiki,
      has_pages: parent.has_pages,
      has_downloads: parent.has_downloads,
      has_discussions: parent.has_discussions,
      archived: false,
      disabled: false,
      visibility,
      pushed_at: parent.pushed_at,
      allow_rebase_merge: parent.allow_rebase_merge,
      allow_squash_merge: parent.allow_squash_merge,
      allow_merge_commit: parent.allow_merge_commit,
      allow_auto_merge: parent.allow_auto_merge,
      delete_branch_on_merge: parent.delete_branch_on_merge,
      allow_forking: parent.allow_forking,
      is_template: false,
      license: parent.license
    });
    gh.repos.update(repo.id, { node_id: generateNodeId("Repository", repo.id) });
    if (!isPrivate) {
      bumpPublicRepos(gh, ownerId, ownerType, 1);
    }
    gh.repos.update(parent.id, { forks_count: parent.forks_count + 1 });
    seedInitialGit(gh, gh.repos.get(repo.id), user, parent.full_name);
    const finalRepo = gh.repos.get(repo.id);
    const ownerLogin2 = ownerLoginOf(gh, finalRepo);
    webhooks.dispatch(
      "fork",
      "created",
      { action: "created", repository: formatRepo(finalRepo, gh, baseUrl), sender: formatUser(user, baseUrl) },
      ownerLogin2,
      finalRepo.name
    );
    return c.json(formatRepo(finalRepo, gh, baseUrl), 202);
  });
  app.get("/repos/:owner/:repo/collaborators", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoRead(gh, c.get("authUser"), repo);
    const collabs = gh.collaborators.findBy("repo_id", repo.id);
    const users = collabs.map((col) => {
      const u = gh.users.get(col.user_id);
      if (!u) return null;
      return { user: u, permission: col.permission };
    }).filter((x) => Boolean(x)).sort((a, b) => a.user.login.localeCompare(b.user.login));
    const { page, per_page } = parsePagination(c);
    const total = users.length;
    const start = (page - 1) * per_page;
    const slice = users.slice(start, start + per_page);
    setLinkHeader(c, total, page, per_page);
    return c.json(slice.map((x) => formatUser(x.user, baseUrl)));
  });
  app.put("/repos/:owner/:repo/collaborators/:username", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const username = c.req.param("username");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const authUser = c.get("authUser");
    const actor = assertAuthenticatedUser(gh, authUser);
    if (!hasRepoAdmin(gh, actor, repo)) throw forbidden();
    const target = gh.users.findOneBy("login", username);
    if (!target) throw notFound();
    const body = await parseJsonBody(c);
    const permission = parsePermission(body.permission) ?? "push";
    const existing = gh.collaborators.findBy("repo_id", repo.id).find((c2) => c2.user_id === target.id);
    if (existing) {
      gh.collaborators.update(existing.id, { permission });
    } else {
      gh.collaborators.insert({
        repo_id: repo.id,
        user_id: target.id,
        permission
      });
    }
    return c.json({ permission }, 201);
  });
  app.delete("/repos/:owner/:repo/collaborators/:username", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const username = c.req.param("username");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const authUser = c.get("authUser");
    const actor = assertAuthenticatedUser(gh, authUser);
    if (!hasRepoAdmin(gh, actor, repo)) throw forbidden();
    const target = gh.users.findOneBy("login", username);
    if (!target) throw notFound();
    const existing = gh.collaborators.findBy("repo_id", repo.id).find((col) => col.user_id === target.id);
    if (existing) {
      gh.collaborators.delete(existing.id);
    }
    return c.body(null, 204);
  });
  app.get("/repos/:owner/:repo/collaborators/:username/permission", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const username = c.req.param("username");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoRead(gh, c.get("authUser"), repo);
    const target = gh.users.findOneBy("login", username);
    if (!target) throw notFound();
    if (repo.owner_type === "User" && repo.owner_id === target.id) {
      return c.json({
        permission: "admin",
        role_name: "admin",
        user: formatUser(target, baseUrl)
      });
    }
    if (repo.owner_type === "Organization" && isOrgMember(gh, target.id, repo.owner_id)) {
      return c.json({
        permission: "admin",
        role_name: "admin",
        user: formatUser(target, baseUrl)
      });
    }
    const collab = gh.collaborators.findBy("repo_id", repo.id).find((col) => col.user_id === target.id);
    if (!collab) throw notFound();
    const roleName = collab.permission === "admin" ? "admin" : collab.permission === "maintain" ? "maintain" : collab.permission === "push" ? "write" : collab.permission === "triage" ? "triage" : "read";
    return c.json({
      permission: collab.permission,
      role_name: roleName,
      user: formatUser(target, baseUrl)
    });
  });
  app.post("/repos/:owner/:repo/transfer", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const authUser = c.get("authUser");
    const actor = assertAuthenticatedUser(gh, authUser);
    if (!hasRepoAdmin(gh, actor, repo)) throw forbidden();
    const body = await parseJsonBody(c);
    if (typeof body.new_owner !== "string" || !body.new_owner.trim()) {
      throw new ApiError(422, "new_owner is required");
    }
    const newOwner = lookupOwner(gh, body.new_owner.trim());
    if (!newOwner) throw notFound();
    const newFull = `${newOwner.login}/${repo.name}`;
    if (newFull !== repo.full_name && gh.repos.findOneBy("full_name", newFull)) {
      throw new ApiError(422, "Repository already exists");
    }
    const updated = gh.repos.update(repo.id, {
      owner_id: newOwner.id,
      owner_type: newOwner.type === "User" ? "User" : "Organization",
      full_name: newFull
    });
    if (!updated) throw notFound();
    webhooks.dispatch(
      "repository",
      "transferred",
      { action: "transferred", repository: formatRepo(updated, gh, baseUrl), sender: formatUser(actor, baseUrl) },
      newOwner.login,
      updated.name
    );
    return c.json(formatRepo(updated, gh, baseUrl));
  });
  app.get("/repos/:owner/:repo/tags", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoRead(gh, c.get("authUser"), repo);
    const tags = [...gh.tags.findBy("repo_id", repo.id)].sort((a, b) => a.tag.localeCompare(b.tag));
    const { page, per_page } = parsePagination(c);
    const total = tags.length;
    const start = (page - 1) * per_page;
    const slice = tags.slice(start, start + per_page);
    setLinkHeader(c, total, page, per_page);
    return c.json(slice.map((t) => formatTagItem(t, repo, baseUrl)));
  });
}
function findIssueForRepo(gh, repoId, issueNumber) {
  return gh.issues.findBy("repo_id", repoId).find((i) => i.number === issueNumber && !i.is_pull_request);
}
function adjustRepoOpenIssues(gh, repoId, delta) {
  const repo = gh.repos.get(repoId);
  if (!repo) return;
  gh.repos.update(repoId, { open_issues_count: Math.max(0, repo.open_issues_count + delta) });
}
function getOrCreateLabel(gh, repo, name) {
  const existing = gh.labels.findBy("repo_id", repo.id).find((l) => l.name === name);
  if (existing) return existing;
  const label = gh.labels.insert({
    node_id: "",
    repo_id: repo.id,
    name,
    description: null,
    color: "ededed",
    default: false
  });
  gh.labels.update(label.id, { node_id: generateNodeId("Label", label.id) });
  return gh.labels.get(label.id);
}
function resolveLabelIds(gh, repo, raw, createMissing) {
  if (raw === void 0) return [];
  if (!Array.isArray(raw)) {
    throw new ApiError(422, "Validation failed");
  }
  const ids = [];
  for (const item of raw) {
    if (typeof item === "number" && Number.isFinite(item)) {
      const label = gh.labels.get(item);
      if (!label || label.repo_id !== repo.id) {
        throw new ApiError(422, "Validation failed");
      }
      ids.push(item);
    } else if (typeof item === "string") {
      if (createMissing) {
        ids.push(getOrCreateLabel(gh, repo, item).id);
      } else {
        const label = gh.labels.findBy("repo_id", repo.id).find((l) => l.name === item);
        if (!label) throw new ApiError(422, "Validation failed");
        ids.push(label.id);
      }
    } else {
      throw new ApiError(422, "Validation failed");
    }
  }
  return [...new Set(ids)];
}
function lookupUserByLogin(gh, login) {
  const u = gh.users.findOneBy("login", login);
  if (!u) throw new ApiError(422, "Validation failed");
  return u;
}
function insertIssueEvent(gh, repo, issueNumber, event, actorId, extra) {
  const row = gh.issueEvents.insert({
    node_id: "",
    repo_id: repo.id,
    issue_number: issueNumber,
    event,
    actor_id: actorId,
    commit_id: null,
    commit_url: null,
    label_name: null,
    assignee_id: null,
    milestone_title: null,
    rename: null,
    ...extra
  });
  gh.issueEvents.update(row.id, { node_id: generateNodeId("IssueEvent", row.id) });
  return gh.issueEvents.get(row.id);
}
function formatIssueEventApi(ev, gh, repo, issue, baseUrl) {
  const actor = gh.users.get(ev.actor_id);
  const issueJson = formatIssue(issue, gh, baseUrl);
  return {
    id: ev.id,
    node_id: ev.node_id,
    url: `${baseUrl}/repos/${repo.full_name}/issues/events/${ev.id}`,
    actor: actor ? formatUser(actor, baseUrl) : null,
    event: ev.event,
    commit_id: ev.commit_id,
    commit_url: ev.commit_url,
    created_at: ev.created_at,
    label: ev.label_name !== null ? gh.labels.findBy("repo_id", repo.id).find((l) => l.name === ev.label_name) ? {
      name: ev.label_name,
      color: gh.labels.findBy("repo_id", repo.id).find((l) => l.name === ev.label_name).color
    } : { name: ev.label_name, color: "ededed" } : null,
    assignee: ev.assignee_id !== null && gh.users.get(ev.assignee_id) ? formatUser(gh.users.get(ev.assignee_id), baseUrl) : null,
    milestone: null,
    rename: ev.rename,
    issue: issueJson
  };
}
function sortIssues(issues, sort, direction) {
  const mul = direction === "asc" ? 1 : -1;
  const field = sort === "created" ? "created_at" : sort === "updated" ? "updated_at" : "comments";
  const sorted = [...issues];
  sorted.sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (typeof av === "number" && typeof bv === "number") {
      return av < bv ? -1 * mul : av > bv ? 1 * mul : 0;
    }
    const as = String(av);
    const bs = String(bv);
    if (as < bs) return -1 * mul;
    if (as > bs) return 1 * mul;
    return 0;
  });
  return sorted;
}
function parseIssueListFilters(c) {
  const stateQ = c.req.query("state") ?? "open";
  const state = stateQ === "closed" || stateQ === "all" || stateQ === "open" ? stateQ : "open";
  const labelsParam = c.req.query("labels");
  const labelNames = labelsParam ? labelsParam.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const sortRaw = c.req.query("sort") ?? "created";
  const sort = sortRaw === "updated" || sortRaw === "comments" ? sortRaw : "created";
  const dirRaw = c.req.query("direction") ?? "desc";
  const direction = dirRaw === "asc" ? "asc" : "desc";
  const milestoneQ = c.req.query("milestone");
  const assigneeQ = c.req.query("assignee");
  const creatorQ = c.req.query("creator");
  const sinceQ = c.req.query("since");
  return {
    state,
    labelNames,
    sort,
    direction,
    milestoneQ,
    assigneeQ,
    creatorQ,
    sinceQ
  };
}
function issuesRoutes({ app, store, webhooks, baseUrl }) {
  const gh = getGitHubStore(store);
  app.get("/repos/:owner/:repo/issues", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "issues");
    if (!repo.has_issues) throw notFound();
    const { page, per_page } = parsePagination(c);
    const { state, labelNames, sort, direction, milestoneQ, assigneeQ, creatorQ, sinceQ } = parseIssueListFilters(c);
    let list = gh.issues.findBy("repo_id", repo.id).filter((i) => !i.is_pull_request);
    if (state === "open") list = list.filter((i) => i.state === "open");
    else if (state === "closed") list = list.filter((i) => i.state === "closed");
    if (labelNames.length > 0) {
      const labelIds = labelNames.map((name) => gh.labels.findBy("repo_id", repo.id).find((l) => l.name === name)?.id).filter((x) => x !== void 0);
      if (labelIds.length !== labelNames.length) {
        return c.json([]);
      }
      list = list.filter((i) => labelIds.every((lid) => i.label_ids.includes(lid)));
    }
    if (milestoneQ !== void 0 && milestoneQ !== "") {
      if (milestoneQ === "none") {
        list = list.filter((i) => i.milestone_id === null);
      } else if (milestoneQ === "*") {
        list = list.filter((i) => i.milestone_id !== null);
      } else {
        const n = parseInt(milestoneQ, 10);
        if (!Number.isFinite(n)) {
          list = [];
        } else {
          const ms = gh.milestones.findBy("repo_id", repo.id).find((m) => m.number === n);
          if (!ms) list = [];
          else list = list.filter((i) => i.milestone_id === ms.id);
        }
      }
    }
    if (assigneeQ !== void 0 && assigneeQ !== "") {
      if (assigneeQ === "none") {
        list = list.filter((i) => i.assignee_ids.length === 0);
      } else if (assigneeQ === "*") {
        list = list.filter((i) => i.assignee_ids.length > 0);
      } else {
        const u = gh.users.findOneBy("login", assigneeQ);
        if (!u) list = [];
        else list = list.filter((i) => i.assignee_ids.includes(u.id));
      }
    }
    if (creatorQ !== void 0 && creatorQ !== "") {
      const u = gh.users.findOneBy("login", creatorQ);
      if (!u) list = [];
      else list = list.filter((i) => i.user_id === u.id);
    }
    if (sinceQ) {
      list = list.filter((i) => i.updated_at >= sinceQ);
    }
    list = sortIssues(list, sort, direction);
    const total = list.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    const pageItems = list.slice(start, start + per_page);
    const body = pageItems.map((i) => formatIssue(i, gh, baseUrl)).filter((x) => x !== null);
    return c.json(body);
  });
  app.post("/repos/:owner/:repo/issues", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    if (!repo.has_issues) throw notFound();
    const actor = assertIssueWrite(gh, c.get("authUser"), repo);
    const body = await parseJsonBody(c);
    const title = body.title;
    if (typeof title !== "string" || !title.trim()) {
      throw new ApiError(422, "Validation failed");
    }
    const issueBody = typeof body.body === "string" || body.body === null ? body.body : null;
    const assigneeLogins = Array.isArray(body.assignees) ? body.assignees.filter((x) => typeof x === "string") : [];
    const assigneeIds = assigneeLogins.map((login) => lookupUserByLogin(gh, login).id);
    const labelIds = body.labels !== void 0 ? resolveLabelIds(gh, repo, body.labels, true) : [];
    let milestoneId = null;
    if (body.milestone !== void 0 && body.milestone !== null) {
      const mn = typeof body.milestone === "number" ? body.milestone : parseInt(String(body.milestone), 10);
      if (!Number.isFinite(mn)) throw new ApiError(422, "Validation failed");
      const ms = gh.milestones.findBy("repo_id", repo.id).find((m) => m.number === mn);
      if (!ms) throw new ApiError(422, "Validation failed");
      milestoneId = ms.id;
    }
    const num = getNextIssueNumber(gh, repo.id);
    const row = gh.issues.insert({
      node_id: "",
      number: num,
      repo_id: repo.id,
      title: title.trim(),
      body: issueBody,
      state: "open",
      state_reason: null,
      locked: false,
      active_lock_reason: null,
      user_id: actor.id,
      assignee_ids: assigneeIds,
      label_ids: labelIds,
      milestone_id: milestoneId,
      comments: 0,
      closed_at: null,
      closed_by_id: null,
      is_pull_request: false
    });
    gh.issues.update(row.id, { node_id: generateNodeId("Issue", row.id) });
    const issue = gh.issues.get(row.id);
    adjustRepoOpenIssues(gh, repo.id, 1);
    insertIssueEvent(gh, repo, issue.number, "opened", actor.id);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    const issueFmt = formatIssue(issue, gh, baseUrl);
    webhooks.dispatch(
      "issues",
      "opened",
      {
        action: "opened",
        issue: issueFmt,
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    return c.json(issueFmt, 201);
  });
  app.get("/repos/:owner/:repo/issues/:issue_number", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "issues");
    if (!repo.has_issues) throw notFound();
    const issueNumber = parseInt(c.req.param("issue_number"), 10);
    if (!Number.isFinite(issueNumber)) throw notFound();
    const issue = findIssueForRepo(gh, repo.id, issueNumber);
    if (!issue || issue.is_pull_request) throw notFound();
    const json = formatIssue(issue, gh, baseUrl);
    if (!json) throw notFound();
    return c.json(json);
  });
  app.patch("/repos/:owner/:repo/issues/:issue_number", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    if (!repo.has_issues) throw notFound();
    const actor = assertIssueWrite(gh, c.get("authUser"), repo);
    const issueNumber = parseInt(c.req.param("issue_number"), 10);
    if (!Number.isFinite(issueNumber)) throw notFound();
    let issue = findIssueForRepo(gh, repo.id, issueNumber);
    if (!issue || issue.is_pull_request) throw notFound();
    const beforePatch = issue;
    const body = await parseJsonBody(c);
    const patch = {};
    if (typeof body.title === "string") patch.title = body.title;
    if ("body" in body) {
      patch.body = body.body === null ? null : String(body.body);
    }
    const oldState = issue.state;
    if (body.state === "open" || body.state === "closed") {
      patch.state = body.state;
    }
    if ("state_reason" in body) {
      if (body.state_reason === null) {
        patch.state_reason = null;
      } else if (body.state_reason === "completed" || body.state_reason === "not_planned" || body.state_reason === "reopened") {
        patch.state_reason = body.state_reason;
      }
    }
    if (Array.isArray(body.labels)) {
      patch.label_ids = resolveLabelIds(gh, repo, body.labels, true);
    }
    if (Array.isArray(body.assignees)) {
      const logins = body.assignees.filter((x) => typeof x === "string");
      patch.assignee_ids = logins.map((login) => lookupUserByLogin(gh, login).id);
    }
    if ("milestone" in body) {
      if (body.milestone === null) {
        patch.milestone_id = null;
      } else {
        const mn = typeof body.milestone === "number" ? body.milestone : parseInt(String(body.milestone), 10);
        if (!Number.isFinite(mn)) throw new ApiError(422, "Validation failed");
        const ms = gh.milestones.findBy("repo_id", repo.id).find((m) => m.number === mn);
        if (!ms) throw new ApiError(422, "Validation failed");
        patch.milestone_id = ms.id;
      }
    }
    const prevLabelIds = new Set(issue.label_ids);
    const prevAssigneeIds = new Set(issue.assignee_ids);
    const prevMilestoneId = issue.milestone_id;
    const updated = gh.issues.update(issue.id, patch);
    if (!updated) throw notFound();
    issue = updated;
    let statePatch = {};
    if (patch.state === "closed" && oldState === "open") {
      statePatch = {
        closed_at: timestamp(),
        closed_by_id: actor.id,
        ...patch.state_reason === void 0 ? { state_reason: "completed" } : {}
      };
    } else if (patch.state === "open" && oldState === "closed") {
      statePatch = {
        closed_at: null,
        closed_by_id: null,
        ...patch.state_reason === void 0 ? { state_reason: "reopened" } : {}
      };
    } else if (patch.state === "closed" && oldState === "closed") {
      if (patch.state_reason !== void 0) statePatch.state_reason = patch.state_reason;
    }
    if (Object.keys(statePatch).length > 0) {
      const again = gh.issues.update(issue.id, statePatch);
      if (again) issue = again;
    }
    const ownerLogin2 = ownerLoginOf(gh, repo);
    if (patch.state === "closed" && oldState === "open") {
      adjustRepoOpenIssues(gh, repo.id, -1);
      insertIssueEvent(gh, repo, issue.number, "closed", actor.id);
      webhooks.dispatch(
        "issues",
        "closed",
        {
          action: "closed",
          issue: formatIssue(issue, gh, baseUrl),
          repository: formatRepo(repo, gh, baseUrl),
          sender: formatUser(actor, baseUrl)
        },
        ownerLogin2,
        repo.name
      );
    } else if (patch.state === "open" && oldState === "closed") {
      adjustRepoOpenIssues(gh, repo.id, 1);
      insertIssueEvent(gh, repo, issue.number, "reopened", actor.id);
      webhooks.dispatch(
        "issues",
        "reopened",
        {
          action: "reopened",
          issue: formatIssue(issue, gh, baseUrl),
          repository: formatRepo(repo, gh, baseUrl),
          sender: formatUser(actor, baseUrl)
        },
        ownerLogin2,
        repo.name
      );
    }
    if (Array.isArray(body.labels)) {
      const newIds = new Set(issue.label_ids);
      for (const id of prevLabelIds) {
        if (!newIds.has(id)) {
          const label = gh.labels.get(id);
          insertIssueEvent(gh, repo, issue.number, "unlabeled", actor.id, {
            label_name: label?.name ?? null
          });
          webhooks.dispatch(
            "issues",
            "unlabeled",
            {
              action: "unlabeled",
              issue: formatIssue(issue, gh, baseUrl),
              label: label ? { name: label.name, color: label.color } : null,
              repository: formatRepo(repo, gh, baseUrl),
              sender: formatUser(actor, baseUrl)
            },
            ownerLogin2,
            repo.name
          );
        }
      }
      for (const id of newIds) {
        if (!prevLabelIds.has(id)) {
          const label = gh.labels.get(id);
          if (label) {
            insertIssueEvent(gh, repo, issue.number, "labeled", actor.id, { label_name: label.name });
            webhooks.dispatch(
              "issues",
              "labeled",
              {
                action: "labeled",
                issue: formatIssue(issue, gh, baseUrl),
                label: { name: label.name, color: label.color },
                repository: formatRepo(repo, gh, baseUrl),
                sender: formatUser(actor, baseUrl)
              },
              ownerLogin2,
              repo.name
            );
          }
        }
      }
    }
    if (Array.isArray(body.assignees)) {
      const newAssignees = new Set(issue.assignee_ids);
      for (const id of prevAssigneeIds) {
        if (!newAssignees.has(id)) {
          insertIssueEvent(gh, repo, issue.number, "unassigned", actor.id, { assignee_id: id });
          const u = gh.users.get(id);
          webhooks.dispatch(
            "issues",
            "unassigned",
            {
              action: "unassigned",
              issue: formatIssue(issue, gh, baseUrl),
              assignee: u ? formatUser(u, baseUrl) : null,
              repository: formatRepo(repo, gh, baseUrl),
              sender: formatUser(actor, baseUrl)
            },
            ownerLogin2,
            repo.name
          );
        }
      }
      for (const id of newAssignees) {
        if (!prevAssigneeIds.has(id)) {
          insertIssueEvent(gh, repo, issue.number, "assigned", actor.id, { assignee_id: id });
          const u = gh.users.get(id);
          webhooks.dispatch(
            "issues",
            "assigned",
            {
              action: "assigned",
              issue: formatIssue(issue, gh, baseUrl),
              assignee: u ? formatUser(u, baseUrl) : null,
              repository: formatRepo(repo, gh, baseUrl),
              sender: formatUser(actor, baseUrl)
            },
            ownerLogin2,
            repo.name
          );
        }
      }
    }
    if ("milestone" in body) {
      const newMs = issue.milestone_id;
      if (prevMilestoneId !== newMs) {
        const oldTitle = prevMilestoneId ? gh.milestones.get(prevMilestoneId)?.title ?? null : null;
        const newTitle = newMs ? gh.milestones.get(newMs)?.title ?? null : null;
        if (prevMilestoneId !== null) {
          insertIssueEvent(gh, repo, issue.number, "demilestoned", actor.id, {
            milestone_title: oldTitle
          });
          webhooks.dispatch(
            "issues",
            "demilestoned",
            {
              action: "demilestoned",
              issue: formatIssue(issue, gh, baseUrl),
              milestone: oldTitle ? { title: oldTitle } : null,
              repository: formatRepo(repo, gh, baseUrl),
              sender: formatUser(actor, baseUrl)
            },
            ownerLogin2,
            repo.name
          );
        }
        if (newMs !== null) {
          insertIssueEvent(gh, repo, issue.number, "milestoned", actor.id, {
            milestone_title: newTitle
          });
          webhooks.dispatch(
            "issues",
            "milestoned",
            {
              action: "milestoned",
              issue: formatIssue(issue, gh, baseUrl),
              milestone: newTitle ? { title: newTitle } : null,
              repository: formatRepo(repo, gh, baseUrl),
              sender: formatUser(actor, baseUrl)
            },
            ownerLogin2,
            repo.name
          );
        }
      }
    }
    const titleEdited = typeof body.title === "string" && body.title !== beforePatch.title;
    const bodyEdited = "body" in body && (body.body === null ? beforePatch.body !== null : String(body.body) !== (beforePatch.body ?? ""));
    if (titleEdited || bodyEdited) {
      insertIssueEvent(gh, repo, issue.number, "edited", actor.id);
      webhooks.dispatch(
        "issues",
        "edited",
        {
          action: "edited",
          issue: formatIssue(issue, gh, baseUrl),
          repository: formatRepo(repo, gh, baseUrl),
          sender: formatUser(actor, baseUrl),
          changes: {
            title: titleEdited,
            body: bodyEdited
          }
        },
        ownerLogin2,
        repo.name
      );
    }
    const json = formatIssue(issue, gh, baseUrl);
    if (!json) throw notFound();
    return c.json(json);
  });
  app.put("/repos/:owner/:repo/issues/:issue_number/lock", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    if (!repo.has_issues) throw notFound();
    const actor = assertIssueWrite(gh, c.get("authUser"), repo);
    const issueNumber = parseInt(c.req.param("issue_number"), 10);
    if (!Number.isFinite(issueNumber)) throw notFound();
    let issue = findIssueForRepo(gh, repo.id, issueNumber);
    if (!issue || issue.is_pull_request) throw notFound();
    const body = await parseJsonBody(c);
    const lockReason = typeof body.lock_reason === "string" ? body.lock_reason : typeof body.active_lock_reason === "string" ? body.active_lock_reason : "resolved";
    issue = gh.issues.update(issue.id, {
      locked: true,
      active_lock_reason: lockReason
    });
    insertIssueEvent(gh, repo, issue.number, "locked", actor.id);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    webhooks.dispatch(
      "issues",
      "locked",
      {
        action: "locked",
        issue: formatIssue(issue, gh, baseUrl),
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    return c.body(null, 204);
  });
  app.delete("/repos/:owner/:repo/issues/:issue_number/lock", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    if (!repo.has_issues) throw notFound();
    const actor = assertIssueWrite(gh, c.get("authUser"), repo);
    const issueNumber = parseInt(c.req.param("issue_number"), 10);
    if (!Number.isFinite(issueNumber)) throw notFound();
    let issue = findIssueForRepo(gh, repo.id, issueNumber);
    if (!issue || issue.is_pull_request) throw notFound();
    issue = gh.issues.update(issue.id, { locked: false, active_lock_reason: null });
    insertIssueEvent(gh, repo, issue.number, "unlocked", actor.id);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    webhooks.dispatch(
      "issues",
      "unlocked",
      {
        action: "unlocked",
        issue: formatIssue(issue, gh, baseUrl),
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    return c.body(null, 204);
  });
  function listIssueEventsForIssue(c) {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "issues");
    if (!repo.has_issues) throw notFound();
    const issueNumber = parseInt(c.req.param("issue_number"), 10);
    if (!Number.isFinite(issueNumber)) throw notFound();
    const issue = findIssueForRepo(gh, repo.id, issueNumber);
    if (!issue || issue.is_pull_request) throw notFound();
    const { page, per_page } = parsePagination(c);
    let events = gh.issueEvents.findBy("repo_id", repo.id).filter((e) => e.issue_number === issueNumber);
    events.sort((a, b) => a.created_at.localeCompare(b.created_at));
    const total = events.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    events = events.slice(start, start + per_page);
    const payload = events.map((ev) => formatIssueEventApi(ev, gh, repo, issue, baseUrl));
    return c.json(payload);
  }
  app.get("/repos/:owner/:repo/issues/:issue_number/timeline", (c) => listIssueEventsForIssue(c));
  app.get("/repos/:owner/:repo/issues/:issue_number/events", (c) => listIssueEventsForIssue(c));
  app.post("/repos/:owner/:repo/issues/:issue_number/assignees", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    if (!repo.has_issues) throw notFound();
    const actor = assertIssueWrite(gh, c.get("authUser"), repo);
    const issueNumber = parseInt(c.req.param("issue_number"), 10);
    if (!Number.isFinite(issueNumber)) throw notFound();
    let issue = findIssueForRepo(gh, repo.id, issueNumber);
    if (!issue || issue.is_pull_request) throw notFound();
    const body = await parseJsonBody(c);
    const logins = Array.isArray(body.assignees) ? body.assignees.filter((x) => typeof x === "string") : [];
    const addIds = logins.map((login) => lookupUserByLogin(gh, login).id);
    const prevAssigneeSet = new Set(issue.assignee_ids);
    const merged = [.../* @__PURE__ */ new Set([...issue.assignee_ids, ...addIds])];
    issue = gh.issues.update(issue.id, { assignee_ids: merged });
    const ownerLogin2 = ownerLoginOf(gh, repo);
    for (const id of addIds) {
      if (prevAssigneeSet.has(id)) continue;
      insertIssueEvent(gh, repo, issue.number, "assigned", actor.id, { assignee_id: id });
      const u = gh.users.get(id);
      webhooks.dispatch(
        "issues",
        "assigned",
        {
          action: "assigned",
          issue: formatIssue(issue, gh, baseUrl),
          assignee: u ? formatUser(u, baseUrl) : null,
          repository: formatRepo(repo, gh, baseUrl),
          sender: formatUser(actor, baseUrl)
        },
        ownerLogin2,
        repo.name
      );
    }
    const json = formatIssue(issue, gh, baseUrl);
    if (!json) throw notFound();
    return c.json(json);
  });
  app.delete("/repos/:owner/:repo/issues/:issue_number/assignees", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    if (!repo.has_issues) throw notFound();
    const actor = assertIssueWrite(gh, c.get("authUser"), repo);
    const issueNumber = parseInt(c.req.param("issue_number"), 10);
    if (!Number.isFinite(issueNumber)) throw notFound();
    let issue = findIssueForRepo(gh, repo.id, issueNumber);
    if (!issue || issue.is_pull_request) throw notFound();
    const body = await parseJsonBody(c);
    const logins = Array.isArray(body.assignees) ? body.assignees.filter((x) => typeof x === "string") : [];
    const removeIds = new Set(logins.map((login) => lookupUserByLogin(gh, login).id));
    const prevAssignees = new Set(issue.assignee_ids);
    const merged = issue.assignee_ids.filter((id) => !removeIds.has(id));
    issue = gh.issues.update(issue.id, { assignee_ids: merged });
    const ownerLogin2 = ownerLoginOf(gh, repo);
    for (const id of removeIds) {
      if (prevAssignees.has(id)) {
        insertIssueEvent(gh, repo, issue.number, "unassigned", actor.id, { assignee_id: id });
        const u = gh.users.get(id);
        webhooks.dispatch(
          "issues",
          "unassigned",
          {
            action: "unassigned",
            issue: formatIssue(issue, gh, baseUrl),
            assignee: u ? formatUser(u, baseUrl) : null,
            repository: formatRepo(repo, gh, baseUrl),
            sender: formatUser(actor, baseUrl)
          },
          ownerLogin2,
          repo.name
        );
      }
    }
    const json = formatIssue(issue, gh, baseUrl);
    if (!json) throw notFound();
    return c.json(json);
  });
}
function findPull(gh, repoId, pullNumber) {
  return gh.pullRequests.findBy("repo_id", repoId).find((p) => p.number === pullNumber);
}
function findPrIssue(gh, repoId, number) {
  return gh.issues.findBy("repo_id", repoId).find((i) => i.number === number && i.is_pull_request);
}
function adjustRepoOpenIssues2(gh, repoId, delta) {
  const repo = gh.repos.get(repoId);
  if (!repo) return;
  gh.repos.update(repoId, { open_issues_count: Math.max(0, repo.open_issues_count + delta) });
}
function getDefaultBranchSha(gh, repo) {
  const branch = gh.branches.findBy("repo_id", repo.id).find((b) => b.name === repo.default_branch);
  if (!branch) {
    throw new ApiError(422, "The repository is empty.");
  }
  return branch.sha;
}
function createBranchAt(gh, repo, branchName, sha) {
  const b = gh.branches.insert({
    repo_id: repo.id,
    name: branchName,
    sha,
    protected: false
  });
  const ref = gh.refs.insert({
    repo_id: repo.id,
    ref: `refs/heads/${branchName}`,
    sha,
    node_id: ""
  });
  gh.refs.update(ref.id, { node_id: generateNodeId("Ref", ref.id) });
  return b;
}
function findBranch(gh, repo, branchName) {
  return gh.branches.findBy("repo_id", repo.id).find((b) => b.name === branchName);
}
function getOrCreateBranch(gh, repo, branchName) {
  const existing = findBranch(gh, repo, branchName);
  if (existing) return existing;
  const tip = getDefaultBranchSha(gh, repo);
  return createBranchAt(gh, repo, branchName, tip);
}
function assertBranchCreationAllowed(gh, authUser, repo, branchName) {
  if (!findBranch(gh, repo, branchName)) {
    assertRepoPermission(gh, authUser, repo, "contents", "write");
  }
}
function updateBranchSha(gh, repo, branchName, newSha) {
  const branch = gh.branches.findBy("repo_id", repo.id).find((b) => b.name === branchName);
  if (branch) gh.branches.update(branch.id, { sha: newSha });
  const ref = gh.refs.findBy("repo_id", repo.id).find((r) => r.ref === `refs/heads/${branchName}`);
  if (ref) gh.refs.update(ref.id, { sha: newSha });
}
function resolveHeadTarget(gh, baseRepo, head2) {
  const trimmed = head2.trim();
  if (!trimmed.includes(":")) {
    return { headRepo: baseRepo, headRef: trimmed };
  }
  const idx = trimmed.indexOf(":");
  const ownerLogin2 = trimmed.slice(0, idx).trim();
  const ref = trimmed.slice(idx + 1).trim();
  if (!ref) throw new ApiError(422, "Validation failed");
  const baseOwner = ownerLoginOf(gh, baseRepo);
  if (ownerLogin2 === baseOwner) {
    return { headRepo: baseRepo, headRef: ref };
  }
  const fork = gh.repos.all().find((r) => {
    if (r.forked_from_id !== baseRepo.id) return false;
    const login = r.owner_type === "User" ? gh.users.get(r.owner_id)?.login : gh.orgs.get(r.owner_id)?.login;
    return login === ownerLogin2;
  });
  if (!fork) throw new ApiError(422, "Validation failed");
  return { headRepo: fork, headRef: ref };
}
function countCommitsBetween(gh, repo, headSha, baseSha) {
  const chain = walkCommitsToBase(gh, repo, headSha, baseSha);
  return chain.length;
}
function walkCommitsToBase(gh, repo, headSha, baseSha) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  let cur = headSha;
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    const commit = gh.commits.findBy("repo_id", repo.id).find((c) => c.sha === cur);
    if (!commit) break;
    out.push(commit);
    if (cur === baseSha) break;
    cur = commit.parent_shas[0];
  }
  return out.reverse();
}
function insertCommit(gh, repo, opts) {
  const u = opts.user;
  const authorName = u?.name ?? u?.login ?? "User";
  const login = u?.login ?? "user";
  const email = u?.email ?? `${login}@users.noreply.github.com`;
  const now = timestamp();
  return findOrCreateCommit(gh, repo.id, {
    message: opts.message,
    author_name: authorName,
    author_email: email,
    author_date: now,
    committer_name: authorName,
    committer_email: email,
    committer_date: now,
    tree_sha: opts.treeSha,
    parent_shas: opts.parentShas,
    user_id: u?.id ?? null
  });
}
function formatCommitApi(commit, repo, baseUrl) {
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  return {
    sha: commit.sha,
    node_id: commit.node_id,
    url: `${repoUrl}/commits/${commit.sha}`,
    html_url: `${baseUrl}/${repo.full_name}/commit/${commit.sha}`,
    comments_url: `${repoUrl}/comments/${commit.sha}`,
    commit: {
      url: `${repoUrl}/git/commits/${commit.sha}`,
      author: {
        name: commit.author_name,
        email: commit.author_email,
        date: commit.author_date
      },
      committer: {
        name: commit.committer_name,
        email: commit.committer_email,
        date: commit.committer_date
      },
      message: commit.message,
      tree: { sha: commit.tree_sha },
      comment_count: 0,
      verification: {
        verified: false,
        reason: "unsigned",
        signature: null,
        payload: null,
        verified_at: null
      }
    },
    author: null,
    committer: null,
    parents: commit.parent_shas.map((sha) => ({
      sha,
      url: `${repoUrl}/commits/${sha}`,
      html_url: `${baseUrl}/${repo.full_name}/commit/${sha}`
    }))
  };
}
function headLabel(gh, pr) {
  const headRepo = gh.repos.get(pr.head_repo_id);
  const owner = headRepo ? headRepo.owner_type === "User" ? gh.users.get(headRepo.owner_id)?.login : gh.orgs.get(headRepo.owner_id)?.login : void 0;
  return `${owner ?? "unknown"}:${pr.head_ref}`;
}
function matchesHeadFilter(gh, pr, headParam) {
  const trimmed = headParam.trim();
  if (!trimmed) return true;
  if (!trimmed.includes(":")) {
    return pr.head_ref === trimmed;
  }
  return headLabel(gh, pr) === trimmed;
}
function sortPulls(list, sort, direction) {
  const sorted = [...list];
  sorted.sort((a, b) => {
    if (sort === "long-running") {
      const cmp = a.created_at.localeCompare(b.created_at);
      return direction === "desc" ? cmp : -cmp;
    }
    const mul = direction === "asc" ? 1 : -1;
    if (sort === "updated") {
      return a.updated_at.localeCompare(b.updated_at) * mul;
    }
    if (sort === "created") {
      return a.created_at.localeCompare(b.created_at) * mul;
    }
    const av = a.comments + a.review_comments;
    const bv = b.comments + b.review_comments;
    if (av < bv) return -1 * mul;
    if (av > bv) return 1 * mul;
    return 0;
  });
  return sorted;
}
function checkMergeRequirements(gh, pr) {
  const baseRepo = gh.repos.get(pr.base_repo_id);
  if (!baseRepo) throw new ApiError(422, "Base repository not found");
  const rule = gh.branchProtections.findBy("repo_id", baseRepo.id).find((p) => p.branch_name === pr.base_ref);
  if (!rule) return;
  const checks = rule.required_status_checks;
  if (checks && checks.contexts.length > 0) {
    const runs = gh.checkRuns.findBy("repo_id", baseRepo.id).filter((r) => r.head_sha === pr.head_sha);
    for (const ctx of checks.contexts) {
      const ok = runs.some((r) => r.name === ctx && r.status === "completed" && r.conclusion === "success");
      if (!ok) {
        throw new ApiError(422, "Required status checks have not succeeded.");
      }
    }
  }
  const rev = rule.required_pull_request_reviews;
  if (rev) {
    const need = rev.required_approving_review_count;
    const approved = gh.reviews.findBy("repo_id", baseRepo.id).filter((r) => r.pull_number === pr.number && r.state === "APPROVED");
    const approvers = new Set(approved.map((r) => r.user_id));
    if (approvers.size < need) {
      throw new ApiError(422, "Required approving review count not met.");
    }
  }
}
function deleteBranchByName(gh, repo, branchName) {
  const branch = gh.branches.findBy("repo_id", repo.id).find((b) => b.name === branchName);
  if (branch) gh.branches.delete(branch.id);
  const ref = gh.refs.findBy("repo_id", repo.id).find((r) => r.ref === `refs/heads/${branchName}`);
  if (ref) gh.refs.delete(ref.id);
}
function lookupUserByLogin2(gh, login) {
  const u = gh.users.findOneBy("login", login);
  if (!u) throw new ApiError(422, "Validation failed");
  return u;
}
function lookupTeamSlug(gh, orgId, slug) {
  const t = gh.teams.findBy("org_id", orgId).find((x) => x.slug === slug);
  if (!t) throw new ApiError(422, "Validation failed");
  return t;
}
function pullsRoutes({ app, store, webhooks, baseUrl }) {
  const gh = getGitHubStore(store);
  app.get("/repos/:owner/:repo/pulls", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "pull_requests");
    const stateQ = c.req.query("state") ?? "open";
    const state = stateQ === "closed" || stateQ === "all" || stateQ === "open" ? stateQ : "open";
    const headQ = c.req.query("head") ?? "";
    const baseQ = c.req.query("base") ?? "";
    const sortRaw = c.req.query("sort") ?? "created";
    const sort = sortRaw === "updated" || sortRaw === "popularity" || sortRaw === "long-running" ? sortRaw : "created";
    const dirRaw = c.req.query("direction") ?? "desc";
    const direction = dirRaw === "asc" ? "asc" : "desc";
    let list = gh.pullRequests.findBy("repo_id", repo.id);
    if (state === "open") list = list.filter((p) => p.state === "open");
    else if (state === "closed") list = list.filter((p) => p.state === "closed");
    if (baseQ.trim()) {
      list = list.filter((p) => p.base_ref === baseQ.trim());
    }
    if (headQ.trim()) {
      list = list.filter((p) => matchesHeadFilter(gh, p, headQ));
    }
    list = sortPulls(list, sort, direction);
    const { page, per_page } = parsePagination(c);
    const total = list.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    const pageItems = list.slice(start, start + per_page);
    const body = pageItems.map((p) => formatPullRequest(p, gh, baseUrl)).filter((x) => x !== null);
    return c.json(body);
  });
  app.post("/repos/:owner/:repo/pulls", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, "pull_requests");
    const body = await parseJsonBody(c);
    const title = body.title;
    if (typeof title !== "string" || !title.trim()) {
      throw new ApiError(422, "Validation failed");
    }
    const headRaw = body.head;
    const baseRaw = body.base;
    if (typeof headRaw !== "string" || !headRaw.trim()) throw new ApiError(422, "Validation failed");
    if (typeof baseRaw !== "string" || !baseRaw.trim()) throw new ApiError(422, "Validation failed");
    const { headRepo, headRef } = resolveHeadTarget(gh, repo, headRaw);
    const baseRef = baseRaw.trim();
    if (headRef === baseRef && headRepo.id === repo.id) {
      throw new ApiError(422, "Validation failed");
    }
    const prBody = typeof body.body === "string" || body.body === null ? body.body : null;
    const draft = typeof body.draft === "boolean" ? body.draft : false;
    const authUser = c.get("authUser");
    assertBranchCreationAllowed(gh, authUser, headRepo, headRef);
    assertBranchCreationAllowed(gh, authUser, repo, baseRef);
    const headBranch = getOrCreateBranch(gh, headRepo, headRef);
    const baseBranch = getOrCreateBranch(gh, repo, baseRef);
    const num = getNextIssueNumber(gh, repo.id);
    const now = timestamp();
    const issueRow = gh.issues.insert({
      node_id: "",
      number: num,
      repo_id: repo.id,
      title: title.trim(),
      body: prBody,
      state: "open",
      state_reason: null,
      locked: false,
      active_lock_reason: null,
      user_id: actor.id,
      assignee_ids: [],
      label_ids: [],
      milestone_id: null,
      comments: 0,
      closed_at: null,
      closed_by_id: null,
      is_pull_request: true
    });
    gh.issues.update(issueRow.id, { node_id: generateNodeId("Issue", issueRow.id) });
    const commitCount = countCommitsBetween(gh, headRepo, headBranch.sha, baseBranch.sha);
    const prRow = gh.pullRequests.insert({
      node_id: "",
      number: num,
      repo_id: repo.id,
      title: title.trim(),
      body: prBody,
      state: "open",
      locked: false,
      user_id: actor.id,
      assignee_ids: [],
      label_ids: [],
      milestone_id: null,
      head_ref: headRef,
      head_sha: headBranch.sha,
      head_repo_id: headRepo.id,
      base_ref: baseRef,
      base_sha: baseBranch.sha,
      base_repo_id: repo.id,
      merged: false,
      merged_at: null,
      merged_by_id: null,
      merge_commit_sha: null,
      mergeable: true,
      mergeable_state: "clean",
      comments: 0,
      review_comments: 0,
      commits: Math.max(1, commitCount),
      additions: 0,
      deletions: 0,
      changed_files: 0,
      draft,
      requested_reviewer_ids: [],
      requested_team_ids: [],
      closed_at: null,
      auto_merge: null
    });
    gh.pullRequests.update(prRow.id, { node_id: generateNodeId("PullRequest", prRow.id) });
    adjustRepoOpenIssues2(gh, repo.id, 1);
    const pr = gh.pullRequests.get(prRow.id);
    const prFmt = formatPullRequest(pr, gh, baseUrl);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    webhooks.dispatch(
      "pull_request",
      "opened",
      {
        action: "opened",
        pull_request: prFmt,
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    return c.json(prFmt, 201);
  });
  app.get("/repos/:owner/:repo/pulls/:pull_number", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "pull_requests");
    const pullNumber = parseInt(c.req.param("pull_number"), 10);
    if (!Number.isFinite(pullNumber)) throw notFound();
    const pr = findPull(gh, repo.id, pullNumber);
    if (!pr) throw notFound();
    const fmt = formatPullRequest(pr, gh, baseUrl);
    if (!fmt) throw notFound();
    return c.json(fmt);
  });
  app.patch("/repos/:owner/:repo/pulls/:pull_number", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, "pull_requests");
    const pullNumber = parseInt(c.req.param("pull_number"), 10);
    if (!Number.isFinite(pullNumber)) throw notFound();
    const pr = findPull(gh, repo.id, pullNumber);
    if (!pr) throw notFound();
    const body = await parseJsonBody(c);
    const patch = {};
    const issuePatch = {};
    if (typeof body.title === "string") {
      patch.title = body.title;
      issuePatch.title = body.title;
    }
    if (typeof body.body === "string" || body.body === null) {
      patch.body = body.body;
      issuePatch.body = body.body;
    }
    if (body.state === "open" || body.state === "closed") {
      const wasClosed = pr.state === "closed";
      patch.state = body.state;
      issuePatch.state = body.state;
      if (body.state === "closed") {
        patch.closed_at = timestamp();
        issuePatch.closed_at = timestamp();
        issuePatch.closed_by_id = actor.id;
      } else {
        patch.closed_at = null;
        issuePatch.closed_at = null;
        issuePatch.closed_by_id = null;
      }
      if (!wasClosed && body.state === "closed") {
        adjustRepoOpenIssues2(gh, repo.id, -1);
      } else if (wasClosed && body.state === "open") {
        adjustRepoOpenIssues2(gh, repo.id, 1);
      }
    }
    if (typeof body.base === "string" && body.base.trim()) {
      const newBase = body.base.trim();
      assertBranchCreationAllowed(gh, c.get("authUser"), repo, newBase);
      const bb = getOrCreateBranch(gh, repo, newBase);
      patch.base_ref = newBase;
      patch.base_sha = bb.sha;
      patch.base_repo_id = repo.id;
    }
    if (typeof body.draft === "boolean") {
      patch.draft = body.draft;
    }
    const updated = gh.pullRequests.update(pr.id, patch);
    if (!updated) throw notFound();
    const iss = findPrIssue(gh, repo.id, pullNumber);
    if (iss) {
      gh.issues.update(iss.id, issuePatch);
    }
    const fresh = gh.pullRequests.get(pr.id);
    const prFmt = formatPullRequest(fresh, gh, baseUrl);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    if (body.state === "closed" && pr.state === "open") {
      webhooks.dispatch(
        "pull_request",
        "closed",
        {
          action: "closed",
          pull_request: prFmt,
          repository: formatRepo(repo, gh, baseUrl),
          sender: formatUser(actor, baseUrl)
        },
        ownerLogin2,
        repo.name
      );
    } else if (body.state === "open" && pr.state === "closed") {
      webhooks.dispatch(
        "pull_request",
        "reopened",
        {
          action: "reopened",
          pull_request: prFmt,
          repository: formatRepo(repo, gh, baseUrl),
          sender: formatUser(actor, baseUrl)
        },
        ownerLogin2,
        repo.name
      );
    } else if (typeof body.title === "string" || typeof body.body === "string" || body.body === null) {
      webhooks.dispatch(
        "pull_request",
        "edited",
        {
          action: "edited",
          pull_request: prFmt,
          repository: formatRepo(repo, gh, baseUrl),
          sender: formatUser(actor, baseUrl)
        },
        ownerLogin2,
        repo.name
      );
    }
    return c.json(prFmt);
  });
  app.put("/repos/:owner/:repo/pulls/:pull_number/merge", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, "contents");
    const pullNumber = parseInt(c.req.param("pull_number"), 10);
    if (!Number.isFinite(pullNumber)) throw notFound();
    const pr = findPull(gh, repo.id, pullNumber);
    if (!pr) throw notFound();
    if (pr.merged || pr.state === "closed") {
      throw new ApiError(422, "Pull Request is not mergeable");
    }
    if (pr.draft) {
      throw new ApiError(422, "Draft pull requests cannot be merged.");
    }
    const body = await parseJsonBody(c);
    if (typeof body.sha === "string" && body.sha !== pr.head_sha) {
      throw new ApiError(422, "Head sha is out of date");
    }
    const mergeMethod = body.merge_method === "squash" || body.merge_method === "rebase" ? body.merge_method : "merge";
    if (mergeMethod === "merge" && !repo.allow_merge_commit) {
      throw new ApiError(422, "Merge commits are not allowed on this repository.");
    }
    if (mergeMethod === "squash" && !repo.allow_squash_merge) {
      throw new ApiError(422, "Squash merges are not allowed on this repository.");
    }
    if (mergeMethod === "rebase" && !repo.allow_rebase_merge) {
      throw new ApiError(422, "Rebase merges are not allowed on this repository.");
    }
    checkMergeRequirements(gh, pr);
    const baseRepo = gh.repos.get(pr.base_repo_id);
    const headRepo = gh.repos.get(pr.head_repo_id);
    const baseCommit = gh.commits.findBy("repo_id", baseRepo.id).find((x) => x.sha === pr.base_sha);
    const headCommit = gh.commits.findBy("repo_id", headRepo.id).find((x) => x.sha === pr.head_sha);
    if (!baseCommit || !headCommit) {
      throw new ApiError(422, "Could not resolve commits to merge.");
    }
    const commitTitle = typeof body.commit_title === "string" && body.commit_title.trim() ? body.commit_title.trim() : `Merge pull request #${pr.number} from ${headLabel(gh, pr)}`;
    const commitMessage = typeof body.commit_message === "string" && body.commit_message.trim() ? body.commit_message.trim() : "";
    const fullMessage = commitMessage ? `${commitTitle}

${commitMessage}` : commitTitle;
    let mergeCommit;
    if (mergeMethod === "merge") {
      mergeCommit = insertCommit(gh, baseRepo, {
        treeSha: headCommit.tree_sha,
        parentShas: [pr.base_sha, pr.head_sha],
        message: fullMessage,
        user: actor
      });
    } else {
      mergeCommit = insertCommit(gh, baseRepo, {
        treeSha: headCommit.tree_sha,
        parentShas: [pr.base_sha],
        message: fullMessage,
        user: actor
      });
    }
    updateBranchSha(gh, baseRepo, pr.base_ref, mergeCommit.sha);
    const now = timestamp();
    gh.pullRequests.update(pr.id, {
      merged: true,
      merged_at: now,
      merged_by_id: actor.id,
      merge_commit_sha: mergeCommit.sha,
      state: "closed",
      closed_at: now,
      mergeable: false,
      mergeable_state: "unknown"
    });
    const iss = findPrIssue(gh, repo.id, pullNumber);
    if (iss) {
      gh.issues.update(iss.id, {
        state: "closed",
        closed_at: now,
        closed_by_id: actor.id
      });
    }
    adjustRepoOpenIssues2(gh, repo.id, -1);
    if (repo.delete_branch_on_merge && pr.head_ref !== pr.base_ref) {
      deleteBranchByName(gh, headRepo, pr.head_ref);
    }
    const mergedPr = gh.pullRequests.get(pr.id);
    const prFmt = formatPullRequest(mergedPr, gh, baseUrl);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    webhooks.dispatch(
      "pull_request",
      "closed",
      {
        action: "closed",
        pull_request: { ...prFmt, merged: true },
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    return c.json({
      sha: mergeCommit.sha,
      merged: true,
      message: "Pull Request successfully merged"
    });
  });
  app.get("/repos/:owner/:repo/pulls/:pull_number/commits", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "pull_requests");
    const pullNumber = parseInt(c.req.param("pull_number"), 10);
    if (!Number.isFinite(pullNumber)) throw notFound();
    const pr = findPull(gh, repo.id, pullNumber);
    if (!pr) throw notFound();
    const headRepo = gh.repos.get(pr.head_repo_id);
    if (!headRepo) throw notFound();
    const chain = walkCommitsToBase(gh, headRepo, pr.head_sha, pr.base_sha);
    const { page, per_page } = parsePagination(c);
    const total = chain.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    const slice = chain.slice(start, start + per_page);
    return c.json(slice.map((commit) => formatCommitApi(commit, headRepo, baseUrl)));
  });
  app.get("/repos/:owner/:repo/pulls/:pull_number/files", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "pull_requests");
    const pullNumber = parseInt(c.req.param("pull_number"), 10);
    if (!Number.isFinite(pullNumber)) throw notFound();
    const pr = findPull(gh, repo.id, pullNumber);
    if (!pr) throw notFound();
    const { page, per_page } = parsePagination(c);
    const n = pr.changed_files;
    const stubNames = Array.from({ length: n }, (_, i) => `file${i + 1}.ts`);
    const total = stubNames.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    const pageNames = stubNames.slice(start, start + per_page);
    return c.json(
      pageNames.map((filename, i) => ({
        sha: generateSha(),
        filename,
        status: "modified",
        additions: 1,
        deletions: 0,
        changes: 1,
        blob_url: `${baseUrl}/${repo.full_name}/blob/${pr.head_sha}/${filename}`,
        raw_url: `${baseUrl}/${repo.full_name}/raw/${pr.head_sha}/${filename}`,
        contents_url: `${baseUrl}/repos/${repo.full_name}/contents/${encodeURIComponent(filename)}?ref=${pr.head_ref}`,
        patch: ""
      }))
    );
  });
  app.post("/repos/:owner/:repo/pulls/:pull_number/requested_reviewers", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, "pull_requests");
    const pullNumber = parseInt(c.req.param("pull_number"), 10);
    if (!Number.isFinite(pullNumber)) throw notFound();
    const pr = findPull(gh, repo.id, pullNumber);
    if (!pr) throw notFound();
    const body = await parseJsonBody(c);
    const reviewerLogins = Array.isArray(body.reviewers) ? body.reviewers.filter((x) => typeof x === "string") : [];
    const teamSlugs = Array.isArray(body.team_reviewers) ? body.team_reviewers.filter((x) => typeof x === "string") : [];
    const newUserIds = reviewerLogins.map((login) => lookupUserByLogin2(gh, login).id);
    let newTeamIds = [];
    if (teamSlugs.length > 0) {
      if (repo.owner_type !== "Organization") {
        throw new ApiError(422, "Team reviewers are only supported for organization repositories.");
      }
      newTeamIds = teamSlugs.map((slug) => lookupTeamSlug(gh, repo.owner_id, slug).id);
    }
    const requested_reviewer_ids = [.../* @__PURE__ */ new Set([...pr.requested_reviewer_ids, ...newUserIds])];
    const requested_team_ids = [.../* @__PURE__ */ new Set([...pr.requested_team_ids, ...newTeamIds])];
    gh.pullRequests.update(pr.id, { requested_reviewer_ids, requested_team_ids });
    const fresh = gh.pullRequests.get(pr.id);
    const prFmt = formatPullRequest(fresh, gh, baseUrl);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    webhooks.dispatch(
      "pull_request",
      "review_requested",
      {
        action: "review_requested",
        pull_request: prFmt,
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    return c.json(prFmt);
  });
  app.delete("/repos/:owner/:repo/pulls/:pull_number/requested_reviewers", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoWrite(gh, c.get("authUser"), repo, "pull_requests");
    const pullNumber = parseInt(c.req.param("pull_number"), 10);
    if (!Number.isFinite(pullNumber)) throw notFound();
    const pr = findPull(gh, repo.id, pullNumber);
    if (!pr) throw notFound();
    const body = await parseJsonBody(c);
    const reviewerLogins = Array.isArray(body.reviewers) ? body.reviewers.filter((x) => typeof x === "string") : [];
    const teamSlugs = Array.isArray(body.team_reviewers) ? body.team_reviewers.filter((x) => typeof x === "string") : [];
    const removeUserIds = new Set(reviewerLogins.map((login) => lookupUserByLogin2(gh, login).id));
    let removeTeamIds = /* @__PURE__ */ new Set();
    if (teamSlugs.length > 0 && repo.owner_type === "Organization") {
      removeTeamIds = new Set(teamSlugs.map((slug) => lookupTeamSlug(gh, repo.owner_id, slug).id));
    }
    const requested_reviewer_ids = pr.requested_reviewer_ids.filter((id) => !removeUserIds.has(id));
    const requested_team_ids = pr.requested_team_ids.filter((id) => !removeTeamIds.has(id));
    gh.pullRequests.update(pr.id, { requested_reviewer_ids, requested_team_ids });
    const fresh = gh.pullRequests.get(pr.id);
    return c.json(formatPullRequest(fresh, gh, baseUrl));
  });
  app.put("/repos/:owner/:repo/pulls/:pull_number/update-branch", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoWrite(gh, c.get("authUser"), repo, "pull_requests");
    const pullNumber = parseInt(c.req.param("pull_number"), 10);
    if (!Number.isFinite(pullNumber)) throw notFound();
    const pr = findPull(gh, repo.id, pullNumber);
    if (!pr) throw notFound();
    if (pr.state === "closed" || pr.merged) {
      throw new ApiError(422, "Cannot update a closed pull request");
    }
    const body = await parseJsonBody(c);
    if (typeof body.expected_head_sha === "string" && body.expected_head_sha !== pr.head_sha) {
      throw new ApiError(422, "Head sha is out of date");
    }
    const headRepo = gh.repos.get(pr.head_repo_id);
    const baseRepo = gh.repos.get(pr.base_repo_id);
    if (!headRepo || !baseRepo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), headRepo, "contents", "write");
    const headCommit = gh.commits.findBy("repo_id", headRepo.id).find((x) => x.sha === pr.head_sha);
    const baseCommit = gh.commits.findBy("repo_id", baseRepo.id).find((x) => x.sha === pr.base_sha);
    if (!headCommit || !baseCommit) throw new ApiError(422, "Could not resolve commits.");
    const actor = assertAuthenticatedActor(gh, c.get("authUser"));
    const mergeMsg = `Merge branch '${pr.base_ref}' into ${pr.head_ref}`;
    const newCommit = insertCommit(gh, headRepo, {
      treeSha: headCommit.tree_sha,
      parentShas: [pr.head_sha, pr.base_sha],
      message: mergeMsg,
      user: actor
    });
    updateBranchSha(gh, headRepo, pr.head_ref, newCommit.sha);
    const next = gh.pullRequests.update(pr.id, {
      head_sha: newCommit.sha,
      commits: pr.commits + 1
    });
    if (!next) throw notFound();
    const apiUrl = `${baseUrl}/repos/${repo.full_name}/pulls/${pullNumber}`;
    return c.json(
      {
        message: "Updating pull request branch.",
        url: apiUrl
      },
      202
    );
  });
}
function findIssueByNumber(gh, repoId, number) {
  return gh.issues.findBy("repo_id", repoId).find((i) => i.number === number);
}
function findPull2(gh, repoId, pullNumber) {
  return gh.pullRequests.findBy("repo_id", repoId).find((p) => p.number === pullNumber);
}
function findCommitInRepo(gh, repoId, shaParam) {
  const want = shaParam.toLowerCase();
  const list = gh.commits.findBy("repo_id", repoId);
  return list.find((c) => c.sha === shaParam || c.sha.toLowerCase() === want || c.sha.startsWith(shaParam));
}
function getCommentForRepo(gh, repo, commentId, kind) {
  const c = gh.comments.get(commentId);
  if (!c || c.repo_id !== repo.id || c.comment_type !== kind) return void 0;
  return c;
}
function sortComments(comments, sort, direction) {
  const mul = direction === "asc" ? 1 : -1;
  const field = sort === "created" ? "created_at" : "updated_at";
  const sorted = [...comments];
  sorted.sort((a, b) => {
    const as = a[field];
    const bs = b[field];
    if (as < bs) return -1 * mul;
    if (as > bs) return 1 * mul;
    return a.id < b.id ? -1 * mul : a.id > b.id ? 1 * mul : 0;
  });
  return sorted;
}
function parseCommentSort(c, defaultDirection) {
  const sortRaw = c.req.query("sort") ?? "created";
  const sort = sortRaw === "updated" ? "updated" : "created";
  const dirRaw = c.req.query("direction");
  const direction = dirRaw === "desc" ? "desc" : dirRaw === "asc" ? "asc" : defaultDirection;
  return { sort, direction };
}
function adjustIssueCommentCount(gh, issue, delta) {
  gh.issues.update(issue.id, { comments: Math.max(0, issue.comments + delta) });
}
function adjustPrReviewCommentCount(gh, pr, delta) {
  gh.pullRequests.update(pr.id, { review_comments: Math.max(0, pr.review_comments + delta) });
}
function commentsRoutes({ app, store, webhooks, baseUrl }) {
  const gh = getGitHubStore(store);
  app.get("/repos/:owner/:repo/issues/comments/:comment_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, ["issues", "pull_requests"]);
    if (!repo.has_issues) throw notFound();
    const commentId = parseInt(c.req.param("comment_id"), 10);
    if (!Number.isFinite(commentId)) throw notFound();
    const comment = getCommentForRepo(gh, repo, commentId, "issue");
    if (!comment) throw notFound();
    const json = formatComment(comment, gh, baseUrl);
    if (!json) throw notFound();
    return c.json(json);
  });
  app.patch("/repos/:owner/:repo/issues/comments/:comment_id", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    if (!repo.has_issues) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, ["issues", "pull_requests"]);
    const commentId = parseInt(c.req.param("comment_id"), 10);
    if (!Number.isFinite(commentId)) throw notFound();
    let comment = getCommentForRepo(gh, repo, commentId, "issue");
    if (!comment) throw notFound();
    const body = await parseJsonBody(c);
    if (typeof body.body !== "string") {
      throw new ApiError(422, "Validation failed");
    }
    comment = gh.comments.update(comment.id, { body: body.body });
    const issue = comment.issue_number !== null ? findIssueByNumber(gh, repo.id, comment.issue_number) : void 0;
    const ownerLogin2 = ownerLoginOf(gh, repo);
    const issueFmt = issue ? formatIssue(issue, gh, baseUrl) : null;
    const commentFmt = formatComment(comment, gh, baseUrl);
    if (!commentFmt) throw notFound();
    webhooks.dispatch(
      "issue_comment",
      "edited",
      {
        action: "edited",
        comment: commentFmt,
        issue: issueFmt,
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    return c.json(commentFmt);
  });
  app.delete("/repos/:owner/:repo/issues/comments/:comment_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    if (!repo.has_issues) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, ["issues", "pull_requests"]);
    const commentId = parseInt(c.req.param("comment_id"), 10);
    if (!Number.isFinite(commentId)) throw notFound();
    const comment = getCommentForRepo(gh, repo, commentId, "issue");
    if (!comment) throw notFound();
    const issue = comment.issue_number !== null ? findIssueByNumber(gh, repo.id, comment.issue_number) : void 0;
    const commentFmt = formatComment(comment, gh, baseUrl);
    const issueFmt = issue ? formatIssue(issue, gh, baseUrl) : null;
    const ownerLogin2 = ownerLoginOf(gh, repo);
    gh.comments.delete(comment.id);
    if (issue) adjustIssueCommentCount(gh, issue, -1);
    webhooks.dispatch(
      "issue_comment",
      "deleted",
      {
        action: "deleted",
        comment: commentFmt,
        issue: issueFmt,
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    return c.body(null, 204);
  });
  app.get("/repos/:owner/:repo/issues/comments", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, ["issues", "pull_requests"]);
    if (!repo.has_issues) throw notFound();
    const { page, per_page } = parsePagination(c);
    const { sort, direction } = parseCommentSort(c, "asc");
    const since = c.req.query("since");
    let list = gh.comments.findBy("repo_id", repo.id).filter((x) => x.comment_type === "issue");
    if (since) {
      list = list.filter((x) => x.updated_at >= since);
    }
    list = sortComments(list, sort, direction);
    const total = list.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    const pageItems = list.slice(start, start + per_page);
    const body = pageItems.map((x) => formatComment(x, gh, baseUrl)).filter((x) => x !== null);
    return c.json(body);
  });
  app.get("/repos/:owner/:repo/pulls/comments/:comment_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "pull_requests");
    const commentId = parseInt(c.req.param("comment_id"), 10);
    if (!Number.isFinite(commentId)) throw notFound();
    const comment = getCommentForRepo(gh, repo, commentId, "review");
    if (!comment) throw notFound();
    const json = formatComment(comment, gh, baseUrl);
    if (!json) throw notFound();
    return c.json(json);
  });
  app.patch("/repos/:owner/:repo/pulls/comments/:comment_id", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, "pull_requests");
    const commentId = parseInt(c.req.param("comment_id"), 10);
    if (!Number.isFinite(commentId)) throw notFound();
    let comment = getCommentForRepo(gh, repo, commentId, "review");
    if (!comment) throw notFound();
    const body = await parseJsonBody(c);
    if (typeof body.body !== "string") {
      throw new ApiError(422, "Validation failed");
    }
    comment = gh.comments.update(comment.id, { body: body.body });
    const pr = comment.pull_number !== null ? findPull2(gh, repo.id, comment.pull_number) : void 0;
    const ownerLogin2 = ownerLoginOf(gh, repo);
    const commentFmt = formatComment(comment, gh, baseUrl);
    if (!commentFmt) throw notFound();
    webhooks.dispatch(
      "pull_request_review_comment",
      "edited",
      {
        action: "edited",
        comment: commentFmt,
        pull_request: pr ? formatPullRequest(pr, gh, baseUrl) : null,
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    return c.json(commentFmt);
  });
  app.delete("/repos/:owner/:repo/pulls/comments/:comment_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, "pull_requests");
    const commentId = parseInt(c.req.param("comment_id"), 10);
    if (!Number.isFinite(commentId)) throw notFound();
    const comment = getCommentForRepo(gh, repo, commentId, "review");
    if (!comment) throw notFound();
    const pr = comment.pull_number !== null ? findPull2(gh, repo.id, comment.pull_number) : void 0;
    const commentFmt = formatComment(comment, gh, baseUrl);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    gh.comments.delete(comment.id);
    if (pr) adjustPrReviewCommentCount(gh, pr, -1);
    webhooks.dispatch(
      "pull_request_review_comment",
      "deleted",
      {
        action: "deleted",
        comment: commentFmt,
        pull_request: pr ? formatPullRequest(pr, gh, baseUrl) : null,
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    return c.body(null, 204);
  });
  app.get("/repos/:owner/:repo/pulls/comments", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "pull_requests");
    const { page, per_page } = parsePagination(c);
    const { sort, direction } = parseCommentSort(c, "asc");
    let list = gh.comments.findBy("repo_id", repo.id).filter((x) => x.comment_type === "review");
    list = sortComments(list, sort, direction);
    const total = list.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    const pageItems = list.slice(start, start + per_page);
    const body = pageItems.map((x) => formatComment(x, gh, baseUrl)).filter((x) => x !== null);
    return c.json(body);
  });
  app.get("/repos/:owner/:repo/comments/:comment_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const commentId = parseInt(c.req.param("comment_id"), 10);
    if (!Number.isFinite(commentId)) throw notFound();
    const comment = getCommentForRepo(gh, repo, commentId, "commit");
    if (!comment) throw notFound();
    const json = formatComment(comment, gh, baseUrl);
    if (!json) throw notFound();
    return c.json(json);
  });
  app.patch("/repos/:owner/:repo/comments/:comment_id", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoWrite(gh, c.get("authUser"), repo, "contents");
    const commentId = parseInt(c.req.param("comment_id"), 10);
    if (!Number.isFinite(commentId)) throw notFound();
    let comment = getCommentForRepo(gh, repo, commentId, "commit");
    if (!comment) throw notFound();
    const body = await parseJsonBody(c);
    if (typeof body.body !== "string") {
      throw new ApiError(422, "Validation failed");
    }
    comment = gh.comments.update(comment.id, { body: body.body });
    const json = formatComment(comment, gh, baseUrl);
    if (!json) throw notFound();
    return c.json(json);
  });
  app.delete("/repos/:owner/:repo/comments/:comment_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoWrite(gh, c.get("authUser"), repo, "contents");
    const commentId = parseInt(c.req.param("comment_id"), 10);
    if (!Number.isFinite(commentId)) throw notFound();
    const comment = getCommentForRepo(gh, repo, commentId, "commit");
    if (!comment) throw notFound();
    gh.comments.delete(comment.id);
    return c.body(null, 204);
  });
  app.get("/repos/:owner/:repo/comments", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const { page, per_page } = parsePagination(c);
    const { sort, direction } = parseCommentSort(c, "asc");
    let list = gh.comments.findBy("repo_id", repo.id).filter((x) => x.comment_type === "commit");
    list = sortComments(list, sort, direction);
    const total = list.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    const pageItems = list.slice(start, start + per_page);
    const body = pageItems.map((x) => formatComment(x, gh, baseUrl)).filter((x) => x !== null);
    return c.json(body);
  });
  app.get("/repos/:owner/:repo/issues/:issue_number/comments", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, ["issues", "pull_requests"]);
    if (!repo.has_issues) throw notFound();
    const issueNumber = parseInt(c.req.param("issue_number"), 10);
    if (!Number.isFinite(issueNumber)) throw notFound();
    const issue = findIssueByNumber(gh, repo.id, issueNumber);
    if (!issue) throw notFound();
    const { page, per_page } = parsePagination(c);
    const { sort, direction } = parseCommentSort(c, "asc");
    let list = gh.comments.findBy("repo_id", repo.id).filter((x) => x.comment_type === "issue" && x.issue_number === issueNumber);
    list = sortComments(list, sort, direction);
    const total = list.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    const pageItems = list.slice(start, start + per_page);
    const body = pageItems.map((x) => formatComment(x, gh, baseUrl)).filter((x) => x !== null);
    return c.json(body);
  });
  app.post("/repos/:owner/:repo/issues/:issue_number/comments", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    if (!repo.has_issues) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, ["issues", "pull_requests"]);
    const issueNumber = parseInt(c.req.param("issue_number"), 10);
    if (!Number.isFinite(issueNumber)) throw notFound();
    const issue = findIssueByNumber(gh, repo.id, issueNumber);
    if (!issue) throw notFound();
    const raw = await parseJsonBody(c);
    if (typeof raw.body !== "string" || !raw.body.trim()) {
      throw new ApiError(422, "Validation failed");
    }
    const row = gh.comments.insert({
      node_id: "",
      repo_id: repo.id,
      issue_number: issueNumber,
      pull_number: null,
      commit_sha: null,
      body: raw.body,
      user_id: actor.id,
      in_reply_to_id: null,
      path: null,
      position: null,
      line: null,
      side: null,
      subject_type: null,
      comment_type: "issue",
      review_id: null
    });
    gh.comments.update(row.id, { node_id: generateNodeId("IssueComment", row.id) });
    const comment = gh.comments.get(row.id);
    adjustIssueCommentCount(gh, issue, 1);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    const commentFmt = formatComment(comment, gh, baseUrl);
    webhooks.dispatch(
      "issue_comment",
      "created",
      {
        action: "created",
        comment: commentFmt,
        issue: formatIssue(issue, gh, baseUrl),
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    return c.json(commentFmt, 201);
  });
  app.get("/repos/:owner/:repo/pulls/:pull_number/comments", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "pull_requests");
    const pullNumber = parseInt(c.req.param("pull_number"), 10);
    if (!Number.isFinite(pullNumber)) throw notFound();
    const pr = findPull2(gh, repo.id, pullNumber);
    if (!pr) throw notFound();
    const { page, per_page } = parsePagination(c);
    const { sort, direction } = parseCommentSort(c, "asc");
    let list = gh.comments.findBy("repo_id", repo.id).filter((x) => x.comment_type === "review" && x.pull_number === pullNumber);
    list = sortComments(list, sort, direction);
    const total = list.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    const pageItems = list.slice(start, start + per_page);
    const body = pageItems.map((x) => formatComment(x, gh, baseUrl)).filter((x) => x !== null);
    return c.json(body);
  });
  app.post("/repos/:owner/:repo/pulls/:pull_number/comments", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, "pull_requests");
    const pullNumber = parseInt(c.req.param("pull_number"), 10);
    if (!Number.isFinite(pullNumber)) throw notFound();
    const pr = findPull2(gh, repo.id, pullNumber);
    if (!pr) throw notFound();
    const raw = await parseJsonBody(c);
    if (typeof raw.body !== "string" || !raw.body.trim()) {
      throw new ApiError(422, "Validation failed");
    }
    const commitSha = typeof raw.commit_id === "string" && raw.commit_id.trim() ? raw.commit_id.trim() : pr.head_sha;
    let inReplyTo = null;
    if (raw.in_reply_to_id !== void 0 && raw.in_reply_to_id !== null) {
      const rid = typeof raw.in_reply_to_id === "number" ? raw.in_reply_to_id : parseInt(String(raw.in_reply_to_id), 10);
      if (!Number.isFinite(rid)) throw new ApiError(422, "Validation failed");
      const parent = gh.comments.get(rid);
      if (!parent || parent.repo_id !== repo.id || parent.comment_type !== "review" || parent.pull_number !== pullNumber) {
        throw new ApiError(422, "Validation failed");
      }
      inReplyTo = rid;
    }
    const pathVal = raw.path === void 0 || raw.path === null ? null : typeof raw.path === "string" ? raw.path : null;
    const position = raw.position === void 0 || raw.position === null ? null : typeof raw.position === "number" && Number.isFinite(raw.position) ? raw.position : parseInt(String(raw.position), 10);
    const line = raw.line === void 0 || raw.line === null ? null : typeof raw.line === "number" && Number.isFinite(raw.line) ? raw.line : parseInt(String(raw.line), 10);
    let side = null;
    if (raw.side === "LEFT" || raw.side === "RIGHT") side = raw.side;
    else if (raw.side === null || raw.side === void 0) side = null;
    else throw new ApiError(422, "Validation failed");
    let subjectType = null;
    if (raw.subject_type === "line" || raw.subject_type === "file") subjectType = raw.subject_type;
    else if (raw.subject_type === null || raw.subject_type === void 0) subjectType = null;
    else throw new ApiError(422, "Validation failed");
    if (position !== null && !Number.isFinite(position)) throw new ApiError(422, "Validation failed");
    if (line !== null && !Number.isFinite(line)) throw new ApiError(422, "Validation failed");
    const row = gh.comments.insert({
      node_id: "",
      repo_id: repo.id,
      issue_number: null,
      pull_number: pullNumber,
      commit_sha: commitSha,
      body: raw.body,
      user_id: actor.id,
      in_reply_to_id: inReplyTo,
      path: pathVal,
      position: position !== null && Number.isFinite(position) ? position : null,
      line: line !== null && Number.isFinite(line) ? line : null,
      side,
      subject_type: subjectType,
      comment_type: "review",
      review_id: null
    });
    gh.comments.update(row.id, { node_id: generateNodeId("PullRequestReviewComment", row.id) });
    const comment = gh.comments.get(row.id);
    adjustPrReviewCommentCount(gh, pr, 1);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    const commentFmt = formatComment(comment, gh, baseUrl);
    webhooks.dispatch(
      "pull_request_review_comment",
      "created",
      {
        action: "created",
        comment: commentFmt,
        pull_request: formatPullRequest(pr, gh, baseUrl),
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    return c.json(commentFmt, 201);
  });
  app.get("/repos/:owner/:repo/commits/:commit_sha/comments", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const commitSha = c.req.param("commit_sha");
    const commit = findCommitInRepo(gh, repo.id, commitSha);
    if (!commit) throw notFound();
    const { page, per_page } = parsePagination(c);
    const { sort, direction } = parseCommentSort(c, "asc");
    let list = gh.comments.findBy("repo_id", repo.id).filter((x) => x.comment_type === "commit" && x.commit_sha === commit.sha);
    list = sortComments(list, sort, direction);
    const total = list.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    const pageItems = list.slice(start, start + per_page);
    const body = pageItems.map((x) => formatComment(x, gh, baseUrl)).filter((x) => x !== null);
    return c.json(body);
  });
  app.post("/repos/:owner/:repo/commits/:commit_sha/comments", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, "contents");
    const commitShaParam = c.req.param("commit_sha");
    const commit = findCommitInRepo(gh, repo.id, commitShaParam);
    if (!commit) throw notFound();
    const raw = await parseJsonBody(c);
    if (typeof raw.body !== "string" || !raw.body.trim()) {
      throw new ApiError(422, "Validation failed");
    }
    const pathVal = raw.path === void 0 || raw.path === null ? null : typeof raw.path === "string" ? raw.path : null;
    const position = raw.position === void 0 || raw.position === null ? null : typeof raw.position === "number" && Number.isFinite(raw.position) ? raw.position : parseInt(String(raw.position), 10);
    const line = raw.line === void 0 || raw.line === null ? null : typeof raw.line === "number" && Number.isFinite(raw.line) ? raw.line : parseInt(String(raw.line), 10);
    if (position !== null && !Number.isFinite(position)) throw new ApiError(422, "Validation failed");
    if (line !== null && !Number.isFinite(line)) throw new ApiError(422, "Validation failed");
    const row = gh.comments.insert({
      node_id: "",
      repo_id: repo.id,
      issue_number: null,
      pull_number: null,
      commit_sha: commit.sha,
      body: raw.body,
      user_id: actor.id,
      in_reply_to_id: null,
      path: pathVal,
      position: position !== null && Number.isFinite(position) ? position : null,
      line: line !== null && Number.isFinite(line) ? line : null,
      side: null,
      subject_type: null,
      comment_type: "commit",
      review_id: null
    });
    gh.comments.update(row.id, { node_id: generateNodeId("CommitComment", row.id) });
    const comment = gh.comments.get(row.id);
    const commentFmt = formatComment(comment, gh, baseUrl);
    return c.json(commentFmt, 201);
  });
}
function findPull3(gh, repoId, pullNumber) {
  return gh.pullRequests.findBy("repo_id", repoId).find((p) => p.number === pullNumber);
}
function findReview(gh, repo, pullNumber, reviewId) {
  const r = gh.reviews.get(reviewId);
  if (!r || r.repo_id !== repo.id || r.pull_number !== pullNumber) return void 0;
  return r;
}
function adjustPrReviewCommentCount2(gh, pr, delta) {
  gh.pullRequests.update(pr.id, { review_comments: Math.max(0, pr.review_comments + delta) });
}
function sortComments2(comments, sort, direction) {
  const mul = direction === "asc" ? 1 : -1;
  const field = sort === "created" ? "created_at" : "updated_at";
  const sorted = [...comments];
  sorted.sort((a, b) => {
    const as = a[field];
    const bs = b[field];
    if (as < bs) return -1 * mul;
    if (as > bs) return 1 * mul;
    return a.id < b.id ? -1 * mul : a.id > b.id ? 1 * mul : 0;
  });
  return sorted;
}
function parseCommentSort2(c, defaultDirection) {
  const sortRaw = c.req.query("sort") ?? "created";
  const sort = sortRaw === "updated" ? "updated" : "created";
  const dirRaw = c.req.query("direction");
  const direction = dirRaw === "desc" ? "desc" : dirRaw === "asc" ? "asc" : defaultDirection;
  return { sort, direction };
}
function parseSubmitEvent(raw) {
  if (raw === "APPROVE" || raw === "REQUEST_CHANGES" || raw === "COMMENT") return raw;
  throw new ApiError(422, "Validation failed");
}
function eventToState(event) {
  switch (event) {
    case "APPROVE":
      return "APPROVED";
    case "REQUEST_CHANGES":
      return "CHANGES_REQUESTED";
    case "COMMENT":
      return "COMMENTED";
    default:
      return "COMMENTED";
  }
}
function dispatchReviewWebhook(webhooks, gh, repo, review, pr, actor, baseUrl, action) {
  const ownerLogin2 = ownerLoginOf(gh, repo);
  const reviewFmt = formatReview(review, gh, baseUrl);
  if (!reviewFmt) return;
  webhooks.dispatch(
    "pull_request_review",
    action,
    {
      action,
      review: reviewFmt,
      pull_request: formatPullRequest(pr, gh, baseUrl),
      repository: formatRepo(repo, gh, baseUrl),
      sender: formatUser(actor, baseUrl)
    },
    ownerLogin2,
    repo.name
  );
}
function reviewsRoutes({ app, store, webhooks, baseUrl }) {
  const gh = getGitHubStore(store);
  app.get("/repos/:owner/:repo/pulls/:pull_number/reviews", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "pull_requests");
    const pullNumber = parseInt(c.req.param("pull_number"), 10);
    if (!Number.isFinite(pullNumber)) throw notFound();
    const pr = findPull3(gh, repo.id, pullNumber);
    if (!pr) throw notFound();
    const { page, per_page } = parsePagination(c);
    const list = gh.reviews.findBy("repo_id", repo.id).filter((r) => r.pull_number === pullNumber);
    list.sort((a, b) => a.id - b.id);
    const total = list.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    const pageItems = list.slice(start, start + per_page);
    const body = pageItems.map((r) => formatReview(r, gh, baseUrl)).filter((x) => x !== null);
    return c.json(body);
  });
  app.post("/repos/:owner/:repo/pulls/:pull_number/reviews", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, "pull_requests");
    const pullNumber = parseInt(c.req.param("pull_number"), 10);
    if (!Number.isFinite(pullNumber)) throw notFound();
    const pr = findPull3(gh, repo.id, pullNumber);
    if (!pr) throw notFound();
    const raw = await parseJsonBody(c);
    const eventRaw = raw.event;
    const hasEvent = eventRaw === "APPROVE" || eventRaw === "REQUEST_CHANGES" || eventRaw === "COMMENT";
    if (eventRaw !== void 0 && eventRaw !== null && !hasEvent) {
      throw new ApiError(422, "Validation failed");
    }
    const event = hasEvent ? parseSubmitEvent(eventRaw) : void 0;
    let bodyText = null;
    if (typeof raw.body === "string") bodyText = raw.body;
    else if (raw.body === null || raw.body === void 0) bodyText = null;
    else throw new ApiError(422, "Validation failed");
    const commitId = typeof raw.commit_id === "string" && raw.commit_id.trim() ? raw.commit_id.trim() : pr.head_sha || generateSha();
    const state = event ? eventToState(event) : "PENDING";
    const submittedAt = event ? timestamp() : null;
    const row = gh.reviews.insert({
      node_id: "",
      repo_id: repo.id,
      pull_number: pullNumber,
      user_id: actor.id,
      body: bodyText,
      state,
      commit_id: commitId,
      submitted_at: submittedAt
    });
    gh.reviews.update(row.id, { node_id: generateNodeId("PullRequestReview", row.id) });
    const review = gh.reviews.get(row.id);
    const commentsArr = Array.isArray(raw.comments) ? raw.comments : [];
    for (const entry of commentsArr) {
      if (!entry || typeof entry !== "object") throw new ApiError(422, "Validation failed");
      const o = entry;
      if (typeof o.path !== "string" || !o.path.trim()) throw new ApiError(422, "Validation failed");
      const pos = typeof o.position === "number" && Number.isFinite(o.position) ? o.position : parseInt(String(o.position), 10);
      if (!Number.isFinite(pos)) throw new ApiError(422, "Validation failed");
      if (typeof o.body !== "string") throw new ApiError(422, "Validation failed");
      const cRow = gh.comments.insert({
        node_id: "",
        repo_id: repo.id,
        issue_number: null,
        pull_number: pullNumber,
        commit_sha: commitId,
        body: o.body,
        user_id: actor.id,
        in_reply_to_id: null,
        path: o.path,
        position: pos,
        line: null,
        side: "RIGHT",
        subject_type: "line",
        comment_type: "review",
        review_id: review.id
      });
      gh.comments.update(cRow.id, { node_id: generateNodeId("PullRequestReviewComment", cRow.id) });
      adjustPrReviewCommentCount2(gh, pr, 1);
    }
    if (event) {
      dispatchReviewWebhook(webhooks, gh, repo, review, pr, actor, baseUrl, "submitted");
    }
    const json = formatReview(review, gh, baseUrl);
    if (!json) throw notFound();
    return c.json(json, 201);
  });
  app.get("/repos/:owner/:repo/pulls/:pull_number/reviews/:review_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "pull_requests");
    const pullNumber = parseInt(c.req.param("pull_number"), 10);
    const reviewId = parseInt(c.req.param("review_id"), 10);
    if (!Number.isFinite(pullNumber) || !Number.isFinite(reviewId)) throw notFound();
    const review = findReview(gh, repo, pullNumber, reviewId);
    if (!review) throw notFound();
    const json = formatReview(review, gh, baseUrl);
    if (!json) throw notFound();
    return c.json(json);
  });
  app.put("/repos/:owner/:repo/pulls/:pull_number/reviews/:review_id", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoWrite(gh, c.get("authUser"), repo, "pull_requests");
    const pullNumber = parseInt(c.req.param("pull_number"), 10);
    const reviewId = parseInt(c.req.param("review_id"), 10);
    if (!Number.isFinite(pullNumber) || !Number.isFinite(reviewId)) throw notFound();
    const existing = findReview(gh, repo, pullNumber, reviewId);
    if (!existing) throw notFound();
    if (existing.state !== "PENDING") {
      throw new ApiError(422, "Validation failed");
    }
    const raw = await parseJsonBody(c);
    if (typeof raw.body !== "string" && raw.body !== null) {
      throw new ApiError(422, "Validation failed");
    }
    const bodyVal = typeof raw.body === "string" ? raw.body : null;
    const updated = gh.reviews.update(reviewId, { body: bodyVal });
    if (!updated) throw notFound();
    const json = formatReview(updated, gh, baseUrl);
    if (!json) throw notFound();
    return c.json(json);
  });
  app.post("/repos/:owner/:repo/pulls/:pull_number/reviews/:review_id/events", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, "pull_requests");
    const pullNumber = parseInt(c.req.param("pull_number"), 10);
    const reviewId = parseInt(c.req.param("review_id"), 10);
    if (!Number.isFinite(pullNumber) || !Number.isFinite(reviewId)) throw notFound();
    const pr = findPull3(gh, repo.id, pullNumber);
    if (!pr) throw notFound();
    const review = findReview(gh, repo, pullNumber, reviewId);
    if (!review) throw notFound();
    if (review.state !== "PENDING") {
      throw new ApiError(422, "Validation failed");
    }
    const raw = await parseJsonBody(c);
    const event = parseSubmitEvent(raw.event);
    let bodyText = review.body;
    if (typeof raw.body === "string") bodyText = raw.body;
    else if (raw.body === null) bodyText = null;
    else if (raw.body !== void 0) throw new ApiError(422, "Validation failed");
    const nextState = eventToState(event);
    const updated = gh.reviews.update(reviewId, {
      body: bodyText,
      state: nextState,
      submitted_at: timestamp()
    });
    if (!updated) throw notFound();
    dispatchReviewWebhook(webhooks, gh, repo, updated, pr, actor, baseUrl, "submitted");
    const json = formatReview(updated, gh, baseUrl);
    if (!json) throw notFound();
    return c.json(json);
  });
  app.put("/repos/:owner/:repo/pulls/:pull_number/reviews/:review_id/dismissals", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, "pull_requests");
    const pullNumber = parseInt(c.req.param("pull_number"), 10);
    const reviewId = parseInt(c.req.param("review_id"), 10);
    if (!Number.isFinite(pullNumber) || !Number.isFinite(reviewId)) throw notFound();
    const pr = findPull3(gh, repo.id, pullNumber);
    if (!pr) throw notFound();
    const review = findReview(gh, repo, pullNumber, reviewId);
    if (!review) throw notFound();
    if (review.state === "PENDING" || review.state === "DISMISSED") {
      throw new ApiError(422, "Validation failed");
    }
    const raw = await parseJsonBody(c);
    const message = typeof raw.message === "string" ? raw.message : null;
    const updated = gh.reviews.update(reviewId, {
      state: "DISMISSED",
      body: message !== null && message !== void 0 ? message : review.body
    });
    if (!updated) throw notFound();
    dispatchReviewWebhook(webhooks, gh, repo, updated, pr, actor, baseUrl, "dismissed");
    const json = formatReview(updated, gh, baseUrl);
    if (!json) throw notFound();
    return c.json(json);
  });
  app.get("/repos/:owner/:repo/pulls/:pull_number/reviews/:review_id/comments", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "pull_requests");
    const pullNumber = parseInt(c.req.param("pull_number"), 10);
    const reviewId = parseInt(c.req.param("review_id"), 10);
    if (!Number.isFinite(pullNumber) || !Number.isFinite(reviewId)) throw notFound();
    const review = findReview(gh, repo, pullNumber, reviewId);
    if (!review) throw notFound();
    const { page, per_page } = parsePagination(c);
    const { sort, direction } = parseCommentSort2(c, "asc");
    let list = gh.comments.findBy("repo_id", repo.id).filter((x) => x.comment_type === "review" && x.pull_number === pullNumber && x.review_id === reviewId);
    list = sortComments2(list, sort, direction);
    const total = list.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    const pageItems = list.slice(start, start + per_page);
    const body = pageItems.map((x) => formatComment(x, gh, baseUrl)).filter((x) => x !== null);
    return c.json(body);
  });
}
function findIssueByNumber2(gh, repoId, issueNumber) {
  return gh.issues.findBy("repo_id", repoId).find((i) => i.number === issueNumber);
}
function findPullByNumber(gh, repoId, num) {
  return gh.pullRequests.findBy("repo_id", repoId).find((p) => p.number === num);
}
function formatIssueOrPullPayload(gh, issue, current, baseUrl) {
  if (issue.is_pull_request) {
    const pr = findPullByNumber(gh, issue.repo_id, issue.number);
    return pr ? formatPullRequest(pr, gh, baseUrl) : null;
  }
  return formatIssue(current, gh, baseUrl);
}
function setIssueLabelIds(gh, issue, labelIds) {
  gh.issues.update(issue.id, { label_ids: labelIds });
  if (issue.is_pull_request) {
    const pr = findPullByNumber(gh, issue.repo_id, issue.number);
    if (pr) gh.pullRequests.update(pr.id, { label_ids: labelIds });
  }
}
function insertIssueEvent2(gh, repo, issueNumber, event, actorId, extra) {
  const row = gh.issueEvents.insert({
    node_id: "",
    repo_id: repo.id,
    issue_number: issueNumber,
    event,
    actor_id: actorId,
    commit_id: null,
    commit_url: null,
    label_name: null,
    assignee_id: null,
    milestone_title: null,
    rename: null,
    ...extra
  });
  gh.issueEvents.update(row.id, { node_id: generateNodeId("IssueEvent", row.id) });
  return gh.issueEvents.get(row.id);
}
function randomLabelColor() {
  return Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}
function normalizeColor(raw) {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new ApiError(422, "Validation failed");
  }
  const s = raw.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(s)) {
    throw new ApiError(422, "Validation failed");
  }
  return s.toLowerCase();
}
function getOrCreateLabel2(gh, repo, name) {
  const existing = gh.labels.findBy("repo_id", repo.id).find((l) => l.name === name);
  if (existing) return existing;
  const label = gh.labels.insert({
    node_id: "",
    repo_id: repo.id,
    name,
    description: null,
    color: randomLabelColor(),
    default: false
  });
  gh.labels.update(label.id, { node_id: generateNodeId("Label", label.id) });
  return gh.labels.get(label.id);
}
async function parseLabelNamesFromBody(c) {
  const raw = await c.req.json().catch(() => null);
  if (raw === null) throw new ApiError(422, "Validation failed");
  let arr;
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (typeof raw === "object" && raw !== null && Array.isArray(raw.labels)) {
    arr = raw.labels;
  } else {
    throw new ApiError(422, "Validation failed");
  }
  const names = arr.filter((x) => typeof x === "string" && x.length > 0);
  if (names.length !== arr.length) throw new ApiError(422, "Validation failed");
  return names;
}
function removeLabelFromAllIssuesAndPrs(gh, repoId, labelId) {
  for (const i of gh.issues.findBy("repo_id", repoId)) {
    if (i.label_ids.includes(labelId)) {
      const next = i.label_ids.filter((id) => id !== labelId);
      setIssueLabelIds(gh, i, next);
    }
  }
}
function recalcMilestoneIssueCounts(gh, repoId, milestoneId) {
  const m = gh.milestones.get(milestoneId);
  if (!m) return void 0;
  const items = gh.issues.findBy("repo_id", repoId).filter((i) => i.milestone_id === milestoneId);
  let open = 0;
  let closed = 0;
  for (const i of items) {
    if (i.state === "open") open++;
    else closed++;
  }
  return gh.milestones.update(milestoneId, { open_issues: open, closed_issues: closed }) ?? m;
}
function sortMilestones(list, sort, direction) {
  const mul = direction === "asc" ? 1 : -1;
  const sorted = [...list];
  sorted.sort((a, b) => {
    if (sort === "due_on") {
      const aNull = a.due_on === null;
      const bNull = b.due_on === null;
      if (aNull && bNull) return 0;
      if (aNull) return direction === "asc" ? 1 : -1;
      if (bNull) return direction === "asc" ? -1 : 1;
      const cmp2 = a.due_on < b.due_on ? -1 : a.due_on > b.due_on ? 1 : 0;
      return cmp2 * mul;
    }
    const totalA = a.open_issues + a.closed_issues;
    const totalB = b.open_issues + b.closed_issues;
    const pctA = totalA === 0 ? 0 : a.closed_issues / totalA;
    const pctB = totalB === 0 ? 0 : b.closed_issues / totalB;
    const cmp = pctA < pctB ? -1 : pctA > pctB ? 1 : 0;
    return cmp * mul;
  });
  return sorted;
}
function labelsAndMilestonesRoutes({ app, store, webhooks, baseUrl }) {
  const gh = getGitHubStore(store);
  app.get("/repos/:owner/:repo/labels", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, ["issues", "pull_requests"]);
    const { page, per_page } = parsePagination(c);
    const list = gh.labels.findBy("repo_id", repo.id).slice();
    list.sort((a, b) => a.name.localeCompare(b.name));
    const total = list.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    const pageItems = list.slice(start, start + per_page);
    return c.json(pageItems.map((l) => formatLabel(l, repo, baseUrl)));
  });
  app.post("/repos/:owner/:repo/labels", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertIssueWrite(gh, c.get("authUser"), repo);
    const body = await parseJsonBody(c);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) throw new ApiError(422, "Validation failed");
    const dup = gh.labels.findBy("repo_id", repo.id).find((l) => l.name === name);
    if (dup) throw new ApiError(422, "Validation failed");
    const color = body.color !== void 0 && body.color !== null ? normalizeColor(body.color) : randomLabelColor();
    const description = typeof body.description === "string" || body.description === null ? body.description : null;
    const row = gh.labels.insert({
      node_id: "",
      repo_id: repo.id,
      name,
      description,
      color,
      default: false
    });
    gh.labels.update(row.id, { node_id: generateNodeId("Label", row.id) });
    const label = gh.labels.get(row.id);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    webhooks.dispatch(
      "label",
      "created",
      {
        action: "created",
        label: formatLabel(label, repo, baseUrl),
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    return c.json(formatLabel(label, repo, baseUrl), 201);
  });
  app.get("/repos/:owner/:repo/labels/:name", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, ["issues", "pull_requests"]);
    const name = c.req.param("name");
    const label = gh.labels.findBy("repo_id", repo.id).find((l) => l.name === name);
    if (!label) throw notFound();
    return c.json(formatLabel(label, repo, baseUrl));
  });
  app.patch("/repos/:owner/:repo/labels/:name", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertIssueWrite(gh, c.get("authUser"), repo);
    const name = c.req.param("name");
    let label = gh.labels.findBy("repo_id", repo.id).find((l) => l.name === name);
    if (!label) throw notFound();
    const labelId = label.id;
    const body = await parseJsonBody(c);
    const patch = {};
    if (typeof body.new_name === "string" && body.new_name.trim()) {
      const nn = body.new_name.trim();
      const clash = gh.labels.findBy("repo_id", repo.id).find((l) => l.name === nn && l.id !== labelId);
      if (clash) throw new ApiError(422, "Validation failed");
      patch.name = nn;
    }
    if (body.color !== void 0) {
      patch.color = normalizeColor(body.color);
    }
    if ("description" in body) {
      patch.description = typeof body.description === "string" || body.description === null ? body.description : null;
    }
    const updated = gh.labels.update(labelId, patch);
    if (!updated) throw notFound();
    label = updated;
    const ownerLogin2 = ownerLoginOf(gh, repo);
    webhooks.dispatch(
      "label",
      "edited",
      {
        action: "edited",
        label: formatLabel(label, repo, baseUrl),
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    return c.json(formatLabel(label, repo, baseUrl));
  });
  app.delete("/repos/:owner/:repo/labels/:name", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertIssueWrite(gh, c.get("authUser"), repo);
    const name = c.req.param("name");
    const label = gh.labels.findBy("repo_id", repo.id).find((l) => l.name === name);
    if (!label) throw notFound();
    removeLabelFromAllIssuesAndPrs(gh, repo.id, label.id);
    gh.labels.delete(label.id);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    webhooks.dispatch(
      "label",
      "deleted",
      {
        action: "deleted",
        label: formatLabel(label, repo, baseUrl),
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    return c.body(null, 204);
  });
  app.get("/repos/:owner/:repo/issues/:issue_number/labels", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, ["issues", "pull_requests"]);
    if (!repo.has_issues) throw notFound();
    const issueNumber = parseInt(c.req.param("issue_number"), 10);
    if (!Number.isFinite(issueNumber)) throw notFound();
    const issue = findIssueByNumber2(gh, repo.id, issueNumber);
    if (!issue) throw notFound();
    const labels = issue.label_ids.map((id) => gh.labels.get(id)).filter(Boolean).map((l) => formatLabel(l, repo, baseUrl));
    return c.json(labels);
  });
  app.post("/repos/:owner/:repo/issues/:issue_number/labels", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertIssueWrite(gh, c.get("authUser"), repo);
    if (!repo.has_issues) throw notFound();
    const issueNumber = parseInt(c.req.param("issue_number"), 10);
    if (!Number.isFinite(issueNumber)) throw notFound();
    const issue = findIssueByNumber2(gh, repo.id, issueNumber);
    if (!issue) throw notFound();
    const names = await parseLabelNamesFromBody(c);
    const prev = new Set(issue.label_ids);
    const ids = [...prev];
    for (const n of names) {
      const label = getOrCreateLabel2(gh, repo, n);
      if (!ids.includes(label.id)) ids.push(label.id);
    }
    setIssueLabelIds(gh, issue, ids);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    const after = gh.issues.get(issue.id);
    for (const id of after.label_ids) {
      if (!prev.has(id)) {
        const lbl = gh.labels.get(id);
        if (lbl) {
          insertIssueEvent2(gh, repo, issue.number, "labeled", actor.id, { label_name: lbl.name });
          webhooks.dispatch(
            "issues",
            "labeled",
            {
              action: "labeled",
              issue: formatIssueOrPullPayload(gh, issue, after, baseUrl),
              label: lbl ? { name: lbl.name, color: lbl.color } : null,
              repository: formatRepo(repo, gh, baseUrl),
              sender: formatUser(actor, baseUrl)
            },
            ownerLogin2,
            repo.name
          );
        }
      }
    }
    const labelsJson = after.label_ids.map((id) => gh.labels.get(id)).filter(Boolean).map((l) => formatLabel(l, repo, baseUrl));
    return c.json(labelsJson);
  });
  app.put("/repos/:owner/:repo/issues/:issue_number/labels", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertIssueWrite(gh, c.get("authUser"), repo);
    if (!repo.has_issues) throw notFound();
    const issueNumber = parseInt(c.req.param("issue_number"), 10);
    if (!Number.isFinite(issueNumber)) throw notFound();
    const issue = findIssueByNumber2(gh, repo.id, issueNumber);
    if (!issue) throw notFound();
    const names = await parseLabelNamesFromBody(c);
    const newIds = [...new Set(names.map((n) => getOrCreateLabel2(gh, repo, n).id))];
    const prev = new Set(issue.label_ids);
    setIssueLabelIds(gh, issue, newIds);
    const after = gh.issues.get(issue.id);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    for (const id of prev) {
      if (!newIds.includes(id)) {
        const lbl = gh.labels.get(id);
        insertIssueEvent2(gh, repo, issue.number, "unlabeled", actor.id, { label_name: lbl?.name ?? null });
        webhooks.dispatch(
          "issues",
          "unlabeled",
          {
            action: "unlabeled",
            issue: formatIssueOrPullPayload(gh, issue, after, baseUrl),
            label: lbl ? { name: lbl.name, color: lbl.color } : null,
            repository: formatRepo(repo, gh, baseUrl),
            sender: formatUser(actor, baseUrl)
          },
          ownerLogin2,
          repo.name
        );
      }
    }
    for (const id of newIds) {
      if (!prev.has(id)) {
        const lbl = gh.labels.get(id);
        if (lbl) {
          insertIssueEvent2(gh, repo, issue.number, "labeled", actor.id, { label_name: lbl.name });
          webhooks.dispatch(
            "issues",
            "labeled",
            {
              action: "labeled",
              issue: formatIssueOrPullPayload(gh, issue, after, baseUrl),
              label: { name: lbl.name, color: lbl.color },
              repository: formatRepo(repo, gh, baseUrl),
              sender: formatUser(actor, baseUrl)
            },
            ownerLogin2,
            repo.name
          );
        }
      }
    }
    const labelsJson = after.label_ids.map((id) => gh.labels.get(id)).filter(Boolean).map((l) => formatLabel(l, repo, baseUrl));
    return c.json(labelsJson);
  });
  app.delete("/repos/:owner/:repo/issues/:issue_number/labels/:name", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertIssueWrite(gh, c.get("authUser"), repo);
    if (!repo.has_issues) throw notFound();
    const issueNumber = parseInt(c.req.param("issue_number"), 10);
    if (!Number.isFinite(issueNumber)) throw notFound();
    const issue = findIssueByNumber2(gh, repo.id, issueNumber);
    if (!issue) throw notFound();
    const labelName = c.req.param("name");
    const label = gh.labels.findBy("repo_id", repo.id).find((l) => l.name === labelName);
    if (!label || !issue.label_ids.includes(label.id)) throw notFound();
    const next = issue.label_ids.filter((id) => id !== label.id);
    setIssueLabelIds(gh, issue, next);
    const after = gh.issues.get(issue.id);
    insertIssueEvent2(gh, repo, issue.number, "unlabeled", actor.id, { label_name: label.name });
    const ownerLogin2 = ownerLoginOf(gh, repo);
    webhooks.dispatch(
      "issues",
      "unlabeled",
      {
        action: "unlabeled",
        issue: formatIssueOrPullPayload(gh, issue, after, baseUrl),
        label: { name: label.name, color: label.color },
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    const labelsJson = after.label_ids.map((id) => gh.labels.get(id)).filter(Boolean).map((l) => formatLabel(l, repo, baseUrl));
    return c.json(labelsJson);
  });
  app.delete("/repos/:owner/:repo/issues/:issue_number/labels", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertIssueWrite(gh, c.get("authUser"), repo);
    if (!repo.has_issues) throw notFound();
    const issueNumber = parseInt(c.req.param("issue_number"), 10);
    if (!Number.isFinite(issueNumber)) throw notFound();
    const issue = findIssueByNumber2(gh, repo.id, issueNumber);
    if (!issue) throw notFound();
    setIssueLabelIds(gh, issue, []);
    return c.body(null, 204);
  });
  app.get("/repos/:owner/:repo/milestones", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "issues");
    if (!repo.has_issues) throw notFound();
    const stateQ = c.req.query("state") ?? "open";
    const state = stateQ === "closed" || stateQ === "all" || stateQ === "open" ? stateQ : "open";
    const sortRaw = c.req.query("sort") ?? "due_on";
    const sort = sortRaw === "completeness" ? "completeness" : "due_on";
    const dirRaw = c.req.query("direction") ?? "desc";
    const direction = dirRaw === "asc" ? "asc" : "desc";
    let list = gh.milestones.findBy("repo_id", repo.id).map((m) => recalcMilestoneIssueCounts(gh, repo.id, m.id));
    if (state === "open") list = list.filter((m) => m.state === "open");
    else if (state === "closed") list = list.filter((m) => m.state === "closed");
    list = sortMilestones(list, sort, direction);
    const { page, per_page } = parsePagination(c);
    const total = list.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    const pageItems = list.slice(start, start + per_page);
    return c.json(pageItems.map((m) => formatMilestone(m, repo, gh, baseUrl)));
  });
  app.post("/repos/:owner/:repo/milestones", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertIssueWrite(gh, c.get("authUser"), repo);
    if (!repo.has_issues) throw notFound();
    const body = await parseJsonBody(c);
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) throw new ApiError(422, "Validation failed");
    let state = "open";
    if (body.state === "open" || body.state === "closed") state = body.state;
    const description = typeof body.description === "string" || body.description === null ? body.description : null;
    let due_on = null;
    if ("due_on" in body) {
      if (body.due_on === null) {
        due_on = null;
      } else if (typeof body.due_on === "string") {
        due_on = body.due_on;
      } else {
        throw new ApiError(422, "Validation failed");
      }
    }
    const num = getNextMilestoneNumber(gh, repo.id);
    const closed_at = state === "closed" ? timestamp() : null;
    const row = gh.milestones.insert({
      node_id: "",
      repo_id: repo.id,
      number: num,
      title,
      description,
      state,
      open_issues: 0,
      closed_issues: 0,
      due_on,
      closed_at,
      creator_id: actor.id
    });
    gh.milestones.update(row.id, { node_id: generateNodeId("Milestone", row.id) });
    const m = recalcMilestoneIssueCounts(gh, repo.id, row.id);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    webhooks.dispatch(
      "milestone",
      state === "closed" ? "closed" : "created",
      {
        action: state === "closed" ? "closed" : "created",
        milestone: formatMilestone(m, repo, gh, baseUrl),
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    return c.json(formatMilestone(m, repo, gh, baseUrl), 201);
  });
  app.get("/repos/:owner/:repo/milestones/:milestone_number", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "issues");
    if (!repo.has_issues) throw notFound();
    const n = parseInt(c.req.param("milestone_number"), 10);
    if (!Number.isFinite(n)) throw notFound();
    const raw = gh.milestones.findBy("repo_id", repo.id).find((m2) => m2.number === n);
    if (!raw) throw notFound();
    const m = recalcMilestoneIssueCounts(gh, repo.id, raw.id);
    return c.json(formatMilestone(m, repo, gh, baseUrl));
  });
  app.patch("/repos/:owner/:repo/milestones/:milestone_number", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertIssueWrite(gh, c.get("authUser"), repo);
    if (!repo.has_issues) throw notFound();
    const n = parseInt(c.req.param("milestone_number"), 10);
    if (!Number.isFinite(n)) throw notFound();
    let m = gh.milestones.findBy("repo_id", repo.id).find((x) => x.number === n);
    if (!m) throw notFound();
    const body = await parseJsonBody(c);
    const patch = {};
    if (typeof body.title === "string") patch.title = body.title;
    if (body.state === "open" || body.state === "closed") {
      patch.state = body.state;
    }
    if ("description" in body) {
      patch.description = typeof body.description === "string" || body.description === null ? body.description : null;
    }
    if ("due_on" in body) {
      if (body.due_on === null) patch.due_on = null;
      else if (typeof body.due_on === "string") patch.due_on = body.due_on;
      else throw new ApiError(422, "Validation failed");
    }
    const prevState = m.state;
    if (patch.state === "closed" && prevState === "open") {
      patch.closed_at = m.closed_at ?? timestamp();
    } else if (patch.state === "open" && prevState === "closed") {
      patch.closed_at = null;
    }
    const updated = gh.milestones.update(m.id, patch);
    if (!updated) throw notFound();
    m = recalcMilestoneIssueCounts(gh, repo.id, updated.id);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    if (patch.state === "closed" && prevState === "open") {
      webhooks.dispatch(
        "milestone",
        "closed",
        {
          action: "closed",
          milestone: formatMilestone(m, repo, gh, baseUrl),
          repository: formatRepo(repo, gh, baseUrl),
          sender: formatUser(actor, baseUrl)
        },
        ownerLogin2,
        repo.name
      );
    } else if (patch.state === "open" && prevState === "closed") {
      webhooks.dispatch(
        "milestone",
        "opened",
        {
          action: "opened",
          milestone: formatMilestone(m, repo, gh, baseUrl),
          repository: formatRepo(repo, gh, baseUrl),
          sender: formatUser(actor, baseUrl)
        },
        ownerLogin2,
        repo.name
      );
    } else {
      webhooks.dispatch(
        "milestone",
        "edited",
        {
          action: "edited",
          milestone: formatMilestone(m, repo, gh, baseUrl),
          repository: formatRepo(repo, gh, baseUrl),
          sender: formatUser(actor, baseUrl)
        },
        ownerLogin2,
        repo.name
      );
    }
    return c.json(formatMilestone(m, repo, gh, baseUrl));
  });
  app.delete("/repos/:owner/:repo/milestones/:milestone_number", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertIssueWrite(gh, c.get("authUser"), repo);
    if (!repo.has_issues) throw notFound();
    const n = parseInt(c.req.param("milestone_number"), 10);
    if (!Number.isFinite(n)) throw notFound();
    const m = gh.milestones.findBy("repo_id", repo.id).find((x) => x.number === n);
    if (!m) throw notFound();
    for (const i of gh.issues.findBy("repo_id", repo.id)) {
      if (i.milestone_id === m.id) gh.issues.update(i.id, { milestone_id: null });
    }
    for (const p of gh.pullRequests.findBy("repo_id", repo.id)) {
      if (p.milestone_id === m.id) gh.pullRequests.update(p.id, { milestone_id: null });
    }
    gh.milestones.delete(m.id);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    webhooks.dispatch(
      "milestone",
      "deleted",
      {
        action: "deleted",
        milestone: formatMilestone(m, repo, gh, baseUrl),
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    return c.body(null, 204);
  });
  app.get("/repos/:owner/:repo/milestones/:milestone_number/labels", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "issues");
    if (!repo.has_issues) throw notFound();
    const n = parseInt(c.req.param("milestone_number"), 10);
    if (!Number.isFinite(n)) throw notFound();
    const ms = gh.milestones.findBy("repo_id", repo.id).find((m) => m.number === n);
    if (!ms) throw notFound();
    const { page, per_page } = parsePagination(c);
    const labelIdSet = /* @__PURE__ */ new Set();
    for (const i of gh.issues.findBy("repo_id", repo.id)) {
      if (i.milestone_id !== ms.id) continue;
      for (const lid of i.label_ids) labelIdSet.add(lid);
    }
    const labels = [...labelIdSet].map((id) => gh.labels.get(id)).filter(Boolean);
    labels.sort((a, b) => a.name.localeCompare(b.name));
    const total = labels.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    const pageItems = labels.slice(start, start + per_page);
    return c.json(pageItems.map((l) => formatLabel(l, repo, baseUrl)));
  });
}
function findBranchByName(gh, repoId, name) {
  return gh.branches.findBy("repo_id", repoId).find((b) => b.name === name);
}
function findCommitBySha2(gh, repoId, sha) {
  return gh.commits.findBy("repo_id", repoId).find((c) => c.sha === sha);
}
function findTreeBySha(gh, repoId, sha) {
  return gh.trees.findBy("repo_id", repoId).find((t) => t.sha === sha);
}
function findBlobBySha(gh, repoId, sha) {
  return gh.blobs.findBy("repo_id", repoId).find((b) => b.sha === sha);
}
function findTagObjectBySha(gh, repoId, sha) {
  return gh.tags.findBy("repo_id", repoId).find((t) => t.sha === sha);
}
function fullRefFromParam(refParam) {
  return refParam.startsWith("refs/") ? refParam : `refs/${refParam}`;
}
function isDescendantOf(gh, repoId, ancestorSha, descendantSha) {
  const visiting = /* @__PURE__ */ new Set();
  const stack = [descendantSha];
  while (stack.length) {
    const sha = stack.pop();
    if (sha === ancestorSha) return true;
    if (visiting.has(sha)) continue;
    visiting.add(sha);
    const commit = findCommitBySha2(gh, repoId, sha);
    if (!commit) continue;
    for (const p of commit.parent_shas) stack.push(p);
  }
  return false;
}
function resolveGitObjectType(gh, repoId, sha) {
  if (findCommitBySha2(gh, repoId, sha)) return "commit";
  if (findTagObjectBySha(gh, repoId, sha)) return "tag";
  if (findTreeBySha(gh, repoId, sha)) return "tree";
  if (findBlobBySha(gh, repoId, sha)) return "blob";
  return "commit";
}
function objectApiUrl(repo, baseUrl, type, sha) {
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  switch (type) {
    case "commit":
      return `${repoUrl}/git/commits/${sha}`;
    case "tag":
      return `${repoUrl}/git/tags/${sha}`;
    case "tree":
      return `${repoUrl}/git/trees/${sha}`;
    default:
      return `${repoUrl}/git/blobs/${sha}`;
  }
}
function formatRefJson(gh, repo, fullRef, sha, baseUrl) {
  const refRec = gh.refs.findBy("repo_id", repo.id).find((r) => r.ref === fullRef);
  const type = resolveGitObjectType(gh, repo.id, sha);
  const shortRef = fullRef.startsWith("refs/") ? fullRef.slice(5) : fullRef;
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  return {
    ref: fullRef,
    node_id: refRec?.node_id ?? "",
    url: `${repoUrl}/git/ref/${shortRef}`,
    object: {
      type,
      sha,
      url: objectApiUrl(repo, baseUrl, type, sha)
    }
  };
}
function syncBranchFromRef(gh, repo, fullRef, sha) {
  if (!fullRef.startsWith("refs/heads/")) return;
  const name = fullRef.slice("refs/heads/".length);
  const existing = findBranchByName(gh, repo.id, name);
  if (existing) {
    gh.branches.update(existing.id, { sha });
  } else {
    gh.branches.insert({
      repo_id: repo.id,
      name,
      sha,
      protected: false
    });
  }
}
function deleteBranchForHeadRef(gh, repoId, fullRef) {
  if (!fullRef.startsWith("refs/heads/")) return;
  const name = fullRef.slice("refs/heads/".length);
  const b = findBranchByName(gh, repoId, name);
  if (b) gh.branches.delete(b.id);
}
function expandTreeEntries(gh, repoId, entries, recursive, prefix = "") {
  const out = [];
  for (const e of entries) {
    const path = prefix ? `${prefix}/${e.path}` : e.path;
    out.push({ ...e, path });
    if (e.type === "tree" && recursive) {
      const sub = findTreeBySha(gh, repoId, e.sha);
      if (sub) {
        out.push(...expandTreeEntries(gh, repoId, sub.tree, true, path));
      }
    }
  }
  return out.sort((a, b) => a.path.localeCompare(b.path));
}
function persistGitTreeHierarchy(gh, repoId, baseSha, updates) {
  const root = {
    baseSha,
    mode: "040000",
    files: /* @__PURE__ */ new Map(),
    dirs: /* @__PURE__ */ new Map(),
    deletions: /* @__PURE__ */ new Set()
  };
  const baseEntry = (pending, name) => {
    if (!pending.baseSha || pending.deletions.has(name)) return void 0;
    return findTreeBySha(gh, repoId, pending.baseSha)?.tree.find((entry) => entry.path === name);
  };
  const orderedUpdates = [...updates].sort((left, right) => left.path.split("/").length - right.path.split("/").length);
  for (const update of orderedUpdates) {
    const parts = update.path.split("/");
    let current = root;
    for (const part of parts.slice(0, -1)) {
      let child = current.dirs.get(part);
      if (!child) {
        const existing = current.files.get(part) ?? baseEntry(current, part);
        if (existing && existing.type !== "tree") {
          throw new ApiError(422, `${update.path} conflicts with an existing file`);
        }
        child = {
          baseSha: existing?.type === "tree" ? existing.sha : void 0,
          mode: existing?.mode ?? "040000",
          files: /* @__PURE__ */ new Map(),
          dirs: /* @__PURE__ */ new Map(),
          deletions: /* @__PURE__ */ new Set()
        };
        current.files.delete(part);
        current.deletions.delete(part);
        current.dirs.set(part, child);
      }
      current = child;
    }
    const name = parts.at(-1);
    if (update.sha === null) {
      const existing = current.files.get(name) ?? (current.dirs.has(name) ? { type: "tree" } : void 0) ?? baseEntry(current, name);
      if (!existing) throw new ApiError(422, `Cannot delete ${update.path} because it does not exist`);
      current.files.delete(name);
      current.dirs.delete(name);
      current.deletions.add(name);
      continue;
    }
    current.deletions.delete(name);
    if (update.type === "tree") {
      current.files.delete(name);
      current.dirs.set(name, {
        baseSha: update.sha,
        mode: update.mode,
        files: /* @__PURE__ */ new Map(),
        dirs: /* @__PURE__ */ new Map(),
        deletions: /* @__PURE__ */ new Set()
      });
    } else {
      current.dirs.delete(name);
      current.files.set(name, { ...update, path: name, sha: update.sha });
    }
  }
  const write = (pending) => {
    if (pending.baseSha && pending.files.size === 0 && pending.dirs.size === 0 && pending.deletions.size === 0) {
      const unchanged = findTreeBySha(gh, repoId, pending.baseSha);
      if (!unchanged) throw new ApiError(422, "Invalid tree");
      return unchanged;
    }
    const entries = /* @__PURE__ */ new Map();
    if (pending.baseSha) {
      const base = findTreeBySha(gh, repoId, pending.baseSha);
      if (!base) throw new ApiError(422, "Invalid tree");
      for (const entry of base.tree) entries.set(entry.path, entry);
    }
    for (const [name, child] of pending.dirs) {
      const subtree = write(child);
      entries.set(name, { path: name, mode: child.mode, type: "tree", sha: subtree.sha });
    }
    for (const [name, entry] of pending.files) entries.set(name, { ...entry, path: name });
    for (const name of pending.deletions) entries.delete(name);
    return findOrCreateTree(gh, repoId, [...entries.values()]);
  };
  return write(root);
}
function protectionEntityToGitHub(gh, repo, bp, baseUrl) {
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  const encBranch = encodeURIComponent(bp.branch_name);
  const base = `${repoUrl}/branches/${encBranch}/protection`;
  return {
    url: base,
    required_status_checks: bp.required_status_checks ? {
      url: `${base}/required_status_checks`,
      strict: bp.required_status_checks.strict,
      contexts: bp.required_status_checks.contexts,
      contexts_url: `${base}/required_status_checks/contexts`,
      checks: bp.required_status_checks.contexts.map((c) => ({
        context: c,
        app_id: null
      }))
    } : null,
    enforce_admins: {
      url: `${base}/enforce_admins`,
      enabled: bp.enforce_admins
    },
    required_pull_request_reviews: bp.required_pull_request_reviews ? {
      url: `${base}/required_pull_request_reviews`,
      dismiss_stale_reviews: bp.required_pull_request_reviews.dismiss_stale_reviews,
      require_code_owner_reviews: bp.required_pull_request_reviews.require_code_owner_reviews,
      required_approving_review_count: bp.required_pull_request_reviews.required_approving_review_count
    } : null,
    restrictions: bp.restrictions ? {
      url: `${base}/restrictions`,
      users_url: `${base}/restrictions/users`,
      teams_url: `${base}/restrictions/teams`,
      apps_url: `${base}/restrictions/apps`,
      users: bp.restrictions.users.map((login) => ({
        login,
        id: 0,
        node_id: "",
        avatar_url: `${baseUrl}/avatars/u/${login}`,
        gravatar_id: "",
        url: `${baseUrl}/users/${login}`,
        html_url: `${baseUrl}/${login}`,
        type: "User",
        site_admin: false
      })),
      teams: bp.restrictions.teams.map((slug) => ({
        id: 0,
        node_id: "",
        url: `${baseUrl}/teams/0`,
        name: slug,
        slug
      })),
      apps: []
    } : null,
    required_linear_history: { enabled: bp.required_linear_history },
    allow_force_pushes: { enabled: bp.allow_force_pushes },
    allow_deletions: { enabled: bp.allow_deletions },
    required_conversation_resolution: { enabled: false },
    required_signatures: { url: `${base}/required_signatures`, enabled: bp.required_signatures },
    lock_branch: { enabled: false },
    allow_fork_syncing: { enabled: false }
  };
}
function parseProtectionPutBody(body) {
  const rsc = body.required_status_checks;
  let required_status_checks = null;
  if (rsc && typeof rsc === "object" && rsc !== null) {
    const o = rsc;
    required_status_checks = {
      strict: Boolean(o.strict),
      contexts: Array.isArray(o.contexts) ? o.contexts.filter((x) => typeof x === "string") : []
    };
  }
  let enforce_admins = false;
  const ea = body.enforce_admins;
  if (typeof ea === "boolean") enforce_admins = ea;
  else if (ea && typeof ea === "object" && "enabled" in ea) {
    enforce_admins = Boolean(ea.enabled);
  }
  const rprr = body.required_pull_request_reviews;
  let required_pull_request_reviews = null;
  if (rprr && typeof rprr === "object" && rprr !== null) {
    const o = rprr;
    required_pull_request_reviews = {
      required_approving_review_count: typeof o.required_approving_review_count === "number" ? o.required_approving_review_count : 1,
      dismiss_stale_reviews: Boolean(o.dismiss_stale_reviews),
      require_code_owner_reviews: Boolean(o.require_code_owner_reviews)
    };
  }
  const rest = body.restrictions;
  let restrictions = null;
  if (rest && typeof rest === "object" && rest !== null) {
    const o = rest;
    restrictions = {
      users: Array.isArray(o.users) ? o.users.map((u) => typeof u === "string" ? u : u?.login).filter((x) => typeof x === "string") : [],
      teams: Array.isArray(o.teams) ? o.teams.map((t) => typeof t === "string" ? t : t?.slug).filter((x) => typeof x === "string") : []
    };
  }
  const rlh = body.required_linear_history;
  const required_linear_history = typeof rlh === "boolean" ? rlh : rlh && typeof rlh === "object" && rlh !== null ? Boolean(rlh.enabled) : false;
  const afp = body.allow_force_pushes;
  const allow_force_pushes = typeof afp === "boolean" ? afp : afp && typeof afp === "object" && afp !== null ? Boolean(afp.enabled) : false;
  const ad = body.allow_deletions;
  const allow_deletions = typeof ad === "boolean" ? ad : ad && typeof ad === "object" && ad !== null ? Boolean(ad.enabled) : false;
  return {
    required_status_checks,
    enforce_admins,
    required_pull_request_reviews,
    restrictions,
    required_linear_history,
    allow_force_pushes,
    allow_deletions,
    required_signatures: Boolean(
      typeof body.required_signatures === "boolean" ? body.required_signatures : body.required_signatures?.enabled
    )
  };
}
function branchesAndGitRoutes({ app, store, webhooks, baseUrl }) {
  const gh = getGitHubStore(store);
  app.get("/repos/:owner/:repo/branches/:branch{.+}/protection/required_status_checks", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const branch = c.req.param("branch");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "administration");
    const bp = gh.branchProtections.findBy("repo_id", repo.id).find((p) => p.branch_name === branch);
    if (!bp || !bp.required_status_checks) throw notFound();
    const encBranch = encodeURIComponent(branch);
    const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
    const base = `${repoUrl}/branches/${encBranch}/protection/required_status_checks`;
    return c.json({
      url: base,
      strict: bp.required_status_checks.strict,
      contexts: bp.required_status_checks.contexts,
      contexts_url: `${base}/contexts`,
      checks: bp.required_status_checks.contexts.map((ctx) => ({
        context: ctx,
        app_id: null
      }))
    });
  });
  app.patch("/repos/:owner/:repo/branches/:branch{.+}/protection/required_status_checks", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const branch = c.req.param("branch");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoAdmin(gh, c.get("authUser"), repo);
    const bp = gh.branchProtections.findBy("repo_id", repo.id).find((p) => p.branch_name === branch);
    if (!bp) throw notFound();
    const body = await parseJsonBody(c);
    const strict = typeof body.strict === "boolean" ? body.strict : bp.required_status_checks?.strict ?? false;
    const contexts = Array.isArray(body.contexts) ? body.contexts.filter((x) => typeof x === "string") : bp.required_status_checks?.contexts ?? [];
    gh.branchProtections.update(bp.id, {
      required_status_checks: { strict, contexts }
    });
    const encBranch = encodeURIComponent(branch);
    const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
    const url = `${repoUrl}/branches/${encBranch}/protection/required_status_checks`;
    return c.json({
      url,
      strict,
      contexts,
      contexts_url: `${url}/contexts`,
      checks: contexts.map((ctx) => ({ context: ctx, app_id: null }))
    });
  });
  app.get("/repos/:owner/:repo/branches/:branch{.+}/protection/enforce_admins", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const branch = c.req.param("branch");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "administration");
    const bp = gh.branchProtections.findBy("repo_id", repo.id).find((p) => p.branch_name === branch);
    if (!bp) throw notFound();
    const encBranch = encodeURIComponent(branch);
    const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
    const url = `${repoUrl}/branches/${encBranch}/protection/enforce_admins`;
    return c.json({
      url,
      enabled: bp.enforce_admins
    });
  });
  app.get("/repos/:owner/:repo/branches/:branch{.+}/protection/required_pull_request_reviews", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const branch = c.req.param("branch");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "administration");
    const bp = gh.branchProtections.findBy("repo_id", repo.id).find((p) => p.branch_name === branch);
    if (!bp || !bp.required_pull_request_reviews) throw notFound();
    const encBranch = encodeURIComponent(branch);
    const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
    const base = `${repoUrl}/branches/${encBranch}/protection/required_pull_request_reviews`;
    const r = bp.required_pull_request_reviews;
    return c.json({
      url: base,
      dismiss_stale_reviews: r.dismiss_stale_reviews,
      require_code_owner_reviews: r.require_code_owner_reviews,
      required_approving_review_count: r.required_approving_review_count
    });
  });
  app.patch("/repos/:owner/:repo/branches/:branch{.+}/protection/required_pull_request_reviews", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const branch = c.req.param("branch");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoAdmin(gh, c.get("authUser"), repo);
    const bp = gh.branchProtections.findBy("repo_id", repo.id).find((p) => p.branch_name === branch);
    if (!bp) throw notFound();
    const body = await parseJsonBody(c);
    const prev = bp.required_pull_request_reviews ?? {
      required_approving_review_count: 1,
      dismiss_stale_reviews: false,
      require_code_owner_reviews: false
    };
    const next = {
      required_approving_review_count: typeof body.required_approving_review_count === "number" ? body.required_approving_review_count : prev.required_approving_review_count,
      dismiss_stale_reviews: typeof body.dismiss_stale_reviews === "boolean" ? body.dismiss_stale_reviews : prev.dismiss_stale_reviews,
      require_code_owner_reviews: typeof body.require_code_owner_reviews === "boolean" ? body.require_code_owner_reviews : prev.require_code_owner_reviews
    };
    gh.branchProtections.update(bp.id, { required_pull_request_reviews: next });
    const encBranch = encodeURIComponent(branch);
    const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
    const url = `${repoUrl}/branches/${encBranch}/protection/required_pull_request_reviews`;
    return c.json({
      url,
      ...next
    });
  });
  app.get("/repos/:owner/:repo/branches/:branch{.+}/protection", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const branch = c.req.param("branch");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "administration");
    const bp = gh.branchProtections.findBy("repo_id", repo.id).find((p) => p.branch_name === branch);
    if (!bp) throw notFound();
    return c.json(protectionEntityToGitHub(gh, repo, bp, baseUrl));
  });
  app.put("/repos/:owner/:repo/branches/:branch{.+}/protection", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const branch = c.req.param("branch");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoAdmin(gh, c.get("authUser"), repo);
    const b = findBranchByName(gh, repo.id, branch);
    if (!b) throw notFound();
    const body = await parseJsonBody(c);
    const parsed = parseProtectionPutBody(body);
    const existing = gh.branchProtections.findBy("repo_id", repo.id).find((p) => p.branch_name === branch);
    if (existing) {
      gh.branchProtections.update(existing.id, { ...parsed });
    } else {
      gh.branchProtections.insert({
        repo_id: repo.id,
        branch_name: branch,
        ...parsed
      });
    }
    gh.branches.update(b.id, { protected: true });
    const bp = gh.branchProtections.findBy("repo_id", repo.id).find((p) => p.branch_name === branch);
    webhooks.dispatch(
      "branch_protection_rule",
      "edited",
      {
        action: "edited",
        rule: protectionEntityToGitHub(gh, repo, bp, baseUrl),
        repository: formatRepo(repo, gh, baseUrl)
      },
      ownerLoginOf(gh, repo),
      repo.name
    );
    return c.json(protectionEntityToGitHub(gh, repo, bp, baseUrl));
  });
  app.delete("/repos/:owner/:repo/branches/:branch{.+}/protection", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const branch = c.req.param("branch");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoAdmin(gh, c.get("authUser"), repo);
    const bp = gh.branchProtections.findBy("repo_id", repo.id).find((p) => p.branch_name === branch);
    if (bp) gh.branchProtections.delete(bp.id);
    const b = findBranchByName(gh, repo.id, branch);
    if (b) gh.branches.update(b.id, { protected: false });
    return c.body(null, 204);
  });
  app.get("/repos/:owner/:repo/branches/:branch{.+}", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const branchName = c.req.param("branch");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const branch = findBranchByName(gh, repo.id, branchName);
    if (!branch) throw notFound();
    const commit = findCommitBySha2(gh, repo.id, branch.sha);
    const base = formatBranch(branch, repo, baseUrl);
    if (!branch.protected) return c.json(base);
    const bp = gh.branchProtections.findBy("repo_id", repo.id).find((p) => p.branch_name === branchName);
    return c.json({
      ...base,
      protection: {
        enabled: true,
        required_status_checks: bp?.required_status_checks ? {
          enforcement_level: "everyone",
          contexts: bp.required_status_checks.contexts,
          checks: bp.required_status_checks.contexts.map((ctx) => ({ context: ctx, app_id: null }))
        } : { enforcement_level: "off", contexts: [], checks: [] }
      },
      protection_commit: commit ? {
        author: { email: commit.author_email, name: commit.author_name },
        url: `${baseUrl}/repos/${repo.full_name}/commits/${commit.sha}`,
        message: commit.message,
        html_url: `${baseUrl}/${repo.full_name}/commit/${commit.sha}`
      } : null
    });
  });
  app.get("/repos/:owner/:repo/branches", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    let list = [...gh.branches.findBy("repo_id", repo.id)].sort((a, b) => a.name.localeCompare(b.name));
    const prot = c.req.query("protected");
    if (prot === "true") list = list.filter((b) => b.protected);
    else if (prot === "false") list = list.filter((b) => !b.protected);
    const { page, per_page } = parsePagination(c);
    const total = list.length;
    const start = (page - 1) * per_page;
    const slice = list.slice(start, start + per_page);
    setLinkHeader(c, total, page, per_page);
    return c.json(slice.map((b) => formatBranch(b, repo, baseUrl)));
  });
  app.get("/repos/:owner/:repo/git/ref/:ref{.+}", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const refParam = c.req.param("ref");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const fullRef = fullRefFromParam(refParam);
    const r = gh.refs.findBy("repo_id", repo.id).find((x) => x.ref === fullRef);
    if (!r) throw notFound();
    return c.json(formatRefJson(gh, repo, r.ref, r.sha, baseUrl));
  });
  app.get("/repos/:owner/:repo/git/matching-refs/:ref{.+}", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const refParam = c.req.param("ref");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const prefix = fullRefFromParam(refParam);
    const matches = gh.refs.findBy("repo_id", repo.id).filter((r) => r.ref.startsWith(prefix)).sort((a, b) => a.ref.localeCompare(b.ref));
    return c.json(matches.map((r) => formatRefJson(gh, repo, r.ref, r.sha, baseUrl)));
  });
  app.post("/repos/:owner/:repo/git/refs", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const user = assertRepoContentsWrite(gh, c.get("authUser"), repo);
    const body = await parseJsonBody(c);
    if (typeof body.ref !== "string" || !body.ref.startsWith("refs/")) {
      throw new ApiError(422, "Invalid ref");
    }
    if (typeof body.sha !== "string") {
      throw new ApiError(422, "sha is required");
    }
    const fullRef = body.ref;
    const sha = body.sha;
    if (findCommitBySha2(gh, repo.id, sha) === void 0 && findTagObjectBySha(gh, repo.id, sha) === void 0) {
      throw new ApiError(422, "Invalid sha");
    }
    if (gh.refs.findBy("repo_id", repo.id).some((r2) => r2.ref === fullRef)) {
      throw new ApiError(422, "Reference already exists");
    }
    if (fullRef.startsWith("refs/heads/")) {
      const branchName = fullRef.slice("refs/heads/".length);
      const commit = findCommitBySha2(gh, repo.id, sha);
      assertBranchUpdateAllowed(gh, user, repo, branchName, {
        parentCount: commit?.parent_shas.length,
        targetSha: commit?.sha
      });
    }
    const refRow = gh.refs.insert({
      repo_id: repo.id,
      ref: fullRef,
      sha,
      node_id: ""
    });
    gh.refs.update(refRow.id, { node_id: generateNodeId("Ref", refRow.id) });
    syncBranchFromRef(gh, repo, fullRef, sha);
    webhooks.dispatch(
      "create",
      void 0,
      {
        ref: fullRef,
        ref_type: fullRef.startsWith("refs/heads/") ? "branch" : "tag",
        master_branch: repo.default_branch,
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(user, baseUrl)
      },
      ownerLoginOf(gh, repo),
      repo.name
    );
    const r = gh.refs.get(refRow.id);
    return c.json(formatRefJson(gh, repo, r.ref, r.sha, baseUrl), 201);
  });
  app.patch("/repos/:owner/:repo/git/refs/:ref{.+}", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const refParam = c.req.param("ref");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const user = assertRepoContentsWrite(gh, c.get("authUser"), repo);
    const fullRef = fullRefFromParam(refParam);
    const r = gh.refs.findBy("repo_id", repo.id).find((x) => x.ref === fullRef);
    if (!r) throw notFound();
    const body = await parseJsonBody(c);
    if (typeof body.sha !== "string") {
      throw new ApiError(422, "sha is required");
    }
    const newSha = body.sha;
    const force = Boolean(body.force);
    const oldSha = r.sha;
    if (findCommitBySha2(gh, repo.id, newSha) === void 0 && findTagObjectBySha(gh, repo.id, newSha) === void 0) {
      throw new ApiError(422, "Invalid sha");
    }
    if (!force) {
      const oldCommit = findCommitBySha2(gh, repo.id, oldSha);
      const newCommit = findCommitBySha2(gh, repo.id, newSha);
      if (!oldCommit || !newCommit) {
        throw new ApiError(422, "Fast-forward update requires commit objects");
      }
      if (!isDescendantOf(gh, repo.id, oldSha, newSha)) {
        throw new ApiError(422, "Update is not a fast-forward");
      }
    }
    if (fullRef.startsWith("refs/heads/")) {
      const branchName = fullRef.slice("refs/heads/".length);
      const commit = findCommitBySha2(gh, repo.id, newSha);
      assertBranchUpdateAllowed(gh, user, repo, branchName, {
        force,
        parentCount: commit?.parent_shas.length,
        currentSha: oldSha,
        targetSha: commit?.sha
      });
    }
    gh.refs.update(r.id, { sha: newSha });
    syncBranchFromRef(gh, repo, fullRef, newSha);
    webhooks.dispatch(
      "push",
      void 0,
      {
        ref: fullRef,
        before: oldSha,
        after: newSha,
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(user, baseUrl)
      },
      ownerLoginOf(gh, repo),
      repo.name
    );
    const updated = gh.refs.get(r.id);
    return c.json(formatRefJson(gh, repo, updated.ref, updated.sha, baseUrl));
  });
  app.delete("/repos/:owner/:repo/git/refs/:ref{.+}", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const refParam = c.req.param("ref");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const user = assertRepoContentsWrite(gh, c.get("authUser"), repo);
    const fullRef = fullRefFromParam(refParam);
    const r = gh.refs.findBy("repo_id", repo.id).find((x) => x.ref === fullRef);
    if (!r) throw notFound();
    if (fullRef.startsWith("refs/heads/")) {
      const branchName = fullRef.slice("refs/heads/".length);
      if (branchName === repo.default_branch) {
        throw new ApiError(422, "Cannot delete the default branch");
      }
      assertBranchUpdateAllowed(gh, user, repo, branchName, { deletion: true });
    }
    gh.refs.delete(r.id);
    deleteBranchForHeadRef(gh, repo.id, fullRef);
    return c.body(null, 204);
  });
  app.get("/repos/:owner/:repo/git/commits/:commit_sha", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const commitSha = c.req.param("commit_sha");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const commit = findCommitBySha2(gh, repo.id, commitSha);
    if (!commit) throw notFound();
    return c.json(formatGitCommit(repo, commit, baseUrl));
  });
  app.post("/repos/:owner/:repo/git/commits", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoContentsWrite(gh, c.get("authUser"), repo);
    const body = await parseJsonBody(c);
    if (typeof body.message !== "string") throw new ApiError(422, "message is required");
    if (typeof body.tree !== "string") throw new ApiError(422, "tree is required");
    if (!Array.isArray(body.parents)) throw new ApiError(422, "parents must be an array");
    const parents = body.parents.filter((p) => typeof p === "string");
    const treeSha = body.tree;
    if (!findTreeBySha(gh, repo.id, treeSha)) throw new ApiError(422, "Invalid tree");
    for (const p of parents) {
      if (!findCommitBySha2(gh, repo.id, p)) throw new ApiError(422, `Invalid parent ${p}`);
    }
    let author_name;
    let author_email;
    let author_date;
    let committer_name;
    let committer_email;
    let committer_date;
    const now = timestamp();
    const defaultName = actor.name ?? actor.login;
    const defaultEmail = actor.email ?? `${actor.login}@users.noreply.github.com`;
    if (body.author && typeof body.author === "object" && body.author !== null) {
      const a = body.author;
      if (a.date !== void 0 && (typeof a.date !== "string" || !Number.isFinite(Date.parse(a.date)))) {
        throw new ApiError(422, "author.date must be an ISO 8601 timestamp");
      }
      author_name = typeof a.name === "string" ? a.name : defaultName;
      author_email = typeof a.email === "string" ? a.email : defaultEmail;
      author_date = typeof a.date === "string" ? a.date : now;
    } else {
      author_name = defaultName;
      author_email = defaultEmail;
      author_date = now;
    }
    if (body.committer && typeof body.committer === "object" && body.committer !== null) {
      const a = body.committer;
      if (a.date !== void 0 && (typeof a.date !== "string" || !Number.isFinite(Date.parse(a.date)))) {
        throw new ApiError(422, "committer.date must be an ISO 8601 timestamp");
      }
      committer_name = typeof a.name === "string" ? a.name : defaultName;
      committer_email = typeof a.email === "string" ? a.email : defaultEmail;
      committer_date = typeof a.date === "string" ? a.date : now;
    } else {
      committer_name = author_name;
      committer_email = author_email;
      committer_date = author_date;
    }
    const saved = findOrCreateCommit(gh, repo.id, {
      message: body.message,
      author_name,
      author_email,
      author_date,
      committer_name,
      committer_email,
      committer_date,
      tree_sha: treeSha,
      parent_shas: parents,
      user_id: actor.id
    });
    return c.json(formatGitCommit(repo, saved, baseUrl), 201);
  });
  app.get("/repos/:owner/:repo/git/trees/:tree_sha", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const treeSha = c.req.param("tree_sha");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const commit = resolveRefToCommit(gh, repo, treeSha);
    const tree = findTreeBySha(gh, repo.id, treeSha) ?? (commit ? findTreeBySha(gh, repo.id, commit.tree_sha) : void 0);
    if (!tree) throw notFound();
    const recursive = c.req.query("recursive") !== void 0;
    const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
    const entries = recursive ? expandTreeEntries(gh, repo.id, tree.tree, true) : tree.tree.filter((e) => !e.path.includes("/"));
    return c.json({
      sha: tree.sha,
      url: `${repoUrl}/git/trees/${tree.sha}`,
      tree: entries,
      truncated: tree.truncated
    });
  });
  app.post("/repos/:owner/:repo/git/trees", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsWrite(gh, c.get("authUser"), repo);
    const body = await parseJsonBody(c);
    if (!Array.isArray(body.tree)) throw new ApiError(422, "tree array is required");
    const items = body.tree;
    const baseTreeSha = typeof body.base_tree === "string" ? body.base_tree : void 0;
    if (baseTreeSha && !findTreeBySha(gh, repo.id, baseTreeSha)) throw new ApiError(422, "Invalid base_tree");
    const updates = [];
    for (const raw of items) {
      if (typeof raw.path !== "string" || typeof raw.mode !== "string" || raw.type !== "blob" && raw.type !== "tree" && raw.type !== "commit") {
        throw new ApiError(422, "Each tree entry needs path, mode, type (blob|tree|commit)");
      }
      if (!raw.path || raw.path.includes("\0") || raw.path.split("/").some((part) => part === "" || part === "." || part === "..")) {
        throw new ApiError(422, "Invalid tree path");
      }
      if (raw.sha !== void 0 && raw.content !== void 0) {
        throw new ApiError(422, "Cannot pass both sha and content");
      }
      const validMode = raw.type === "blob" && ["100644", "100755", "120000"].includes(raw.mode) || raw.type === "tree" && raw.mode === "040000" || raw.type === "commit" && raw.mode === "160000";
      if (!validMode) {
        throw new ApiError(422, "Invalid mode for tree entry type");
      }
      if (raw.type !== "blob" && raw.content !== void 0) {
        throw new ApiError(422, "Only blob entries may specify content");
      }
      if (raw.sha === null) {
        updates.push({ path: raw.path, mode: raw.mode, type: raw.type, sha: null });
        continue;
      }
      let sha = raw.sha;
      let size;
      if (raw.content !== void 0) {
        const buf = Buffer.from(String(raw.content), "utf8");
        const blob = findOrCreateBlob(gh, repo.id, buf);
        sha = blob.sha;
        size = blob.size;
      }
      if (typeof sha !== "string") throw new ApiError(422, "sha or content required");
      if (raw.type === "blob") {
        const blob = findBlobBySha(gh, repo.id, sha);
        if (!blob) throw new ApiError(422, "Invalid blob sha");
        size ??= blob.size;
      } else if (raw.type === "tree" && !findTreeBySha(gh, repo.id, sha)) {
        throw new ApiError(422, "Invalid tree sha");
      } else if (raw.type === "commit" && !/^[0-9a-f]{40}$/i.test(sha)) {
        throw new ApiError(422, "Invalid commit sha");
      }
      updates.push({ path: raw.path, mode: raw.mode, type: raw.type, sha, size });
    }
    const saved = persistGitTreeHierarchy(gh, repo.id, baseTreeSha, updates);
    const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
    return c.json(
      {
        sha: saved.sha,
        url: `${repoUrl}/git/trees/${saved.sha}`,
        tree: saved.tree,
        truncated: saved.truncated
      },
      201
    );
  });
  app.get("/repos/:owner/:repo/git/blobs/:file_sha", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const fileSha = c.req.param("file_sha");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const blob = findBlobBySha(gh, repo.id, fileSha);
    if (!blob) throw notFound();
    const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
    const content = blob.encoding === "base64" ? blob.content : Buffer.from(blob.content, "utf8").toString("base64");
    return c.json({
      sha: blob.sha,
      node_id: blob.node_id,
      size: blob.size,
      url: `${repoUrl}/git/blobs/${blob.sha}`,
      content,
      encoding: "base64"
    });
  });
  app.post("/repos/:owner/:repo/git/blobs", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsWrite(gh, c.get("authUser"), repo);
    const body = await parseJsonBody(c);
    if (typeof body.content !== "string") throw new ApiError(422, "content is required");
    const enc = body.encoding === "base64" || body.encoding === "utf-8" ? body.encoding : "utf-8";
    const content = enc === "base64" ? Buffer.from(body.content, "base64") : Buffer.from(body.content, "utf8");
    const saved = findOrCreateBlob(gh, repo.id, content);
    const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
    return c.json(
      {
        sha: saved.sha,
        node_id: saved.node_id,
        url: `${repoUrl}/git/blobs/${saved.sha}`,
        size: saved.size
      },
      201
    );
  });
  app.get("/repos/:owner/:repo/git/tags/:tag_sha", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const tagSha = c.req.param("tag_sha");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const tag = findTagObjectBySha(gh, repo.id, tagSha);
    if (!tag) throw notFound();
    const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
    return c.json({
      tag: tag.tag,
      sha: tag.sha,
      node_id: tag.node_id,
      url: `${repoUrl}/git/tags/${tag.sha}`,
      message: tag.message,
      tagger: {
        name: tag.tagger_name,
        email: tag.tagger_email,
        date: tag.tagger_date
      },
      object: {
        type: tag.object_type,
        sha: tag.object_sha,
        url: objectApiUrl(repo, baseUrl, resolveGitObjectType(gh, repo.id, tag.object_sha), tag.object_sha)
      },
      verification: { verified: false, reason: "unsigned", signature: null, payload: null, verified_at: null }
    });
  });
  app.post("/repos/:owner/:repo/git/tags", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsWrite(gh, c.get("authUser"), repo);
    const body = await parseJsonBody(c);
    if (typeof body.tag !== "string") throw new ApiError(422, "tag is required");
    if (typeof body.message !== "string") throw new ApiError(422, "message is required");
    if (typeof body.object !== "string") throw new ApiError(422, "object is required");
    if (typeof body.type !== "string") throw new ApiError(422, "type is required");
    const now = timestamp();
    let tagger_name = "user";
    let tagger_email = "user@users.noreply.github.com";
    let tagger_date = now;
    if (body.tagger && typeof body.tagger === "object" && body.tagger !== null) {
      const t = body.tagger;
      if (typeof t.name === "string") tagger_name = t.name;
      if (typeof t.email === "string") tagger_email = t.email;
      if (typeof t.date === "string") tagger_date = t.date;
    }
    const tag = gh.tags.insert({
      repo_id: repo.id,
      tag: body.tag,
      sha: generateSha(),
      node_id: "",
      message: body.message,
      tagger_name,
      tagger_email,
      tagger_date,
      object_type: body.type,
      object_sha: body.object
    });
    gh.tags.update(tag.id, { node_id: generateNodeId("Tag", tag.id) });
    const saved = gh.tags.get(tag.id);
    const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
    return c.json(
      {
        tag: saved.tag,
        sha: saved.sha,
        node_id: saved.node_id,
        url: `${repoUrl}/git/tags/${saved.sha}`,
        message: saved.message,
        tagger: {
          name: saved.tagger_name,
          email: saved.tagger_email,
          date: saved.tagger_date
        },
        object: {
          type: saved.object_type,
          sha: saved.object_sha,
          url: objectApiUrl(repo, baseUrl, resolveGitObjectType(gh, repo.id, saved.object_sha), saved.object_sha)
        },
        verification: { verified: false, reason: "unsigned", signature: null, payload: null, verified_at: null }
      },
      201
    );
  });
}
function normalizePath(raw) {
  const path = raw.replace(/^\/+|\/+$/g, "");
  if (path.includes("\0") || path.split("/").some((part) => part === "" || part === "." || part === "..")) {
    throw new ApiError(422, "path is invalid");
  }
  return path;
}
function isWorkflowPath(path) {
  return path.startsWith(".github/workflows/");
}
var RAW_CONTENT_MEDIA_TYPES = /* @__PURE__ */ new Set([
  "application/vnd.github.raw",
  "application/vnd.github.raw+json",
  "application/vnd.github.v3.raw",
  "application/vnd.github.v3.raw+json"
]);
function splitHeaderValue(value, delimiter) {
  const parts = [];
  let start = 0;
  let quoted = false;
  let escaped = false;
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (quoted && char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (!quoted && char === delimiter) {
      parts.push(value.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(value.slice(start));
  return parts;
}
function unquoteHeaderValue(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}
function acceptsRawContent(accept) {
  if (!accept) return false;
  return splitHeaderValue(accept, ",").some((item) => {
    const [mediaType, ...parameters] = splitHeaderValue(item, ";");
    if (!RAW_CONTENT_MEDIA_TYPES.has(mediaType.trim().toLowerCase())) return false;
    return !parameters.some((parameter) => {
      const separator = parameter.indexOf("=");
      if (separator === -1 || parameter.slice(0, separator).trim().toLowerCase() !== "q") return false;
      return /^0(?:\.0*)?$/.test(unquoteHeaderValue(parameter.slice(separator + 1)));
    });
  });
}
function contentLinks(repo, baseUrl, path, ref, blobSha) {
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  const encodedPath = encodeContentPath(path);
  const encodedRef = encodeURIComponent(ref);
  const self = `${repoUrl}/contents/${encodedPath}?ref=${encodedRef}`;
  const html = `${baseUrl}/${repo.full_name}/blob/${encodedRef}/${encodedPath}`;
  const git = blobSha ? `${repoUrl}/git/blobs/${blobSha}` : null;
  return { self, html, git };
}
function findBlob(gh, repoId, sha) {
  return gh.blobs.findBy("repo_id", repoId).find((blob) => blob.sha === sha);
}
function blobBase64(blob) {
  if (!blob) return "";
  return blob.encoding === "base64" ? blob.content : Buffer.from(blob.content, "utf8").toString("base64");
}
function resolveSymlinkPath(path, target) {
  if (!target || target.startsWith("/") || target.includes("\0")) return void 0;
  const parts = path.split("/").slice(0, -1);
  for (const part of target.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      if (!parts.length) return void 0;
      parts.pop();
    } else {
      parts.push(part);
    }
  }
  return parts.join("/");
}
function resolveSymlinkEntry(gh, repoId, path, entry, flat) {
  if (entry.mode !== "120000" || entry.type !== "blob") return void 0;
  const link = findBlob(gh, repoId, entry.sha);
  if (!link) return void 0;
  const targetPath = resolveSymlinkPath(path, blobBytes(link).toString("utf8"));
  if (!targetPath) return void 0;
  const target = flat.blobs.get(targetPath);
  return target?.type === "blob" && (target.mode === "100644" || target.mode === "100755") ? target : void 0;
}
function submoduleUrls(gh, repoId, flat) {
  const result = /* @__PURE__ */ new Map();
  const entry = flat.blobs.get(".gitmodules");
  if (!entry || entry.type !== "blob") return result;
  const blob = findBlob(gh, repoId, entry.sha);
  if (!blob) return result;
  let current;
  const save = () => {
    if (current?.path && current.url) result.set(current.path, current.url);
  };
  for (const line of blobBytes(blob).toString("utf8").split(/\r?\n/)) {
    if (/^\s*\[submodule\s+"(?:[^"\\]|\\.)*"\]\s*(?:[#;].*)?$/.test(line)) {
      save();
      current = {};
      continue;
    }
    if (!current) continue;
    const property = line.match(/^\s*(path|url)\s*=\s*(.*?)\s*$/);
    if (!property) continue;
    current[property[1]] = property[2];
  }
  save();
  return result;
}
function githubSubmoduleFullName(repo, url) {
  if (!url) return void 0;
  const hosted = url.match(
    /^(?:(?:https?|git):\/\/github\.com\/|ssh:\/\/git@github\.com\/|git@github\.com:)([^/]+)\/([^/]+?)(?:\.git)?\/?$/i
  );
  if (hosted) return `${hosted[1]}/${hosted[2]}`;
  const relative = url.match(/^\.\.\/([^/]+?)(?:\.git)?\/?$/);
  if (relative) return `${repo.full_name.split("/")[0]}/${relative[1]}`;
  return void 0;
}
function formatFileContent(gh, repo, baseUrl, path, ref, entry, withContent, flat) {
  const name = path.split("/").pop();
  const encodedPath = encodeContentPath(path);
  const encodedRef = encodeURIComponent(ref);
  const self = contentLinks(repo, baseUrl, path, ref).self;
  if (entry.type === "commit" || entry.mode === "160000") {
    const submoduleUrl = flat ? submoduleUrls(gh, repo.id, flat).get(path) : void 0;
    const fullName = githubSubmoduleFullName(repo, submoduleUrl);
    const gitUrl = fullName ? `${baseUrl}/repos/${fullName}/git/trees/${entry.sha}` : null;
    const htmlUrl = fullName ? `${baseUrl}/${fullName}/tree/${entry.sha}` : null;
    return {
      type: withContent ? "submodule" : "file",
      submodule_git_url: submoduleUrl ?? null,
      size: 0,
      name,
      path,
      sha: entry.sha,
      url: self,
      git_url: gitUrl,
      html_url: htmlUrl,
      download_url: null,
      _links: { self, git: gitUrl, html: htmlUrl }
    };
  }
  const blob = findBlob(gh, repo.id, entry.sha);
  if (entry.mode === "120000") {
    const target = blob ? blobBytes(blob).toString("utf8") : "";
    const resolved = flat ? resolveSymlinkEntry(gh, repo.id, path, entry, flat) : void 0;
    if (!resolved) {
      const links3 = contentLinks(repo, baseUrl, path, ref, entry.sha);
      return {
        type: "symlink",
        target,
        size: blob?.size ?? entry.size ?? 0,
        name,
        path,
        sha: entry.sha,
        url: links3.self,
        git_url: links3.git,
        html_url: links3.html,
        download_url: `${baseUrl}/${repo.full_name}/raw/${encodedRef}/${encodedPath}`,
        _links: { self: links3.self, git: links3.git, html: links3.html }
      };
    }
    const targetBlob = findBlob(gh, repo.id, resolved.sha);
    const links2 = contentLinks(repo, baseUrl, path, ref, entry.sha);
    const base2 = {
      type: "file",
      size: targetBlob?.size ?? resolved.size ?? 0,
      name,
      path,
      sha: entry.sha,
      url: links2.self,
      git_url: links2.git,
      html_url: links2.html,
      download_url: `${baseUrl}/${repo.full_name}/raw/${encodedRef}/${encodedPath}`,
      _links: { self: links2.self, git: links2.git, html: links2.html }
    };
    return withContent ? { ...base2, content: blobBase64(targetBlob), encoding: "base64" } : base2;
  }
  const size = blob?.size ?? entry.size ?? 0;
  const links = contentLinks(repo, baseUrl, path, ref, entry.sha);
  const base = {
    type: "file",
    size,
    name,
    path,
    sha: entry.sha,
    url: links.self,
    git_url: links.git,
    html_url: links.html,
    download_url: `${baseUrl}/${repo.full_name}/raw/${encodedRef}/${encodedPath}`,
    _links: { self: links.self, git: links.git, html: links.html }
  };
  if (!withContent) return base;
  return { ...base, content: blobBase64(blob), encoding: "base64" };
}
function formatDirListing(gh, repo, baseUrl, dirPath, ref, flat) {
  const prefix = dirPath ? `${dirPath}/` : "";
  const files = [];
  const dirNames = /* @__PURE__ */ new Set();
  for (const [path, entry] of flat.blobs) {
    if (!path.startsWith(prefix)) continue;
    const rest = path.slice(prefix.length);
    if (!rest) continue;
    const slash = rest.indexOf("/");
    if (slash === -1) {
      files.push(formatFileContent(gh, repo, baseUrl, path, ref, entry, false, flat));
    } else {
      dirNames.add(rest.slice(0, slash));
    }
  }
  const dirs = [...dirNames].map((name) => {
    const path = prefix + name;
    const links = contentLinks(repo, baseUrl, path, ref);
    const treeSha = flat.dirs.get(path) || null;
    const gitUrl = treeSha ? `${baseUrl}/repos/${repo.full_name}/git/trees/${treeSha}` : null;
    const encodedPath = encodeContentPath(path);
    const encodedRef = encodeURIComponent(ref);
    const htmlUrl = `${baseUrl}/${repo.full_name}/tree/${encodedRef}/${encodedPath}`;
    return {
      type: "dir",
      size: 0,
      name,
      path,
      sha: treeSha ?? "",
      url: links.self,
      git_url: gitUrl,
      html_url: htmlUrl,
      download_url: null,
      _links: { self: links.self, git: gitUrl, html: htmlUrl }
    };
  });
  return [...dirs, ...files].sort((a, b) => String(a.name).localeCompare(String(b.name)));
}
function decodeBodyContent(content) {
  const normalized = content.replace(/\s/g, "");
  if (normalized.length % 4 === 1 || !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) || normalized.slice(0, -2).includes("=")) {
    throw new ApiError(422, "content is not valid Base64");
  }
  const buf = Buffer.from(normalized, "base64");
  if (buf.toString("base64").replace(/=+$/, "") !== normalized.replace(/=+$/, "")) {
    throw new ApiError(422, "content is not valid Base64");
  }
  const text = buf.toString("utf8");
  if (!text.includes("\0") && Buffer.from(text, "utf8").equals(buf)) {
    return { text, base64: normalized };
  }
  return { text: null, base64: buf.toString("base64") };
}
function parseCommitIdentity(value, field) {
  if (value === void 0) return void 0;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(422, `${field} must be an object`);
  }
  const input = value;
  if (typeof input.name !== "string" || !input.name) {
    throw new ApiError(422, `${field}.name is required`);
  }
  if (typeof input.email !== "string" || !input.email) {
    throw new ApiError(422, `${field}.email is required`);
  }
  if (input.date !== void 0 && (typeof input.date !== "string" || !Number.isFinite(Date.parse(input.date)))) {
    throw new ApiError(422, `${field}.date must be an ISO 8601 timestamp`);
  }
  return {
    name: input.name,
    email: input.email,
    ...typeof input.date === "string" ? { date: input.date } : {}
  };
}
function persistTree(gh, repoId, entries) {
  const root = { files: /* @__PURE__ */ new Map(), dirs: /* @__PURE__ */ new Map() };
  for (const [path, entry] of entries) {
    const parts = path.split("/");
    let current = root;
    for (const part of parts.slice(0, -1)) {
      if (current.files.has(part)) throw new ApiError(422, `${path} conflicts with an existing file`);
      let child = current.dirs.get(part);
      if (!child) {
        child = { files: /* @__PURE__ */ new Map(), dirs: /* @__PURE__ */ new Map() };
        current.dirs.set(part, child);
      }
      current = child;
    }
    const name = parts.at(-1);
    if (current.dirs.has(name)) throw new ApiError(422, `${path} conflicts with an existing directory`);
    current.files.set(name, entry);
  }
  const write = (pending) => {
    const treeEntries = [];
    for (const [name, child] of [...pending.dirs].sort(([a], [b]) => a.localeCompare(b))) {
      const subtree = write(child);
      treeEntries.push({ path: name, mode: "040000", type: "tree", sha: subtree.sha });
    }
    for (const [name, entry] of [...pending.files].sort(([a], [b]) => a.localeCompare(b))) {
      treeEntries.push({ path: name, mode: entry.mode, type: entry.type, sha: entry.sha, size: entry.size });
    }
    return findOrCreateTree(gh, repoId, treeEntries);
  };
  return write(root);
}
function commitFiles(gh, params) {
  const { repo, branchName, headCommit, actor } = params;
  const entries = /* @__PURE__ */ new Map();
  if (headCommit) {
    for (const [path, entry] of flattenTree(gh, repo.id, headCommit.tree_sha).blobs) {
      entries.set(path, entry);
    }
  }
  for (const [path, change] of params.changes) {
    if (change === null) entries.delete(path);
    else entries.set(path, change);
  }
  const tree = persistTree(gh, repo.id, entries);
  const now = timestamp();
  const defaultName = actor.name ?? actor.login;
  const defaultEmail = actor.email ?? `${actor.login}@users.noreply.github.com`;
  const committer = {
    name: params.committer?.name ?? defaultName,
    email: params.committer?.email ?? defaultEmail,
    date: params.committer?.date ?? now
  };
  const author = {
    name: params.author?.name ?? params.committer?.name ?? defaultName,
    email: params.author?.email ?? params.committer?.email ?? defaultEmail,
    date: params.author?.date ?? params.committer?.date ?? now
  };
  const saved = findOrCreateCommit(gh, repo.id, {
    message: params.message,
    author_name: author.name,
    author_email: author.email,
    author_date: author.date,
    committer_name: committer.name,
    committer_email: committer.email,
    committer_date: committer.date,
    tree_sha: tree.sha,
    parent_shas: headCommit ? [headCommit.sha] : [],
    user_id: actor.id
  });
  const fullRef = `refs/heads/${branchName}`;
  const refRec = gh.refs.findBy("repo_id", repo.id).find((r) => r.ref === fullRef);
  if (refRec) {
    gh.refs.update(refRec.id, { sha: saved.sha });
  } else {
    const inserted = gh.refs.insert({
      repo_id: repo.id,
      ref: fullRef,
      sha: saved.sha,
      node_id: ""
    });
    gh.refs.update(inserted.id, { node_id: generateNodeId("Ref", inserted.id) });
  }
  const branch = gh.branches.findBy("repo_id", repo.id).find((b) => b.name === branchName);
  if (branch) {
    gh.branches.update(branch.id, { sha: saved.sha });
  } else {
    gh.branches.insert({
      repo_id: repo.id,
      name: branchName,
      sha: saved.sha,
      protected: false
    });
  }
  gh.repos.update(repo.id, { pushed_at: now });
  return saved;
}
function contentsRoutes({ app, store, webhooks, baseUrl }) {
  const gh = getGitHubStore(store);
  const getContents = (c, path) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const refParam = c.req.query("ref");
    const commit = resolveRefToCommit(gh, repo, refParam);
    if (!commit) throw notFound();
    const ref = refParam && refParam !== "HEAD" ? refParam : repo.default_branch;
    const flat = flattenTree(gh, repo.id, commit.tree_sha);
    if (path === "") {
      return c.json(formatDirListing(gh, repo, baseUrl, "", ref, flat));
    }
    const entry = flat.blobs.get(path);
    if (entry) {
      const content = formatFileContent(gh, repo, baseUrl, path, ref, entry, true, flat);
      if (content.type === "file" && acceptsRawContent(c.req.header("Accept"))) {
        const resolved = resolveSymlinkEntry(gh, repo.id, path, entry, flat);
        const blob = findBlob(gh, repo.id, resolved?.sha ?? entry.sha);
        if (!blob) throw notFound();
        const bytes = blobBytes(blob);
        return c.body(bytes, 200, {
          "Content-Type": "application/octet-stream",
          "Content-Length": String(bytes.byteLength)
        });
      }
      return c.json(content);
    }
    const prefix = `${path}/`;
    if (flat.dirs.has(path) || [...flat.blobs.keys()].some((p) => p.startsWith(prefix))) {
      return c.json(formatDirListing(gh, repo, baseUrl, path, ref, flat));
    }
    throw notFound();
  };
  app.get("/:owner/:repo/raw/:ref/:path{.+}", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const ref = c.req.param("ref");
    const path = normalizePath(c.req.param("path"));
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const commit = resolveRefToCommit(gh, repo, ref);
    if (!commit) throw notFound();
    const flat = flattenTree(gh, repo.id, commit.tree_sha);
    const entry = flat.blobs.get(path);
    if (!entry) throw notFound();
    const resolved = resolveSymlinkEntry(gh, repo.id, path, entry, flat);
    const blob = findBlob(gh, repo.id, resolved?.sha ?? entry.sha);
    if (!blob) throw notFound();
    const content = blobBytes(blob);
    return c.body(content, 200, {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(content.byteLength)
    });
  });
  app.get("/repos/:owner/:repo/readme", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const refParam = c.req.query("ref");
    const commit = resolveRefToCommit(gh, repo, refParam);
    if (!commit) throw notFound();
    const ref = refParam && refParam !== "HEAD" ? refParam : repo.default_branch;
    const flat = flattenTree(gh, repo.id, commit.tree_sha);
    const findReadme = (dir) => [...flat.blobs.keys()].filter((path) => {
      const slash = path.lastIndexOf("/");
      const parent = slash === -1 ? "" : path.slice(0, slash);
      const name = slash === -1 ? path : path.slice(slash + 1);
      return parent === dir && /^readme(\.|$)/i.test(name);
    }).sort()[0];
    const readmePath = findReadme(".github") ?? findReadme("") ?? findReadme("docs");
    if (!readmePath) throw notFound();
    const entry = flat.blobs.get(readmePath);
    const content = formatFileContent(gh, repo, baseUrl, readmePath, ref, entry, true, flat);
    if (content.type === "file" && acceptsRawContent(c.req.header("Accept"))) {
      const resolved = resolveSymlinkEntry(gh, repo.id, readmePath, entry, flat);
      const blob = findBlob(gh, repo.id, resolved?.sha ?? entry.sha);
      if (!blob) throw notFound();
      const bytes = blobBytes(blob);
      return c.body(bytes, 200, {
        "Content-Type": "application/octet-stream",
        "Content-Length": String(bytes.byteLength)
      });
    }
    return c.json(content);
  });
  app.get("/repos/:owner/:repo/contents", (c) => getContents(c, ""));
  app.get("/repos/:owner/:repo/contents/", (c) => getContents(c, ""));
  app.get("/repos/:owner/:repo/contents/:path{.+}", (c) => getContents(c, normalizePath(c.req.param("path"))));
  app.put("/repos/:owner/:repo/contents/:path{.+}", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const path = normalizePath(c.req.param("path"));
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const authUser = c.get("authUser");
    const user = assertRepoContentsWrite(gh, authUser, repo);
    if (!path) throw new ApiError(422, "path is required");
    if (isWorkflowPath(path)) assertRepoPermission(gh, authUser, repo, "workflows", "write");
    const body = await parseJsonBody(c);
    if (typeof body.message !== "string" || !body.message) throw new ApiError(422, "message is required");
    if (typeof body.content !== "string") throw new ApiError(422, "content is required");
    if (body.branch !== void 0 && (typeof body.branch !== "string" || !body.branch)) {
      throw new ApiError(422, "branch must be a non-empty string");
    }
    if (body.sha !== void 0 && typeof body.sha !== "string") throw new ApiError(422, "sha must be a string");
    const author = parseCommitIdentity(body.author, "author");
    const committer = parseCommitIdentity(body.committer, "committer");
    const branchName = typeof body.branch === "string" && body.branch ? body.branch : repo.default_branch;
    const hasBranches = gh.refs.findBy("repo_id", repo.id).some((ref) => ref.ref.startsWith("refs/heads/")) || gh.branches.findBy("repo_id", repo.id).length > 0;
    const headCommit = resolveBranchToCommit(gh, repo, branchName) ?? null;
    if (hasBranches && !headCommit) throw notFound();
    assertBranchUpdateAllowed(gh, user, repo, branchName, { parentCount: headCommit ? 1 : 0 });
    const flat = headCommit ? flattenTree(gh, repo.id, headCommit.tree_sha) : void 0;
    const existing = flat?.blobs.get(path);
    if (existing) {
      if (typeof body.sha !== "string") {
        throw new ApiError(422, `"sha" wasn't supplied. ${path} already exists.`);
      }
      if (body.sha !== existing.sha) {
        throw new ApiError(409, `${path} does not match ${body.sha}`);
      }
    } else {
      if (body.sha !== void 0) throw new ApiError(422, `${path} does not exist`);
      const parts = path.split("/");
      for (let i = 1; i < parts.length; i++) {
        const parent = parts.slice(0, i).join("/");
        if (flat?.blobs.has(parent)) throw new ApiError(422, `${path} conflicts with an existing file`);
      }
      if (flat?.dirs.has(path) || [...flat?.blobs.keys() ?? []].some((candidate) => candidate.startsWith(`${path}/`))) {
        throw new ApiError(422, `${path} conflicts with an existing directory`);
      }
    }
    const decoded = decodeBodyContent(body.content);
    const bytes = decoded.text !== null ? Buffer.from(decoded.text, "utf8") : Buffer.from(decoded.base64, "base64");
    const blob = findOrCreateBlob(gh, repo.id, bytes);
    const size = blob.size;
    const commit = commitFiles(gh, {
      repo,
      branchName,
      message: body.message,
      actor: user,
      author,
      committer,
      changes: /* @__PURE__ */ new Map([
        [
          path,
          {
            mode: existing?.type === "blob" ? existing.mode : "100644",
            type: "blob",
            sha: blob.sha,
            size
          }
        ]
      ]),
      headCommit
    });
    webhooks.dispatch(
      "push",
      void 0,
      {
        ref: `refs/heads/${branchName}`,
        before: headCommit?.sha ?? "0".repeat(40),
        after: commit.sha,
        repository: formatRepo(gh.repos.get(repo.id), gh, baseUrl),
        sender: formatUser(user, baseUrl),
        commits: [
          {
            id: commit.sha,
            message: commit.message,
            timestamp: commit.committer_date,
            author: { name: commit.author_name, email: commit.author_email },
            added: existing ? [] : [path],
            removed: [],
            modified: existing ? [path] : []
          }
        ]
      },
      ownerLoginOf(gh, repo),
      repo.name
    );
    const entry = {
      mode: existing?.type === "blob" ? existing.mode : "100644",
      type: "blob",
      sha: blob.sha,
      size
    };
    return c.json(
      {
        content: formatFileContent(gh, repo, baseUrl, path, branchName, entry, false),
        commit: formatGitCommit(repo, commit, baseUrl)
      },
      existing ? 200 : 201
    );
  });
  app.delete("/repos/:owner/:repo/contents/:path{.+}", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const path = normalizePath(c.req.param("path"));
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const authUser = c.get("authUser");
    const user = assertRepoContentsWrite(gh, authUser, repo);
    if (!path) throw new ApiError(422, "path is required");
    if (isWorkflowPath(path)) assertRepoPermission(gh, authUser, repo, "workflows", "write");
    const body = await parseJsonBody(c);
    if (typeof body.message !== "string" || !body.message) throw new ApiError(422, "message is required");
    if (typeof body.sha !== "string") throw new ApiError(422, "sha is required");
    if (body.branch !== void 0 && (typeof body.branch !== "string" || !body.branch)) {
      throw new ApiError(422, "branch must be a non-empty string");
    }
    const author = parseCommitIdentity(body.author, "author");
    const committer = parseCommitIdentity(body.committer, "committer");
    const branchName = typeof body.branch === "string" && body.branch ? body.branch : repo.default_branch;
    const headCommit = resolveBranchToCommit(gh, repo, branchName);
    if (!headCommit) throw notFound();
    assertBranchUpdateAllowed(gh, user, repo, branchName, { parentCount: 1 });
    const existing = flattenTree(gh, repo.id, headCommit.tree_sha).blobs.get(path);
    if (!existing) throw notFound();
    if (body.sha !== existing.sha) {
      throw new ApiError(409, `${path} does not match ${body.sha}`);
    }
    const commit = commitFiles(gh, {
      repo,
      branchName,
      message: body.message,
      actor: user,
      author,
      committer,
      changes: /* @__PURE__ */ new Map([[path, null]]),
      headCommit
    });
    webhooks.dispatch(
      "push",
      void 0,
      {
        ref: `refs/heads/${branchName}`,
        before: headCommit.sha,
        after: commit.sha,
        repository: formatRepo(gh.repos.get(repo.id), gh, baseUrl),
        sender: formatUser(user, baseUrl),
        commits: [
          {
            id: commit.sha,
            message: commit.message,
            timestamp: commit.committer_date,
            author: { name: commit.author_name, email: commit.author_email },
            added: [],
            removed: [path],
            modified: []
          }
        ]
      },
      ownerLoginOf(gh, repo),
      repo.name
    );
    return c.json({ content: null, commit: formatGitCommit(repo, commit, baseUrl) });
  });
}
function blobsAtPath(gh, repoId, treeSha, path) {
  const prefix = `${path.replace(/\/+$/, "")}/`;
  return new Map(
    [...flattenTree(gh, repoId, treeSha).blobs].filter(
      ([candidate]) => candidate === path || candidate.startsWith(prefix)
    )
  );
}
function commitTouchesPath(gh, repoId, commit, path) {
  const current = blobsAtPath(gh, repoId, commit.tree_sha, path);
  const parent = commit.parent_shas[0] ? findCommitBySha(gh, repoId, commit.parent_shas[0]) : void 0;
  const previous = parent ? blobsAtPath(gh, repoId, parent.tree_sha, path) : /* @__PURE__ */ new Map();
  const candidates = /* @__PURE__ */ new Set([...current.keys(), ...previous.keys()]);
  return [...candidates].some((candidate) => {
    const after = current.get(candidate);
    const before = previous.get(candidate);
    return after?.sha !== before?.sha || after?.mode !== before?.mode;
  });
}
function parseDateFilter(value) {
  const date = Date.parse(value);
  return Number.isFinite(date) ? date : void 0;
}
function ancestorDistances(gh, repoId, startSha) {
  const distances = /* @__PURE__ */ new Map();
  const queue = [{ sha: startSha, distance: 0 }];
  for (let i = 0; i < queue.length; i++) {
    const { sha, distance } = queue[i];
    const known = distances.get(sha);
    if (known !== void 0 && known <= distance) continue;
    distances.set(sha, distance);
    const commit = findCommitBySha(gh, repoId, sha);
    if (!commit) continue;
    for (const parent of commit.parent_shas) queue.push({ sha: parent, distance: distance + 1 });
  }
  return distances;
}
function findMergeBase(gh, repoId, baseSha, headSha) {
  const fromBase = ancestorDistances(gh, repoId, baseSha);
  const fromHead = ancestorDistances(gh, repoId, headSha);
  return [...fromBase.keys()].filter((sha) => fromHead.has(sha)).map((sha) => ({ commit: findCommitBySha(gh, repoId, sha), score: fromBase.get(sha) + fromHead.get(sha) })).filter((candidate) => candidate.commit !== void 0).sort((a, b) => a.score - b.score || b.commit.id - a.commit.id)[0]?.commit;
}
function formatFullCommit(gh, repo, commit, baseUrl, baseSha, allFiles, pageFiles) {
  const additions = allFiles.reduce((sum, f) => sum + f.additions, 0);
  const deletions = allFiles.reduce((sum, f) => sum + f.deletions, 0);
  return {
    ...formatCommitItem(gh, repo, commit, baseUrl),
    stats: { total: additions + deletions, additions, deletions },
    files: pageFiles.map((f) => formatFileDiff(f, repo, baseSha, commit.sha, baseUrl))
  };
}
function commitsRoutes({ app, store, baseUrl }) {
  const gh = getGitHubStore(store);
  app.get("/repos/:owner/:repo/commits", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    if (gh.commits.findBy("repo_id", repo.id).length === 0) {
      throw new ApiError(409, "Git Repository is empty.");
    }
    const shaParam = c.req.query("sha");
    const head2 = resolveRefToCommit(gh, repo, shaParam);
    if (!head2) throw notFound();
    let history = listAncestors(gh, repo.id, head2.sha);
    const path = c.req.query("path");
    if (path) {
      history = history.filter((commit) => commitTouchesPath(gh, repo.id, commit, path));
    }
    const author = c.req.query("author");
    if (author) {
      history = history.filter((commit) => commitIdentityMatches(gh, commit.author_email, author));
    }
    const committer = c.req.query("committer");
    if (committer) {
      history = history.filter((commit) => commitIdentityMatches(gh, commit.committer_email, committer));
    }
    const since = c.req.query("since");
    if (since) {
      const sinceDate = parseDateFilter(since);
      history = sinceDate === void 0 ? [] : history.filter((commit) => Date.parse(commit.committer_date) >= sinceDate);
    }
    const until = c.req.query("until");
    if (until) {
      const untilDate = parseDateFilter(until);
      if (untilDate !== void 0) {
        history = history.filter((commit) => Date.parse(commit.committer_date) <= untilDate);
      }
    }
    const { page, per_page } = parsePagination(c);
    const total = history.length;
    const start = (page - 1) * per_page;
    const slice = history.slice(start, start + per_page);
    setLinkHeader(c, total, page, per_page);
    return c.json(slice.map((commit) => formatCommitItem(gh, repo, commit, baseUrl)));
  });
  app.get("/repos/:owner/:repo/compare/:basehead{.+}", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const basehead = c.req.param("basehead");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const sep = basehead.indexOf("...");
    if (sep === -1) throw notFound();
    const base = resolveRefToCommit(gh, repo, basehead.slice(0, sep));
    const head2 = resolveRefToCommit(gh, repo, basehead.slice(sep + 3));
    if (!base || !head2) throw notFound();
    const baseAncestors = new Set(listAncestors(gh, repo.id, base.sha).map((x) => x.sha));
    const headAncestry = listAncestors(gh, repo.id, head2.sha);
    const headAncestors = new Set(headAncestry.map((x) => x.sha));
    const mergeBase = findMergeBase(gh, repo.id, base.sha, head2.sha);
    if (!mergeBase) throw notFound();
    const aheadCommits = headAncestry.filter((x) => !baseAncestors.has(x.sha)).reverse();
    const behindBy = listAncestors(gh, repo.id, base.sha).filter((x) => !headAncestors.has(x.sha)).length;
    const status = base.sha === head2.sha || aheadCommits.length === 0 && behindBy === 0 ? "identical" : aheadCommits.length > 0 && behindBy === 0 ? "ahead" : aheadCommits.length === 0 ? "behind" : "diverged";
    const allFiles = diffTrees(gh, repo.id, mergeBase.tree_sha, head2.tree_sha);
    const hasPagination = c.req.query("page") !== void 0 || c.req.query("per_page") !== void 0;
    let commits = aheadCommits;
    let files = allFiles.slice(0, 300);
    if (hasPagination) {
      const { page, per_page } = parsePagination(c);
      const start = (page - 1) * per_page;
      commits = aheadCommits.slice(start, start + per_page);
      files = page === 1 ? files : [];
      setLinkHeader(c, aheadCommits.length, page, per_page);
    } else if (commits.length > 250) {
      commits = [...commits.slice(0, 249), commits.at(-1)];
    }
    const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
    return c.json({
      url: `${repoUrl}/compare/${basehead}`,
      html_url: `${baseUrl}/${repo.full_name}/compare/${basehead}`,
      permalink_url: `${baseUrl}/${repo.full_name}/compare/${base.sha.slice(0, 12)}...${head2.sha.slice(0, 12)}`,
      diff_url: `${baseUrl}/${repo.full_name}/compare/${basehead}.diff`,
      patch_url: `${baseUrl}/${repo.full_name}/compare/${basehead}.patch`,
      base_commit: formatCommitItem(gh, repo, base, baseUrl),
      merge_base_commit: formatCommitItem(gh, repo, mergeBase, baseUrl),
      status,
      ahead_by: aheadCommits.length,
      behind_by: behindBy,
      total_commits: aheadCommits.length,
      commits: commits.map((commit) => formatCommitItem(gh, repo, commit, baseUrl)),
      files: files.map((f) => formatFileDiff(f, repo, mergeBase.sha, head2.sha, baseUrl))
    });
  });
  app.get("/repos/:owner/:repo/commits/:ref{.+}", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const refParam = c.req.param("ref");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const commit = resolveRefToCommit(gh, repo, refParam);
    if (!commit) throw notFound();
    const parent = commit.parent_shas[0] ? findCommitBySha(gh, repo.id, commit.parent_shas[0]) : void 0;
    const allFiles = diffTrees(gh, repo.id, parent?.tree_sha ?? null, commit.tree_sha);
    const listedFiles = allFiles.slice(0, 3e3);
    const hasPagination = c.req.query("page") !== void 0 || c.req.query("per_page") !== void 0;
    const { page, per_page } = hasPagination ? parsePagination(c) : { page: 1, per_page: 300 };
    const start = (page - 1) * per_page;
    const pageFiles = listedFiles.slice(start, start + per_page);
    setLinkHeader(c, listedFiles.length, page, per_page);
    return c.json(formatFullCommit(gh, repo, commit, baseUrl, parent?.sha ?? null, allFiles, pageFiles));
  });
}
var MEMBERS_TEAM_SLUG = "members";
function notFound2() {
  return new ApiError(404, "Not Found");
}
function requireAuthUser(c) {
  const u = c.get("authUser");
  if (!u) throw unauthorized();
  return u;
}
function requireOrgAdmin(gh, org, auth) {
  const user = gh.users.findOneBy("login", auth.login);
  if (!user) throw forbidden();
  const role = orgRoleForUser(gh, org.id, user.id);
  if (role !== "admin") throw forbidden();
}
function getOrgByLogin(gh, login) {
  return gh.orgs.findOneBy("login", login);
}
function teamsForOrg(gh, orgId) {
  return gh.teams.findBy("org_id", orgId);
}
function getTeamByOrgSlug(gh, org, slug) {
  return teamsForOrg(gh, org.id).find((t) => t.slug === slug);
}
function slugifyFromName(name) {
  const s = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return s || "team";
}
function uniqueTeamSlug(gh, orgId, base) {
  let slug = base;
  let n = 2;
  const taken = (s) => teamsForOrg(gh, orgId).some((t) => t.slug === s);
  while (taken(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}
function orgsForAuthenticatedUser(gh, userId) {
  const memberships = gh.teamMembers.findBy("user_id", userId);
  const orgIds = /* @__PURE__ */ new Set();
  for (const m of memberships) {
    const team = gh.teams.get(m.team_id);
    if (team) orgIds.add(team.org_id);
  }
  const orgs = [...orgIds].map((id) => gh.orgs.get(id)).filter((o) => Boolean(o));
  orgs.sort((a, b) => a.login.localeCompare(b.login));
  return orgs;
}
function listOrgMembersDeduped(gh, orgId) {
  const byUser = /* @__PURE__ */ new Map();
  for (const team of teamsForOrg(gh, orgId)) {
    for (const m of gh.teamMembers.findBy("team_id", team.id)) {
      const user = gh.users.get(m.user_id);
      if (!user) continue;
      const isAdmin = m.role === "maintainer";
      const prev = byUser.get(user.id);
      if (!prev) {
        byUser.set(user.id, { user, isAdmin });
      } else {
        byUser.set(user.id, { user, isAdmin: prev.isAdmin || isAdmin });
      }
    }
  }
  return [...byUser.values()].map(({ user, isAdmin }) => ({
    user,
    orgRole: isAdmin ? "admin" : "member"
  })).sort((a, b) => a.user.id - b.user.id);
}
function orgRoleForUser(gh, orgId, userId) {
  const row = listOrgMembersDeduped(gh, orgId).find((r) => r.user.id === userId);
  return row?.orgRole ?? null;
}
function syncTeamMemberCount(gh, teamId) {
  const n = gh.teamMembers.findBy("team_id", teamId).length;
  gh.teams.update(teamId, { members_count: n });
}
function syncTeamRepoCount(gh, teamId) {
  const n = gh.teamRepos.findBy("team_id", teamId).length;
  gh.teams.update(teamId, { repos_count: n });
}
function findTeamRepo(gh, teamId, repoId) {
  return gh.teamRepos.findBy("team_id", teamId).find((r) => r.repo_id === repoId);
}
function getOrCreateMembersTeam(gh, org) {
  const existing = teamsForOrg(gh, org.id).find((t) => t.slug === MEMBERS_TEAM_SLUG);
  if (existing) return existing;
  const team = gh.teams.insert({
    node_id: "pending",
    name: "Members",
    slug: MEMBERS_TEAM_SLUG,
    description: null,
    privacy: "closed",
    permission: "pull",
    org_id: org.id,
    parent_id: null,
    members_count: 0,
    repos_count: 0
  });
  const fixed = gh.teams.update(team.id, { node_id: generateNodeId("Team", team.id) });
  return fixed ?? team;
}
function deleteTeamCascade(gh, team) {
  for (const child of teamsForOrg(gh, team.org_id).filter((t) => t.parent_id === team.id)) {
    gh.teams.update(child.id, { parent_id: null });
  }
  for (const m of gh.teamMembers.findBy("team_id", team.id)) {
    gh.teamMembers.delete(m.id);
  }
  for (const tr of gh.teamRepos.findBy("team_id", team.id)) {
    gh.teamRepos.delete(tr.id);
  }
  gh.teams.delete(team.id);
}
function removeUserFromAllOrgTeams(gh, orgId, userId) {
  for (const team of teamsForOrg(gh, orgId)) {
    const memberships = gh.teamMembers.findBy("team_id", team.id).filter((m) => m.user_id === userId);
    for (const m of memberships) {
      gh.teamMembers.delete(m.id);
    }
    syncTeamMemberCount(gh, team.id);
  }
}
function membershipUrl(baseUrl, orgLogin, teamSlug, userLogin) {
  return `${baseUrl}/orgs/${orgLogin}/teams/${teamSlug}/memberships/${userLogin}`;
}
function orgMembershipUrl(baseUrl, orgLogin, userLogin) {
  return `${baseUrl}/orgs/${orgLogin}/memberships/${userLogin}`;
}
function formatTeamMembership(baseUrl, orgLogin, teamSlug, user, role) {
  return {
    url: membershipUrl(baseUrl, orgLogin, teamSlug, user.login),
    role,
    state: "active",
    user: formatUser(user, baseUrl)
  };
}
function orgsAndTeamsRoutes({ app, store, baseUrl }) {
  const gh = getGitHubStore(store);
  app.get("/organizations", (c) => {
    const since = Math.max(0, parseInt(c.req.query("since") ?? "0", 10) || 0);
    const perPage = Math.min(100, Math.max(1, parseInt(c.req.query("per_page") ?? "30", 10) || 30));
    const ordered = gh.orgs.all().filter((o) => o.id > since).sort((a, b) => a.id - b.id);
    const page = ordered.slice(0, perPage);
    if (page.length === perPage && ordered.length > perPage) {
      const lastId = page[page.length - 1].id;
      const nextUrl = new URL(c.req.url);
      nextUrl.searchParams.set("since", String(lastId));
      nextUrl.searchParams.set("per_page", String(perPage));
      c.header("Link", `<${nextUrl.toString()}>; rel="next"`);
    }
    return c.json(page.map((o) => formatOrgBrief(o, baseUrl)));
  });
  app.get("/user/orgs", (c) => {
    const auth = requireAuthUser(c);
    const user = gh.users.findOneBy("login", auth.login);
    if (!user) throw notFound2();
    const orgs = orgsForAuthenticatedUser(gh, user.id);
    return c.json(orgs.map((o) => formatOrgBrief(o, baseUrl)));
  });
  app.get("/orgs/:org", (c) => {
    const org = getOrgByLogin(gh, c.req.param("org"));
    if (!org) throw notFound2();
    return c.json(formatOrgFull(org, baseUrl));
  });
  app.patch("/orgs/:org", async (c) => {
    const auth = requireAuthUser(c);
    const org = getOrgByLogin(gh, c.req.param("org"));
    if (!org) throw notFound2();
    requireOrgAdmin(gh, org, auth);
    const body = await parseJsonBody(c);
    const patch = {};
    if ("billing_email" in body) {
      if (body.billing_email === null) patch.billing_email = null;
      else if (typeof body.billing_email === "string") patch.billing_email = body.billing_email;
    }
    if ("company" in body) {
      if (body.company === null) patch.company = null;
      else if (typeof body.company === "string") patch.company = body.company;
    }
    if ("email" in body) {
      if (body.email === null) patch.email = null;
      else if (typeof body.email === "string") patch.email = body.email;
    }
    if ("twitter_username" in body) {
      if (body.twitter_username === null) patch.twitter_username = null;
      else if (typeof body.twitter_username === "string") {
        patch.twitter_username = body.twitter_username;
      }
    }
    if ("location" in body) {
      if (body.location === null) patch.location = null;
      else if (typeof body.location === "string") patch.location = body.location;
    }
    if ("name" in body) {
      if (body.name === null) patch.name = null;
      else if (typeof body.name === "string") patch.name = body.name;
    }
    if ("description" in body) {
      if (body.description === null) patch.description = null;
      else if (typeof body.description === "string") patch.description = body.description;
    }
    if ("default_repository_permission" in body && typeof body.default_repository_permission === "string") {
      patch.default_repository_permission = body.default_repository_permission;
    }
    if ("members_can_create_repositories" in body && typeof body.members_can_create_repositories === "boolean") {
      patch.members_can_create_repositories = body.members_can_create_repositories;
    }
    const updated = gh.orgs.update(org.id, patch);
    if (!updated) throw notFound2();
    return c.json(formatOrgFull(updated, baseUrl));
  });
  app.get("/orgs/:org/members", (c) => {
    const org = getOrgByLogin(gh, c.req.param("org"));
    if (!org) throw notFound2();
    const roleQ = (c.req.query("role") ?? "all").toLowerCase();
    if (roleQ !== "all" && roleQ !== "admin" && roleQ !== "member") {
      throw new ApiError(422, "Invalid role parameter");
    }
    let rows = listOrgMembersDeduped(gh, org.id);
    if (roleQ === "admin") rows = rows.filter((r) => r.orgRole === "admin");
    else if (roleQ === "member") rows = rows.filter((r) => r.orgRole === "member");
    const { page, per_page } = parsePagination(c);
    const total = rows.length;
    const start = (page - 1) * per_page;
    const slice = rows.slice(start, start + per_page);
    setLinkHeader(c, total, page, per_page);
    return c.json(slice.map((r) => formatUser(r.user, baseUrl)));
  });
  app.get("/orgs/:org/members/:username", (c) => {
    const org = getOrgByLogin(gh, c.req.param("org"));
    if (!org) throw notFound2();
    const user = gh.users.findOneBy("login", c.req.param("username"));
    if (!user) throw notFound2();
    if (!orgRoleForUser(gh, org.id, user.id)) throw notFound2();
    return c.body(null, 204);
  });
  app.delete("/orgs/:org/members/:username", (c) => {
    const auth = requireAuthUser(c);
    const org = getOrgByLogin(gh, c.req.param("org"));
    if (!org) throw notFound2();
    requireOrgAdmin(gh, org, auth);
    const user = gh.users.findOneBy("login", c.req.param("username"));
    if (!user) throw notFound2();
    removeUserFromAllOrgTeams(gh, org.id, user.id);
    return c.body(null, 204);
  });
  app.get("/orgs/:org/memberships/:username", (c) => {
    const org = getOrgByLogin(gh, c.req.param("org"));
    if (!org) throw notFound2();
    const user = gh.users.findOneBy("login", c.req.param("username"));
    if (!user) throw notFound2();
    const role = orgRoleForUser(gh, org.id, user.id);
    if (!role) throw notFound2();
    return c.json({
      url: orgMembershipUrl(baseUrl, org.login, user.login),
      state: "active",
      role,
      organization_url: `${baseUrl}/orgs/${org.login}`,
      user: formatUser(user, baseUrl),
      organization: formatOrgBrief(org, baseUrl)
    });
  });
  app.put("/orgs/:org/memberships/:username", async (c) => {
    const auth = requireAuthUser(c);
    const org = getOrgByLogin(gh, c.req.param("org"));
    if (!org) throw notFound2();
    requireOrgAdmin(gh, org, auth);
    const user = gh.users.findOneBy("login", c.req.param("username"));
    if (!user) throw notFound2();
    const body = await parseJsonBody(c);
    const roleRaw = body.role;
    if (roleRaw !== "admin" && roleRaw !== "member") {
      throw new ApiError(422, "role must be admin or member");
    }
    const teamRole = roleRaw === "admin" ? "maintainer" : "member";
    const membersTeam = getOrCreateMembersTeam(gh, org);
    const existing = gh.teamMembers.findBy("team_id", membersTeam.id).find((m) => m.user_id === user.id);
    if (existing) {
      gh.teamMembers.update(existing.id, { role: teamRole });
    } else {
      gh.teamMembers.insert({ team_id: membersTeam.id, user_id: user.id, role: teamRole });
    }
    syncTeamMemberCount(gh, membersTeam.id);
    const orgRole = orgRoleForUser(gh, org.id, user.id);
    return c.json({
      url: orgMembershipUrl(baseUrl, org.login, user.login),
      state: "active",
      role: orgRole,
      organization_url: `${baseUrl}/orgs/${org.login}`,
      user: formatUser(user, baseUrl),
      organization: formatOrgBrief(org, baseUrl)
    });
  });
  app.get("/orgs/:org/teams", (c) => {
    const org = getOrgByLogin(gh, c.req.param("org"));
    if (!org) throw notFound2();
    const all = teamsForOrg(gh, org.id).sort((a, b) => a.id - b.id);
    const { page, per_page } = parsePagination(c);
    const total = all.length;
    const start = (page - 1) * per_page;
    const slice = all.slice(start, start + per_page);
    setLinkHeader(c, total, page, per_page);
    return c.json(slice.map((t) => formatTeamBrief(t, gh, baseUrl)));
  });
  app.post("/orgs/:org/teams", async (c) => {
    requireAuthUser(c);
    const org = getOrgByLogin(gh, c.req.param("org"));
    if (!org) throw notFound2();
    const body = await parseJsonBody(c);
    const name = body.name;
    if (typeof name !== "string" || !name.trim()) {
      throw new ApiError(422, "name is required");
    }
    let parentId = null;
    if (body.parent_team_id != null) {
      const pid = Number(body.parent_team_id);
      const parent = gh.teams.get(pid);
      if (!parent || parent.org_id !== org.id) {
        throw new ApiError(422, "Invalid parent_team_id");
      }
      parentId = parent.id;
    }
    const baseSlug = uniqueTeamSlug(gh, org.id, slugifyFromName(name));
    const privacy = body.privacy === "secret" || body.privacy === "closed" ? body.privacy : "closed";
    const permission = typeof body.permission === "string" ? body.permission : "pull";
    const description = body.description === null ? null : typeof body.description === "string" ? body.description : null;
    const team = gh.teams.insert({
      node_id: "pending",
      name: name.trim(),
      slug: baseSlug,
      description,
      privacy,
      permission,
      org_id: org.id,
      parent_id: parentId,
      members_count: 0,
      repos_count: 0
    });
    const fixed = gh.teams.update(team.id, { node_id: generateNodeId("Team", team.id) });
    return c.json(formatTeamBrief(fixed ?? team, gh, baseUrl), 201);
  });
  app.get("/orgs/:org/teams/:team_slug", (c) => {
    const org = getOrgByLogin(gh, c.req.param("org"));
    if (!org) throw notFound2();
    const team = getTeamByOrgSlug(gh, org, c.req.param("team_slug"));
    if (!team) throw notFound2();
    return c.json(formatTeamBrief(team, gh, baseUrl));
  });
  app.patch("/orgs/:org/teams/:team_slug", async (c) => {
    requireAuthUser(c);
    const org = getOrgByLogin(gh, c.req.param("org"));
    if (!org) throw notFound2();
    const team = getTeamByOrgSlug(gh, org, c.req.param("team_slug"));
    if (!team) throw notFound2();
    const body = await parseJsonBody(c);
    const patch = {};
    if ("name" in body && typeof body.name === "string" && body.name.trim()) {
      patch.name = body.name.trim();
    }
    if ("description" in body) {
      if (body.description === null) patch.description = null;
      else if (typeof body.description === "string") patch.description = body.description;
    }
    if (body.privacy === "secret" || body.privacy === "closed") {
      patch.privacy = body.privacy;
    }
    if ("permission" in body && typeof body.permission === "string") {
      patch.permission = body.permission;
    }
    if ("parent_team_id" in body) {
      if (body.parent_team_id === null) {
        patch.parent_id = null;
      } else {
        const pid = Number(body.parent_team_id);
        const parent = gh.teams.get(pid);
        if (!parent || parent.org_id !== org.id) {
          throw new ApiError(422, "Invalid parent_team_id");
        }
        if (parent.id === team.id) throw new ApiError(422, "Invalid parent_team_id");
        patch.parent_id = parent.id;
      }
    }
    const updated = gh.teams.update(team.id, patch);
    if (!updated) throw notFound2();
    return c.json(formatTeamBrief(updated, gh, baseUrl));
  });
  app.delete("/orgs/:org/teams/:team_slug", (c) => {
    requireAuthUser(c);
    const org = getOrgByLogin(gh, c.req.param("org"));
    if (!org) throw notFound2();
    const team = getTeamByOrgSlug(gh, org, c.req.param("team_slug"));
    if (!team) throw notFound2();
    deleteTeamCascade(gh, team);
    return c.body(null, 204);
  });
  app.get("/orgs/:org/teams/:team_slug/members", (c) => {
    const org = getOrgByLogin(gh, c.req.param("org"));
    if (!org) throw notFound2();
    const team = getTeamByOrgSlug(gh, org, c.req.param("team_slug"));
    if (!team) throw notFound2();
    const roleQ = (c.req.query("role") ?? "all").toLowerCase();
    if (roleQ !== "all" && roleQ !== "member" && roleQ !== "maintainer") {
      throw new ApiError(422, "Invalid role parameter");
    }
    let members = gh.teamMembers.findBy("team_id", team.id).map((m) => {
      const user = gh.users.get(m.user_id);
      return user ? { user, role: m.role } : null;
    }).filter((x) => Boolean(x));
    if (roleQ === "member") members = members.filter((m) => m.role === "member");
    else if (roleQ === "maintainer") members = members.filter((m) => m.role === "maintainer");
    members.sort((a, b) => a.user.id - b.user.id);
    const { page, per_page } = parsePagination(c);
    const total = members.length;
    const start = (page - 1) * per_page;
    const slice = members.slice(start, start + per_page);
    setLinkHeader(c, total, page, per_page);
    return c.json(slice.map((m) => formatUser(m.user, baseUrl)));
  });
  app.put("/orgs/:org/teams/:team_slug/memberships/:username", async (c) => {
    requireAuthUser(c);
    const org = getOrgByLogin(gh, c.req.param("org"));
    if (!org) throw notFound2();
    const team = getTeamByOrgSlug(gh, org, c.req.param("team_slug"));
    if (!team) throw notFound2();
    const user = gh.users.findOneBy("login", c.req.param("username"));
    if (!user) throw notFound2();
    const body = await parseJsonBody(c);
    const role = body.role === "maintainer" ? "maintainer" : "member";
    const existing = gh.teamMembers.findBy("team_id", team.id).find((m) => m.user_id === user.id);
    if (existing) {
      gh.teamMembers.update(existing.id, { role });
    } else {
      gh.teamMembers.insert({ team_id: team.id, user_id: user.id, role });
    }
    syncTeamMemberCount(gh, team.id);
    return c.json(formatTeamMembership(baseUrl, org.login, team.slug, user, role));
  });
  app.delete("/orgs/:org/teams/:team_slug/memberships/:username", (c) => {
    requireAuthUser(c);
    const org = getOrgByLogin(gh, c.req.param("org"));
    if (!org) throw notFound2();
    const team = getTeamByOrgSlug(gh, org, c.req.param("team_slug"));
    if (!team) throw notFound2();
    const user = gh.users.findOneBy("login", c.req.param("username"));
    if (!user) throw notFound2();
    const existing = gh.teamMembers.findBy("team_id", team.id).find((m) => m.user_id === user.id);
    if (existing) {
      gh.teamMembers.delete(existing.id);
      syncTeamMemberCount(gh, team.id);
    }
    return c.body(null, 204);
  });
  app.get("/orgs/:org/teams/:team_slug/memberships/:username", (c) => {
    const org = getOrgByLogin(gh, c.req.param("org"));
    if (!org) throw notFound2();
    const team = getTeamByOrgSlug(gh, org, c.req.param("team_slug"));
    if (!team) throw notFound2();
    const user = gh.users.findOneBy("login", c.req.param("username"));
    if (!user) throw notFound2();
    const m = gh.teamMembers.findBy("team_id", team.id).find((x) => x.user_id === user.id);
    if (!m) throw notFound2();
    return c.json(formatTeamMembership(baseUrl, org.login, team.slug, user, m.role));
  });
  app.get("/orgs/:org/teams/:team_slug/repos", (c) => {
    const org = getOrgByLogin(gh, c.req.param("org"));
    if (!org) throw notFound2();
    const team = getTeamByOrgSlug(gh, org, c.req.param("team_slug"));
    if (!team) throw notFound2();
    const links = gh.teamRepos.findBy("team_id", team.id);
    const repos = links.map((l) => gh.repos.get(l.repo_id)).filter((r) => Boolean(r)).sort((a, b) => a.id - b.id);
    const { page, per_page } = parsePagination(c);
    const total = repos.length;
    const start = (page - 1) * per_page;
    const slice = repos.slice(start, start + per_page);
    setLinkHeader(c, total, page, per_page);
    return c.json(slice.map((r) => formatRepo(r, gh, baseUrl)));
  });
  app.put("/orgs/:org/teams/:team_slug/repos/:owner/:repo", (c) => {
    requireAuthUser(c);
    const org = getOrgByLogin(gh, c.req.param("org"));
    if (!org) throw notFound2();
    const team = getTeamByOrgSlug(gh, org, c.req.param("team_slug"));
    if (!team) throw notFound2();
    const ownerLogin2 = c.req.param("owner");
    const ownerInfo = lookupOwner(gh, ownerLogin2);
    if (!ownerInfo || ownerInfo.type !== "Organization" || ownerInfo.id !== org.id) {
      throw new ApiError(422, "Repository must belong to this organization");
    }
    const repo = lookupRepo(gh, ownerLogin2, c.req.param("repo"));
    if (!repo) throw notFound2();
    if (!findTeamRepo(gh, team.id, repo.id)) {
      gh.teamRepos.insert({ team_id: team.id, repo_id: repo.id });
      syncTeamRepoCount(gh, team.id);
    }
    return c.body(null, 204);
  });
  app.delete("/orgs/:org/teams/:team_slug/repos/:owner/:repo", (c) => {
    requireAuthUser(c);
    const org = getOrgByLogin(gh, c.req.param("org"));
    if (!org) throw notFound2();
    const team = getTeamByOrgSlug(gh, org, c.req.param("team_slug"));
    if (!team) throw notFound2();
    const ownerLogin2 = c.req.param("owner");
    const ownerInfo = lookupOwner(gh, ownerLogin2);
    if (!ownerInfo || ownerInfo.type !== "Organization" || ownerInfo.id !== org.id) {
      throw new ApiError(422, "Repository must belong to this organization");
    }
    const repo = lookupRepo(gh, ownerLogin2, c.req.param("repo"));
    if (!repo) throw notFound2();
    const tr = findTeamRepo(gh, team.id, repo.id);
    if (tr) {
      gh.teamRepos.delete(tr.id);
      syncTeamRepoCount(gh, team.id);
    }
    return c.body(null, 204);
  });
  app.get("/teams/:team_id", (c) => {
    const tid = parseInt(c.req.param("team_id") ?? "", 10);
    if (Number.isNaN(tid)) throw notFound2();
    const team = gh.teams.get(tid);
    if (!team) throw notFound2();
    return c.json(formatTeamBrief(team, gh, baseUrl));
  });
  app.get("/teams/:team_id/members", (c) => {
    const tid = parseInt(c.req.param("team_id") ?? "", 10);
    if (Number.isNaN(tid)) throw notFound2();
    const team = gh.teams.get(tid);
    if (!team) throw notFound2();
    const roleQ = (c.req.query("role") ?? "all").toLowerCase();
    if (roleQ !== "all" && roleQ !== "member" && roleQ !== "maintainer") {
      throw new ApiError(422, "Invalid role parameter");
    }
    let members = gh.teamMembers.findBy("team_id", team.id).map((m) => {
      const user = gh.users.get(m.user_id);
      return user ? { user, role: m.role } : null;
    }).filter((x) => Boolean(x));
    if (roleQ === "member") members = members.filter((m) => m.role === "member");
    else if (roleQ === "maintainer") members = members.filter((m) => m.role === "maintainer");
    members.sort((a, b) => a.user.id - b.user.id);
    const { page, per_page } = parsePagination(c);
    const total = members.length;
    const start = (page - 1) * per_page;
    const slice = members.slice(start, start + per_page);
    setLinkHeader(c, total, page, per_page);
    return c.json(slice.map((m) => formatUser(m.user, baseUrl)));
  });
}
function isAuthenticatedActor(gh, authUser) {
  return Boolean(authUser?.installation || authUser && getActorUser(gh, authUser));
}
function assertReleaseVisible(gh, authUser, release) {
  if (release.draft && !isAuthenticatedActor(gh, authUser)) {
    throw notFound();
  }
}
function releasesForRepo(gh, repoId) {
  return gh.releases.findBy("repo_id", repoId);
}
function findReleaseById(gh, repoId, releaseId) {
  const r = gh.releases.get(releaseId);
  if (!r || r.repo_id !== repoId) return void 0;
  return r;
}
function findReleaseByTag(gh, repoId, tagName) {
  return releasesForRepo(gh, repoId).find((rel) => rel.tag_name === tagName);
}
function tagTaken(gh, repoId, tagName, exceptId) {
  return releasesForRepo(gh, repoId).some((r) => r.tag_name === tagName && r.id !== exceptId);
}
function sortReleasesByCreatedDesc(a, b) {
  return b.created_at.localeCompare(a.created_at);
}
function deleteAssetsForRelease(gh, releaseId) {
  for (const a of gh.releaseAssets.findBy("release_id", releaseId)) {
    gh.releaseAssets.delete(a.id);
  }
}
function dispatchReleaseWebhook(webhooks, gh, repo, actor, release, action, baseUrl) {
  const relFmt = formatRelease(release, gh, baseUrl);
  if (!relFmt) return;
  const ownerLogin2 = ownerLoginOf(gh, repo);
  webhooks.dispatch(
    "release",
    action,
    {
      action,
      release: relFmt,
      repository: formatRepo(repo, gh, baseUrl),
      sender: formatUser(actor, baseUrl)
    },
    ownerLogin2,
    repo.name
  );
}
function releasesRoutes({ app, store, webhooks, baseUrl }) {
  const gh = getGitHubStore(store);
  app.get("/repos/:owner/:repo/releases", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const authUser = c.get("authUser");
    const showDrafts = isAuthenticatedActor(gh, authUser);
    let list = releasesForRepo(gh, repo.id);
    if (!showDrafts) {
      list = list.filter((r) => !r.draft);
    }
    list = [...list].sort(sortReleasesByCreatedDesc);
    const { page, per_page } = parsePagination(c);
    const total = list.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    const pageItems = list.slice(start, start + per_page);
    const out = pageItems.map((r) => formatRelease(r, gh, baseUrl)).filter(Boolean);
    return c.json(out);
  });
  app.post("/repos/:owner/:repo/releases/generate-notes", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const authUser = c.get("authUser");
    assertRepoPermission(gh, authUser, repo, "contents", "write");
    assertRepoWrite(gh, authUser, repo, "contents");
    const body = await parseJsonBody(c);
    const tagName = typeof body.tag_name === "string" ? body.tag_name : "";
    const target = typeof body.target_commitish === "string" ? body.target_commitish : void 0;
    const prev = typeof body.previous_tag_name === "string" ? body.previous_tag_name : void 0;
    return c.json({
      name: tagName ? `Release ${tagName}` : "Release",
      body: `## What's changed

_Auto-generated release notes (stub)._

<!-- target: ${target ?? "default"} previous: ${prev ?? "none"} -->`
    });
  });
  app.get("/repos/:owner/:repo/releases/latest", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const candidates = releasesForRepo(gh, repo.id).filter((r) => !r.draft && !r.prerelease && r.published_at);
    if (candidates.length === 0) throw notFound();
    candidates.sort((a, b) => {
      const pa = a.published_at ?? a.created_at;
      const pb = b.published_at ?? b.created_at;
      return pb.localeCompare(pa);
    });
    const latest = candidates[0];
    const fmt = formatRelease(latest, gh, baseUrl);
    if (!fmt) throw notFound();
    return c.json(fmt);
  });
  app.get("/repos/:owner/:repo/releases/tags/:tag", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const tag = c.req.param("tag");
    const release = findReleaseByTag(gh, repo.id, tag);
    if (!release) throw notFound();
    assertReleaseVisible(gh, c.get("authUser"), release);
    const fmt = formatRelease(release, gh, baseUrl);
    if (!fmt) throw notFound();
    return c.json(fmt);
  });
  app.get("/repos/:owner/:repo/releases/assets/:asset_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const assetId = parseInt(c.req.param("asset_id"), 10);
    if (!Number.isFinite(assetId)) throw notFound();
    const asset = gh.releaseAssets.get(assetId);
    if (!asset || asset.repo_id !== repo.id) throw notFound();
    const release = gh.releases.get(asset.release_id);
    if (release) {
      assertReleaseVisible(gh, c.get("authUser"), release);
    }
    return c.json(formatReleaseAsset(asset, repo, baseUrl));
  });
  app.patch("/repos/:owner/:repo/releases/assets/:asset_id", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoWrite(gh, c.get("authUser"), repo, "contents");
    const assetId = parseInt(c.req.param("asset_id"), 10);
    if (!Number.isFinite(assetId)) throw notFound();
    const asset = gh.releaseAssets.get(assetId);
    if (!asset || asset.repo_id !== repo.id) throw notFound();
    const body = await parseJsonBody(c);
    const patch = {};
    if (typeof body.name === "string") patch.name = body.name;
    if (typeof body.label === "string" || body.label === null) patch.label = body.label;
    const updated = gh.releaseAssets.update(asset.id, patch);
    if (!updated) throw notFound();
    return c.json(formatReleaseAsset(updated, repo, baseUrl));
  });
  app.delete("/repos/:owner/:repo/releases/assets/:asset_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoWrite(gh, c.get("authUser"), repo, "contents");
    const assetId = parseInt(c.req.param("asset_id"), 10);
    if (!Number.isFinite(assetId)) throw notFound();
    const asset = gh.releaseAssets.get(assetId);
    if (!asset || asset.repo_id !== repo.id) throw notFound();
    gh.releaseAssets.delete(asset.id);
    return c.body(null, 204);
  });
  app.post("/repos/:owner/:repo/releases", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, "contents");
    const body = await parseJsonBody(c);
    if (typeof body.tag_name !== "string" || !body.tag_name.trim()) {
      throw new ApiError(422, "Validation failed");
    }
    const tag_name = body.tag_name.trim();
    if (tagTaken(gh, repo.id, tag_name)) {
      throw new ApiError(422, "Validation failed");
    }
    const target_commitish = typeof body.target_commitish === "string" && body.target_commitish.trim() ? body.target_commitish.trim() : repo.default_branch;
    const draft = typeof body.draft === "boolean" ? body.draft : false;
    const prerelease = typeof body.prerelease === "boolean" ? body.prerelease : false;
    let name = typeof body.name === "string" || body.name === null ? body.name : null;
    let releaseBody = typeof body.body === "string" || body.body === null ? body.body : null;
    if (body.generate_release_notes === true) {
      releaseBody = releaseBody ?? `## What's changed

_Auto-generated release notes (stub) for ${tag_name}._`;
      name = name ?? `Release ${tag_name}`;
    }
    const published_at = draft ? null : timestamp();
    const row = gh.releases.insert({
      node_id: "",
      repo_id: repo.id,
      tag_name,
      target_commitish,
      name,
      body: releaseBody,
      draft,
      prerelease,
      author_id: actor.id,
      published_at
    });
    gh.releases.update(row.id, { node_id: generateNodeId("Release", row.id) });
    const release = gh.releases.get(row.id);
    if (draft) {
      dispatchReleaseWebhook(webhooks, gh, repo, actor, release, "created", baseUrl);
    } else {
      dispatchReleaseWebhook(webhooks, gh, repo, actor, release, "published", baseUrl);
    }
    const fmt = formatRelease(release, gh, baseUrl);
    if (!fmt) throw notFound();
    return c.json(fmt, 201);
  });
  app.get("/repos/:owner/:repo/releases/:release_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const releaseId = parseInt(c.req.param("release_id"), 10);
    if (!Number.isFinite(releaseId)) throw notFound();
    const release = findReleaseById(gh, repo.id, releaseId);
    if (!release) throw notFound();
    assertReleaseVisible(gh, c.get("authUser"), release);
    const fmt = formatRelease(release, gh, baseUrl);
    if (!fmt) throw notFound();
    return c.json(fmt);
  });
  app.patch("/repos/:owner/:repo/releases/:release_id", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, "contents");
    const releaseId = parseInt(c.req.param("release_id"), 10);
    if (!Number.isFinite(releaseId)) throw notFound();
    const release = findReleaseById(gh, repo.id, releaseId);
    if (!release) throw notFound();
    const body = await parseJsonBody(c);
    const patch = {};
    if (typeof body.tag_name === "string" && body.tag_name.trim()) {
      const nextTag = body.tag_name.trim();
      if (tagTaken(gh, repo.id, nextTag, release.id)) {
        throw new ApiError(422, "Validation failed");
      }
      patch.tag_name = nextTag;
    }
    if (typeof body.target_commitish === "string" && body.target_commitish.trim()) {
      patch.target_commitish = body.target_commitish.trim();
    }
    if (typeof body.name === "string" || body.name === null) patch.name = body.name;
    if (typeof body.body === "string" || body.body === null) patch.body = body.body;
    if (typeof body.draft === "boolean") patch.draft = body.draft;
    if (typeof body.prerelease === "boolean") patch.prerelease = body.prerelease;
    const wasDraft = release.draft;
    let publishedJustNow = false;
    if (wasDraft && typeof body.draft === "boolean" && body.draft === false) {
      patch.published_at = timestamp();
      publishedJustNow = true;
    }
    const updated = gh.releases.update(release.id, patch);
    if (!updated) throw notFound();
    if (publishedJustNow) {
      dispatchReleaseWebhook(webhooks, gh, repo, actor, updated, "published", baseUrl);
    }
    const fmt = formatRelease(updated, gh, baseUrl);
    if (!fmt) throw notFound();
    return c.json(fmt);
  });
  app.delete("/repos/:owner/:repo/releases/:release_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoWrite(gh, c.get("authUser"), repo, "contents");
    const releaseId = parseInt(c.req.param("release_id"), 10);
    if (!Number.isFinite(releaseId)) throw notFound();
    const release = findReleaseById(gh, repo.id, releaseId);
    if (!release) throw notFound();
    deleteAssetsForRelease(gh, release.id);
    gh.releases.delete(release.id);
    return c.body(null, 204);
  });
  app.get("/repos/:owner/:repo/releases/:release_id/assets", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoContentsRead(gh, c.get("authUser"), repo);
    const releaseId = parseInt(c.req.param("release_id"), 10);
    if (!Number.isFinite(releaseId)) throw notFound();
    const release = findReleaseById(gh, repo.id, releaseId);
    if (!release) throw notFound();
    assertReleaseVisible(gh, c.get("authUser"), release);
    let assets = gh.releaseAssets.findBy("release_id", release.id);
    assets = [...assets].sort((a, b) => b.created_at.localeCompare(a.created_at));
    const { page, per_page } = parsePagination(c);
    const total = assets.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    const pageItems = assets.slice(start, start + per_page);
    return c.json(pageItems.map((a) => formatReleaseAsset(a, repo, baseUrl)));
  });
  app.post("/repos/:owner/:repo/releases/:release_id/assets", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, "contents");
    const releaseId = parseInt(c.req.param("release_id"), 10);
    if (!Number.isFinite(releaseId)) throw notFound();
    const release = findReleaseById(gh, repo.id, releaseId);
    if (!release) throw notFound();
    const nameQ = c.req.query("name");
    if (!nameQ || !nameQ.trim()) {
      throw new ApiError(422, "Validation failed");
    }
    const assetName = nameQ.trim();
    const labelRaw = c.req.query("label");
    const label = labelRaw === void 0 || labelRaw === "" ? null : labelRaw;
    const buf = await c.req.arrayBuffer();
    const size = buf.byteLength;
    const contentType = c.req.header("Content-Type")?.split(";")[0]?.trim() || "application/octet-stream";
    const row = gh.releaseAssets.insert({
      node_id: "",
      release_id: release.id,
      repo_id: repo.id,
      name: assetName,
      label,
      state: "uploaded",
      content_type: contentType,
      size,
      download_count: 0,
      uploader_id: actor.id
    });
    gh.releaseAssets.update(row.id, { node_id: generateNodeId("ReleaseAsset", row.id) });
    const asset = gh.releaseAssets.get(row.id);
    return c.json(formatReleaseAsset(asset, repo, baseUrl), 201);
  });
}
function teamsForOrg2(gh, orgId) {
  return gh.teams.findBy("org_id", orgId);
}
function listOrgMembersDeduped2(gh, orgId) {
  const byUser = /* @__PURE__ */ new Map();
  for (const team of teamsForOrg2(gh, orgId)) {
    for (const m of gh.teamMembers.findBy("team_id", team.id)) {
      const user = gh.users.get(m.user_id);
      if (!user) continue;
      const isAdmin = m.role === "maintainer";
      const prev = byUser.get(user.id);
      if (!prev) {
        byUser.set(user.id, { user, isAdmin });
      } else {
        byUser.set(user.id, { user, isAdmin: prev.isAdmin || isAdmin });
      }
    }
  }
  return [...byUser.values()].map(({ user, isAdmin }) => ({
    user,
    orgRole: isAdmin ? "admin" : "member"
  })).sort((a, b) => a.user.id - b.user.id);
}
function orgRoleForUser2(gh, orgId, userId) {
  const row = listOrgMembersDeduped2(gh, orgId).find((r) => r.user.id === userId);
  return row?.orgRole ?? null;
}
function assertOrgAdmin(gh, authUser, org) {
  if (!authUser) throw unauthorized();
  const user = getActorUser(gh, authUser);
  if (!user) throw unauthorized();
  if (orgRoleForUser2(gh, org.id, user.id) === "admin") return;
  throw forbidden();
}
function getOrgByLogin2(gh, login) {
  return gh.orgs.findOneBy("login", login);
}
function pathPrefixForWebhook(wh, ownerPath) {
  return wh.repo_id != null ? `repos/${ownerPath}` : `orgs/${ownerPath}`;
}
function findRepoHook(gh, repoId, hookId) {
  const wh = gh.webhooks.get(hookId);
  if (!wh || wh.repo_id !== repoId) return void 0;
  return wh;
}
function findOrgHook(gh, orgId, hookId) {
  const wh = gh.webhooks.get(hookId);
  if (!wh || wh.org_id !== orgId) return void 0;
  return wh;
}
function webhooksForRepo(gh, repoId) {
  return gh.webhooks.findBy("repo_id", repoId).filter((w) => w.repo_id === repoId);
}
function webhooksForOrg(gh, orgId) {
  return gh.webhooks.findBy("org_id", orgId).filter((w) => w.org_id === orgId);
}
function normalizeInsecureSsl(v) {
  if (v === true) return "1";
  if (v === false) return "0";
  if (typeof v === "string" && (v === "0" || v === "1")) return v;
  return "0";
}
function parseHookConfig(raw, existing) {
  if (raw === void 0 && existing) return existing;
  if (!raw || typeof raw !== "object") return null;
  const o = raw;
  const urlRaw = typeof o.url === "string" ? o.url.trim() : "";
  const url = urlRaw || existing?.url || "";
  if (!url) return null;
  const content_type = typeof o.content_type === "string" && o.content_type ? o.content_type : existing?.content_type ?? "json";
  let secret;
  if (o.secret === null) {
    secret = void 0;
  } else if (typeof o.secret === "string") {
    secret = o.secret;
  } else if (existing?.secret !== void 0) {
    secret = existing.secret;
  }
  const insecure_ssl = normalizeInsecureSsl(
    o.insecure_ssl !== void 0 ? o.insecure_ssl : existing?.insecure_ssl ?? "0"
  );
  return { url, content_type, secret, insecure_ssl };
}
function formatHookDelivery(d, baseUrl, pathPrefix, hookId) {
  return {
    id: d.id,
    guid: `${d.hook_id}-${d.id}-${d.delivered_at}`,
    delivered_at: d.delivered_at,
    redelivery: false,
    duration: d.duration,
    status: d.success ? "OK" : "Failed",
    status_code: d.status_code,
    event: d.event,
    action: d.action ?? null,
    url: `${baseUrl}/${pathPrefix}/hooks/${hookId}/deliveries/${d.id}`
  };
}
function webhooksRoutes({ app, store, webhooks, baseUrl }) {
  const gh = getGitHubStore(store);
  app.get("/repos/:owner/:repo/hooks", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoAdmin(gh, c.get("authUser"), repo);
    let list = webhooksForRepo(gh, repo.id).sort((a, b) => a.id - b.id);
    const { page, per_page } = parsePagination(c);
    const total = list.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    list = list.slice(start, start + per_page);
    const ownerPath = `${owner}/${repoName}`;
    return c.json(list.map((wh) => formatWebhook(wh, baseUrl, ownerPath)));
  });
  app.post("/repos/:owner/:repo/hooks", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoAdmin(gh, c.get("authUser"), repo);
    const body = await parseJsonBody(c);
    const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "web";
    const events = Array.isArray(body.events) ? body.events.filter((e) => typeof e === "string") : ["push"];
    const active = typeof body.active === "boolean" ? body.active : true;
    const config = parseHookConfig(body.config);
    if (!config) throw new ApiError(422, "config.url is required");
    const wh = gh.webhooks.insert({
      repo_id: repo.id,
      org_id: null,
      name,
      active,
      events,
      config,
      last_response: { code: null, status: "unused", message: null }
    });
    webhooks.register({
      id: wh.id,
      url: wh.config.url,
      events: wh.events,
      active: wh.active,
      secret: wh.config.secret,
      owner,
      repo: repo.name
    });
    const ownerPath = `${owner}/${repoName}`;
    return c.json(formatWebhook(wh, baseUrl, ownerPath), 201);
  });
  app.get("/repos/:owner/:repo/hooks/:hook_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const hookId = Number(c.req.param("hook_id"));
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoAdmin(gh, c.get("authUser"), repo);
    if (!Number.isFinite(hookId)) throw notFound();
    const wh = findRepoHook(gh, repo.id, hookId);
    if (!wh) throw notFound();
    const ownerPath = `${owner}/${repoName}`;
    return c.json(formatWebhook(wh, baseUrl, ownerPath));
  });
  app.patch("/repos/:owner/:repo/hooks/:hook_id", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const hookId = Number(c.req.param("hook_id"));
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoAdmin(gh, c.get("authUser"), repo);
    if (!Number.isFinite(hookId)) throw notFound();
    const existing = findRepoHook(gh, repo.id, hookId);
    if (!existing) throw notFound();
    const body = await parseJsonBody(c);
    const name = typeof body.name === "string" ? body.name.trim() : existing.name;
    const events = Array.isArray(body.events) ? body.events.filter((e) => typeof e === "string") : existing.events;
    const active = typeof body.active === "boolean" ? body.active : existing.active;
    const config = body.config !== void 0 ? parseHookConfig(body.config, existing.config) : existing.config;
    if (!config) throw new ApiError(422, "Invalid config");
    const wh = gh.webhooks.update(hookId, { name, active, events, config });
    webhooks.updateSubscription(hookId, {
      url: wh.config.url,
      events: wh.events,
      active: wh.active,
      secret: wh.config.secret
    });
    const ownerPath = `${owner}/${repoName}`;
    return c.json(formatWebhook(wh, baseUrl, ownerPath));
  });
  app.delete("/repos/:owner/:repo/hooks/:hook_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const hookId = Number(c.req.param("hook_id"));
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoAdmin(gh, c.get("authUser"), repo);
    if (!Number.isFinite(hookId)) throw notFound();
    const wh = findRepoHook(gh, repo.id, hookId);
    if (!wh) throw notFound();
    webhooks.unregister(hookId);
    gh.webhooks.delete(hookId);
    return c.body(null, 204);
  });
  app.post("/repos/:owner/:repo/hooks/:hook_id/pings", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const hookId = Number(c.req.param("hook_id"));
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoAdmin(gh, c.get("authUser"), repo);
    if (!Number.isFinite(hookId)) throw notFound();
    const wh = findRepoHook(gh, repo.id, hookId);
    if (!wh) throw notFound();
    const ownerPath = `${owner}/${repoName}`;
    await webhooks.dispatch(
      "ping",
      void 0,
      {
        zen: "Keep it logically awesome.",
        hook_id: wh.id,
        hook: formatWebhook(wh, baseUrl, ownerPath)
      },
      owner,
      repo.name
    );
    return c.body(null, 204);
  });
  app.post("/repos/:owner/:repo/hooks/:hook_id/tests", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const hookId = Number(c.req.param("hook_id"));
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoAdmin(gh, c.get("authUser"), repo);
    if (!Number.isFinite(hookId)) throw notFound();
    const wh = findRepoHook(gh, repo.id, hookId);
    if (!wh) throw notFound();
    const ownerLogin2 = ownerLoginOf(gh, repo);
    const actor = assertAuthenticatedActor(gh, c.get("authUser"));
    const testPayload = {
      ref: "refs/heads/main",
      before: "0000000000000000000000000000000000000000",
      after: "0000000000000000000000000000000000000000",
      repository: formatRepo(repo, gh, baseUrl),
      pusher: actor ? formatUser(actor, baseUrl) : null,
      sender: actor ? formatUser(actor, baseUrl) : null
    };
    await webhooks.dispatch("push", void 0, testPayload, ownerLogin2, repo.name);
    return c.body(null, 204);
  });
  app.get("/repos/:owner/:repo/hooks/:hook_id/deliveries", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const hookId = Number(c.req.param("hook_id"));
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoAdmin(gh, c.get("authUser"), repo);
    if (!Number.isFinite(hookId)) throw notFound();
    const wh = findRepoHook(gh, repo.id, hookId);
    if (!wh) throw notFound();
    const { page, per_page } = parsePagination(c);
    let list = webhooks.getDeliveries(wh.id).sort((a, b) => b.id - a.id);
    const total = list.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    list = list.slice(start, start + per_page);
    const pp = pathPrefixForWebhook(wh, `${owner}/${repoName}`);
    return c.json(list.map((d) => formatHookDelivery(d, baseUrl, pp, wh.id)));
  });
  app.get("/repos/:owner/:repo/hooks/:hook_id/deliveries/:delivery_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const hookId = Number(c.req.param("hook_id"));
    const deliveryId = Number(c.req.param("delivery_id"));
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoAdmin(gh, c.get("authUser"), repo);
    if (!Number.isFinite(hookId) || !Number.isFinite(deliveryId)) throw notFound();
    const wh = findRepoHook(gh, repo.id, hookId);
    if (!wh) throw notFound();
    const d = webhooks.getDeliveries(wh.id).find((x) => x.id === deliveryId);
    if (!d) throw notFound();
    const pp = pathPrefixForWebhook(wh, `${owner}/${repoName}`);
    return c.json(formatHookDelivery(d, baseUrl, pp, wh.id));
  });
  app.get("/orgs/:org/hooks", (c) => {
    const orgLogin = c.req.param("org");
    const org = getOrgByLogin2(gh, orgLogin);
    if (!org) throw notFound();
    assertOrgAdmin(gh, c.get("authUser"), org);
    let list = webhooksForOrg(gh, org.id).sort((a, b) => a.id - b.id);
    const { page, per_page } = parsePagination(c);
    const total = list.length;
    setLinkHeader(c, total, page, per_page);
    const start = (page - 1) * per_page;
    list = list.slice(start, start + per_page);
    return c.json(list.map((wh) => formatWebhook(wh, baseUrl, org.login)));
  });
  app.post("/orgs/:org/hooks", async (c) => {
    const orgLogin = c.req.param("org");
    const org = getOrgByLogin2(gh, orgLogin);
    if (!org) throw notFound();
    assertOrgAdmin(gh, c.get("authUser"), org);
    const body = await parseJsonBody(c);
    const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "web";
    const events = Array.isArray(body.events) ? body.events.filter((e) => typeof e === "string") : ["push"];
    const active = typeof body.active === "boolean" ? body.active : true;
    const config = parseHookConfig(body.config);
    if (!config) throw new ApiError(422, "config.url is required");
    const wh = gh.webhooks.insert({
      repo_id: null,
      org_id: org.id,
      name,
      active,
      events,
      config,
      last_response: { code: null, status: "unused", message: null }
    });
    webhooks.register({
      id: wh.id,
      url: wh.config.url,
      events: wh.events,
      active: wh.active,
      secret: wh.config.secret,
      owner: org.login,
      repo: void 0
    });
    return c.json(formatWebhook(wh, baseUrl, org.login), 201);
  });
  app.get("/orgs/:org/hooks/:hook_id", (c) => {
    const orgLogin = c.req.param("org");
    const hookId = Number(c.req.param("hook_id"));
    const org = getOrgByLogin2(gh, orgLogin);
    if (!org) throw notFound();
    assertOrgAdmin(gh, c.get("authUser"), org);
    if (!Number.isFinite(hookId)) throw notFound();
    const wh = findOrgHook(gh, org.id, hookId);
    if (!wh) throw notFound();
    return c.json(formatWebhook(wh, baseUrl, org.login));
  });
  app.patch("/orgs/:org/hooks/:hook_id", async (c) => {
    const orgLogin = c.req.param("org");
    const hookId = Number(c.req.param("hook_id"));
    const org = getOrgByLogin2(gh, orgLogin);
    if (!org) throw notFound();
    assertOrgAdmin(gh, c.get("authUser"), org);
    if (!Number.isFinite(hookId)) throw notFound();
    const existing = findOrgHook(gh, org.id, hookId);
    if (!existing) throw notFound();
    const body = await parseJsonBody(c);
    const name = typeof body.name === "string" ? body.name.trim() : existing.name;
    const events = Array.isArray(body.events) ? body.events.filter((e) => typeof e === "string") : existing.events;
    const active = typeof body.active === "boolean" ? body.active : existing.active;
    const config = body.config !== void 0 ? parseHookConfig(body.config, existing.config) : existing.config;
    if (!config) throw new ApiError(422, "Invalid config");
    const wh = gh.webhooks.update(hookId, { name, active, events, config });
    webhooks.updateSubscription(hookId, {
      url: wh.config.url,
      events: wh.events,
      active: wh.active,
      secret: wh.config.secret
    });
    return c.json(formatWebhook(wh, baseUrl, org.login));
  });
  app.delete("/orgs/:org/hooks/:hook_id", (c) => {
    const orgLogin = c.req.param("org");
    const hookId = Number(c.req.param("hook_id"));
    const org = getOrgByLogin2(gh, orgLogin);
    if (!org) throw notFound();
    assertOrgAdmin(gh, c.get("authUser"), org);
    if (!Number.isFinite(hookId)) throw notFound();
    const wh = findOrgHook(gh, org.id, hookId);
    if (!wh) throw notFound();
    webhooks.unregister(hookId);
    gh.webhooks.delete(hookId);
    return c.body(null, 204);
  });
  app.post("/orgs/:org/hooks/:hook_id/pings", async (c) => {
    const orgLogin = c.req.param("org");
    const hookId = Number(c.req.param("hook_id"));
    const org = getOrgByLogin2(gh, orgLogin);
    if (!org) throw notFound();
    assertOrgAdmin(gh, c.get("authUser"), org);
    if (!Number.isFinite(hookId)) throw notFound();
    const wh = findOrgHook(gh, org.id, hookId);
    if (!wh) throw notFound();
    await webhooks.dispatch(
      "ping",
      void 0,
      {
        zen: "Keep it logically awesome.",
        hook_id: wh.id,
        hook: formatWebhook(wh, baseUrl, org.login)
      },
      org.login,
      void 0
    );
    return c.body(null, 204);
  });
}
function tokenizeSearchQuery(q) {
  const tokens = [];
  let i = 0;
  let buf = "";
  let quote = null;
  while (i < q.length) {
    const c = q[i];
    if (quote) {
      if (c === quote) {
        quote = null;
        i++;
        continue;
      }
      buf += c;
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      i++;
      continue;
    }
    if (c === " " || c === "	" || c === "\n" || c === "\r") {
      if (buf.length) {
        tokens.push(buf);
        buf = "";
      }
      i++;
      continue;
    }
    buf += c;
    i++;
  }
  if (buf.length) tokens.push(buf);
  return tokens;
}
function parseRangeToken(raw) {
  const range = /^(\d+)\.\.(\d+)$/.exec(raw);
  if (range) {
    return { op: "..", value: `${range[1]}..${range[2]}` };
  }
  const cmp = /^(>=|<=|>|<)(\d+)$/.exec(raw);
  if (cmp) {
    return { op: cmp[1], value: parseInt(cmp[2], 10) };
  }
  if (/^\d+$/.test(raw)) {
    return { op: "=", value: parseInt(raw, 10) };
  }
  return null;
}
function parseSearchQuery(q) {
  const qualifiers = /* @__PURE__ */ new Map();
  const negations = /* @__PURE__ */ new Map();
  const ranges = /* @__PURE__ */ new Map();
  const textParts = [];
  for (const rawTok of tokenizeSearchQuery(q.trim())) {
    let neg = false;
    let tok = rawTok;
    if (tok.startsWith("-") && tok.includes(":") && tok.length > 1) {
      neg = true;
      tok = tok.slice(1);
    }
    const colon = tok.indexOf(":");
    if (colon <= 0) {
      textParts.push(rawTok);
      continue;
    }
    const key = tok.slice(0, colon).toLowerCase();
    const rawVal = tok.slice(colon + 1);
    if (!rawVal.length) {
      textParts.push(rawTok);
      continue;
    }
    const rangePred = parseRangeToken(rawVal);
    const isRangeKey = key === "stars" || key === "forks" || key === "repos" || key === "followers" || key === "comments" || key === "size";
    if (rangePred && (rangePred.op !== "=" || isRangeKey)) {
      if (neg) {
        if (!negations.has(key)) negations.set(key, []);
        negations.get(key).push(rawVal);
      } else {
        if (!ranges.has(key)) ranges.set(key, []);
        ranges.get(key).push(rangePred);
      }
      continue;
    }
    if (neg) {
      if (!negations.has(key)) negations.set(key, []);
      negations.get(key).push(rawVal);
    } else {
      if (!qualifiers.has(key)) qualifiers.set(key, []);
      qualifiers.get(key).push(rawVal);
    }
  }
  return {
    text: textParts.join(" ").trim(),
    qualifiers,
    negations,
    ranges
  };
}
function textMatches(haystack, needle) {
  if (!needle.trim()) return true;
  return haystack.toLowerCase().includes(needle.toLowerCase());
}
function repoVisibleForSearch(repo, gh, authUser) {
  return canAccessRepo(gh, authUser, repo);
}
function ownerLogin(gh, repo) {
  if (repo.owner_type === "User") {
    return gh.users.get(repo.owner_id)?.login ?? "";
  }
  return gh.orgs.get(repo.owner_id)?.login ?? "";
}
function matchesNumericPredicate(actual, preds, equalsFromQualifiers) {
  for (const e of equalsFromQualifiers) {
    if (/^\d+$/.test(e) && actual !== parseInt(e, 10)) return false;
  }
  for (const p of preds) {
    if (p.op === "..") {
      const m = /^(\d+)\.\.(\d+)$/.exec(String(p.value));
      if (m) {
        const lo = parseInt(m[1], 10);
        const hi = parseInt(m[2], 10);
        if (actual < lo || actual > hi) return false;
      }
    } else if (p.op === ">") {
      if (!(actual > Number(p.value))) return false;
    } else if (p.op === "<") {
      if (!(actual < Number(p.value))) return false;
    } else if (p.op === ">=") {
      if (!(actual >= Number(p.value))) return false;
    } else if (p.op === "<=") {
      if (!(actual <= Number(p.value))) return false;
    } else if (p.op === "=") {
      if (actual !== Number(p.value)) return false;
    }
  }
  return true;
}
function filterRepos(gh, repos, parsed, authUser) {
  const qUser = parsed.qualifiers.get("user")?.[0];
  const qOrg = parsed.qualifiers.get("org")?.[0];
  const negUser = parsed.negations.get("user") ?? [];
  const negOrg = parsed.negations.get("org") ?? [];
  const inScopes = parsed.qualifiers.get("in") ?? [];
  const negIn = parsed.negations.get("in") ?? [];
  return repos.filter((repo) => {
    if (!repoVisibleForSearch(repo, gh, authUser)) return false;
    const ologin = ownerLogin(gh, repo);
    if (qUser && ologin.toLowerCase() !== qUser.toLowerCase()) return false;
    if (qOrg && ologin.toLowerCase() !== qOrg.toLowerCase()) return false;
    if (repo.owner_type === "User" && negUser.some((n) => ologin.toLowerCase() === n.toLowerCase())) {
      return false;
    }
    if (repo.owner_type === "Organization" && negOrg.some((n) => ologin.toLowerCase() === n.toLowerCase())) {
      return false;
    }
    for (const lang of parsed.qualifiers.get("language") ?? []) {
      if (!repo.language || repo.language.toLowerCase() !== lang.toLowerCase()) return false;
    }
    for (const lang of parsed.negations.get("language") ?? []) {
      if (repo.language && repo.language.toLowerCase() === lang.toLowerCase()) return false;
    }
    for (const topic of parsed.qualifiers.get("topic") ?? []) {
      if (!repo.topics.some((t) => t.toLowerCase() === topic.toLowerCase())) return false;
    }
    for (const topic of parsed.negations.get("topic") ?? []) {
      if (repo.topics.some((t) => t.toLowerCase() === topic.toLowerCase())) return false;
    }
    const starRanges = parsed.ranges.get("stars") ?? [];
    const starEq = parsed.qualifiers.get("stars") ?? [];
    if (!matchesNumericPredicate(repo.stargazers_count, starRanges, starEq)) return false;
    for (const nv of parsed.negations.get("stars") ?? []) {
      const r = parseRangeToken(nv);
      if (r) {
        if (matchesNumericPredicate(repo.stargazers_count, [r], [])) return false;
      } else if (/^\d+$/.test(nv) && repo.stargazers_count === parseInt(nv, 10)) {
        return false;
      }
    }
    const forkRanges = parsed.ranges.get("forks") ?? [];
    const forkEq = parsed.qualifiers.get("forks") ?? [];
    if (!matchesNumericPredicate(repo.forks_count, forkRanges, forkEq)) return false;
    const negForkVals = parsed.negations.get("forks") ?? [];
    if (negForkVals.length) {
      const negPreds = negForkVals.flatMap((s) => {
        const r = parseRangeToken(s);
        return r ? [r] : [];
      });
      const negEq = negForkVals.filter((s) => /^\d+$/.test(s));
      if (matchesNumericPredicate(repo.forks_count, negPreds, negEq)) return false;
    }
    for (const a of parsed.qualifiers.get("archived") ?? []) {
      const want = a === "true";
      if (repo.archived !== want) return false;
    }
    for (const a of parsed.negations.get("archived") ?? []) {
      const want = a === "true";
      if (repo.archived === want) return false;
    }
    const isVals = parsed.qualifiers.get("is") ?? [];
    for (const is of isVals) {
      if (is === "public" && repo.private) return false;
      if (is === "private" && !repo.private) return false;
    }
    for (const is of parsed.negations.get("is") ?? []) {
      if (is === "public" && !repo.private) return false;
      if (is === "private" && repo.private) return false;
    }
    for (const f of parsed.qualifiers.get("fork") ?? []) {
      const v = f.toLowerCase();
      if (v === "true" && !repo.fork) return false;
      if (v === "false" && repo.fork) return false;
      if (v === "only" && !repo.fork) return false;
    }
    for (const f of parsed.negations.get("fork") ?? []) {
      const v = f.toLowerCase();
      if (v === "true" && repo.fork) return false;
      if (v === "false" && !repo.fork) return false;
      if (v === "only" && repo.fork) return false;
    }
    const searchIn = inScopes.length > 0 ? inScopes.map((s) => s.toLowerCase()) : ["name", "description", "topics"];
    const text = parsed.text;
    if (text.length) {
      const nameMatch = textMatches(repo.name, text);
      const fullMatch = textMatches(repo.full_name, text);
      const descMatch = repo.description ? textMatches(repo.description, text) : false;
      const topicsMatch = repo.topics.some((t) => textMatches(t, text));
      let ok = false;
      if (searchIn.includes("name") && (nameMatch || fullMatch)) ok = true;
      if (searchIn.includes("description") && descMatch) ok = true;
      if (searchIn.includes("topics") && topicsMatch) ok = true;
      if (!ok) return false;
    }
    for (const n of negIn) {
      const scope = n.toLowerCase();
      if (scope === "name" && (textMatches(repo.name, parsed.text) || textMatches(repo.full_name, parsed.text))) {
        return false;
      }
      if (scope === "description" && repo.description && textMatches(repo.description, parsed.text)) {
        return false;
      }
      if (scope === "topics" && repo.topics.some((t) => textMatches(t, parsed.text))) {
        return false;
      }
    }
    return true;
  });
}
function repoRelevance(repo, parsed) {
  const t = parsed.text.trim().toLowerCase();
  if (!t) return 1;
  let score = 0;
  if (repo.name.toLowerCase().includes(t)) score += 5;
  if (repo.full_name.toLowerCase().includes(t)) score += 4;
  if (repo.description?.toLowerCase().includes(t)) score += 2;
  if (repo.topics.some((x) => x.toLowerCase().includes(t))) score += 1;
  return score;
}
function resolveRepoQualifier(gh, spec) {
  const trimmed = spec.trim();
  if (!trimmed.includes("/")) return null;
  return lookupRepo(gh, trimmed.split("/")[0], trimmed.split("/")[1]) ?? null;
}
function issuePrMatchesFilters(gh, parsed, repo, issue, pr) {
  const repoSpecs = parsed.qualifiers.get("repo") ?? [];
  for (const rs of repoSpecs) {
    const r = resolveRepoQualifier(gh, rs);
    if (!r || r.id !== repo.id) return false;
  }
  for (const rs of parsed.negations.get("repo") ?? []) {
    const r = resolveRepoQualifier(gh, rs);
    if (r && r.id === repo.id) return false;
  }
  const isVals = [...parsed.qualifiers.get("is") ?? [], ...parsed.qualifiers.get("type") ?? []].map(
    (x) => x.toLowerCase()
  );
  const negIs = [...parsed.negations.get("is") ?? [], ...parsed.negations.get("type") ?? []].map(
    (x) => x.toLowerCase()
  );
  const isPr = pr !== null || issue?.is_pull_request === true;
  if (isVals.includes("issue") && isPr) return false;
  if (isVals.includes("pr") && !isPr) return false;
  if (negIs.includes("issue") && !isPr) return false;
  if (negIs.includes("pr") && isPr) return false;
  const stateVals = parsed.qualifiers.get("state") ?? [];
  for (const s of stateVals) {
    const sl = s.toLowerCase();
    if (isPr && pr) {
      if (sl === "open" && pr.state !== "open") return false;
      if (sl === "closed" && pr.state !== "closed") return false;
    } else if (issue) {
      if (sl === "open" && issue.state !== "open") return false;
      if (sl === "closed" && issue.state !== "closed") return false;
    }
  }
  for (const iv of isVals) {
    if (iv === "open") {
      if (isPr && pr && pr.state !== "open") return false;
      if (!isPr && issue && issue.state !== "open") return false;
    }
    if (iv === "closed") {
      if (isPr && pr && pr.state !== "closed") return false;
      if (!isPr && issue && issue.state !== "closed") return false;
    }
    if (iv === "merged") {
      if (!isPr || !pr || !pr.merged) return false;
    }
    if (iv === "draft") {
      if (!isPr || !pr || !pr.draft) return false;
    }
  }
  for (const iv of negIs) {
    if (iv === "open") {
      if (isPr && pr && pr.state === "open") return false;
      if (!isPr && issue && issue.state === "open") return false;
    }
    if (iv === "closed") {
      if (isPr && pr && pr.state === "closed") return false;
      if (!isPr && issue && issue.state === "closed") return false;
    }
    if (iv === "merged") {
      if (isPr && pr && pr.merged) return false;
    }
    if (iv === "draft") {
      if (isPr && pr && pr.draft) return false;
    }
  }
  const authors = parsed.qualifiers.get("author") ?? [];
  for (const a of authors) {
    const u = gh.users.findOneBy("login", a);
    const uid = u?.id;
    if (isPr && pr) {
      if (!uid || pr.user_id !== uid) return false;
    } else if (issue) {
      if (!uid || issue.user_id !== uid) return false;
    }
  }
  for (const a of parsed.negations.get("author") ?? []) {
    const u = gh.users.findOneBy("login", a);
    const uid = u?.id;
    if (isPr && pr && uid !== void 0 && pr.user_id === uid) return false;
    if (!isPr && issue && uid !== void 0 && issue.user_id === uid) return false;
  }
  const assignees = parsed.qualifiers.get("assignee") ?? [];
  for (const a of assignees) {
    const u = gh.users.findOneBy("login", a);
    const uid = u?.id;
    if (!uid) return false;
    const ids = isPr && pr ? pr.assignee_ids : issue?.assignee_ids ?? [];
    if (!ids.includes(uid)) return false;
  }
  for (const a of parsed.negations.get("assignee") ?? []) {
    const u = gh.users.findOneBy("login", a);
    const uid = u?.id;
    if (uid === void 0) continue;
    const ids = isPr && pr ? pr.assignee_ids : issue?.assignee_ids ?? [];
    if (ids.includes(uid)) return false;
  }
  const labels = parsed.qualifiers.get("label") ?? [];
  for (const lb of labels) {
    const labelIds = isPr && pr ? pr.label_ids : issue?.label_ids ?? [];
    const names = labelIds.map((id) => gh.labels.get(id)).filter(Boolean).map((l) => l.name.toLowerCase());
    if (!names.includes(lb.toLowerCase())) return false;
  }
  for (const lb of parsed.negations.get("label") ?? []) {
    const labelIds = isPr && pr ? pr.label_ids : issue?.label_ids ?? [];
    const names = labelIds.map((id) => gh.labels.get(id)).filter(Boolean).map((l) => l.name.toLowerCase());
    if (names.includes(lb.toLowerCase())) return false;
  }
  const milestones = parsed.qualifiers.get("milestone") ?? [];
  for (const ms of milestones) {
    const mid = isPr && pr ? pr.milestone_id : issue?.milestone_id;
    const m = mid ? gh.milestones.get(mid) : null;
    if (!m || m.title.toLowerCase() !== ms.toLowerCase()) return false;
  }
  for (const ms of parsed.negations.get("milestone") ?? []) {
    const mid = isPr && pr ? pr.milestone_id : issue?.milestone_id;
    const m = mid ? gh.milestones.get(mid) : null;
    if (m && m.title.toLowerCase() === ms.toLowerCase()) return false;
  }
  const commentRanges = parsed.ranges.get("comments") ?? [];
  const commentEq = parsed.qualifiers.get("comments") ?? [];
  const n = isPr && pr ? pr.comments : issue?.comments ?? 0;
  if (!matchesNumericPredicate(n, commentRanges, commentEq)) return false;
  for (const nv of parsed.negations.get("comments") ?? []) {
    const r = parseRangeToken(nv);
    if (r) {
      if (matchesNumericPredicate(n, [r], [])) return false;
    } else if (/^\d+$/.test(nv) && n === parseInt(nv, 10)) return false;
  }
  const text = parsed.text.trim();
  if (text.length) {
    const title = isPr && pr ? pr.title : issue?.title ?? "";
    const body = isPr && pr ? pr.body ?? "" : issue?.body ?? "";
    if (!textMatches(title, text) && !textMatches(body, text)) return false;
  }
  return true;
}
function userMatchesSearch(gh, u, parsed) {
  const types = parsed.qualifiers.get("type") ?? [];
  if (types.length && !types.map((t) => t.toLowerCase()).includes("user")) return false;
  for (const t of parsed.negations.get("type") ?? []) {
    if (t.toLowerCase() === "user") return false;
  }
  const inScopes = parsed.qualifiers.get("in") ?? [];
  const searchIn = inScopes.length > 0 ? inScopes.map((s) => s.toLowerCase()) : ["login", "email", "fullname"];
  const text = parsed.text.trim();
  if (text.length) {
    let ok = false;
    if (searchIn.includes("login") && textMatches(u.login, text)) ok = true;
    if (searchIn.includes("email") && u.email && textMatches(u.email, text)) ok = true;
    if (searchIn.includes("fullname") && u.name && textMatches(u.name, text)) ok = true;
    if (!ok) return false;
  }
  const rpred = parsed.ranges.get("repos") ?? [];
  const req = parsed.qualifiers.get("repos") ?? [];
  if (!matchesNumericPredicate(u.public_repos, rpred, req)) return false;
  for (const nv of parsed.negations.get("repos") ?? []) {
    const r = parseRangeToken(nv);
    if (r) {
      if (matchesNumericPredicate(u.public_repos, [r], [])) return false;
    } else if (/^\d+$/.test(nv) && u.public_repos === parseInt(nv, 10)) return false;
  }
  const fpred = parsed.ranges.get("followers") ?? [];
  const feq = parsed.qualifiers.get("followers") ?? [];
  if (!matchesNumericPredicate(u.followers, fpred, feq)) return false;
  for (const nv of parsed.negations.get("followers") ?? []) {
    const r = parseRangeToken(nv);
    if (r) {
      if (matchesNumericPredicate(u.followers, [r], [])) return false;
    } else if (/^\d+$/.test(nv) && u.followers === parseInt(nv, 10)) return false;
  }
  return true;
}
function orgMatchesSearch(gh, o, parsed) {
  void gh;
  const types = parsed.qualifiers.get("type") ?? [];
  if (types.length && !types.map((t) => t.toLowerCase()).includes("org")) return false;
  for (const t of parsed.negations.get("type") ?? []) {
    if (t.toLowerCase() === "org") return false;
  }
  const inScopes = parsed.qualifiers.get("in") ?? [];
  const searchIn = inScopes.length > 0 ? inScopes.map((s) => s.toLowerCase()) : ["login", "email", "fullname"];
  const text = parsed.text.trim();
  if (text.length) {
    let ok = false;
    if (searchIn.includes("login") && textMatches(o.login, text)) ok = true;
    if (searchIn.includes("email") && o.email && textMatches(o.email, text)) ok = true;
    if (searchIn.includes("fullname") && o.name && textMatches(o.name, text)) ok = true;
    if (!ok) return false;
  }
  const rpred = parsed.ranges.get("repos") ?? [];
  const req = parsed.qualifiers.get("repos") ?? [];
  if (!matchesNumericPredicate(o.public_repos, rpred, req)) return false;
  for (const nv of parsed.negations.get("repos") ?? []) {
    const r = parseRangeToken(nv);
    if (r) {
      if (matchesNumericPredicate(o.public_repos, [r], [])) return false;
    } else if (/^\d+$/.test(nv) && o.public_repos === parseInt(nv, 10)) return false;
  }
  const fpred = parsed.ranges.get("followers") ?? [];
  const feq = parsed.qualifiers.get("followers") ?? [];
  if (!matchesNumericPredicate(o.followers, fpred, feq)) return false;
  for (const nv of parsed.negations.get("followers") ?? []) {
    const r = parseRangeToken(nv);
    if (r) {
      if (matchesNumericPredicate(o.followers, [r], [])) return false;
    } else if (/^\d+$/.test(nv) && o.followers === parseInt(nv, 10)) return false;
  }
  return true;
}
function blobText2(blob) {
  if (blob.encoding === "base64") {
    try {
      return Buffer.from(blob.content, "base64").toString("utf8");
    } catch {
      return "";
    }
  }
  return blob.content;
}
function formatSearchCommit(gh, commit, repo, baseUrl) {
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  const author = resolveCommitUser(gh, commit.author_email);
  const committer = resolveCommitUser(gh, commit.committer_email);
  return {
    sha: commit.sha,
    node_id: commit.node_id,
    url: `${repoUrl}/commits/${commit.sha}`,
    html_url: `${baseUrl}/${repo.full_name}/commit/${commit.sha}`,
    comments_url: `${repoUrl}/comments/${commit.sha}`,
    repository: formatRepo(repo, gh, baseUrl),
    commit: {
      url: `${repoUrl}/git/commits/${commit.sha}`,
      author: {
        name: commit.author_name,
        email: commit.author_email,
        date: commit.author_date
      },
      committer: {
        name: commit.committer_name,
        email: commit.committer_email,
        date: commit.committer_date
      },
      message: commit.message
    },
    author: author ? formatUser(author, baseUrl) : null,
    committer: committer ? formatUser(committer, baseUrl) : null,
    parents: commit.parent_shas.map((sha) => ({
      sha,
      url: `${repoUrl}/commits/${sha}`
    }))
  };
}
function loginMatchesCommitAuthor(gh, login, commit, role) {
  const email = role === "author" ? commit.author_email : commit.committer_email;
  return commitIdentityMatches(gh, email, login);
}
function searchRoutes({ app, store, baseUrl }) {
  const gh = getGitHubStore(store);
  app.get("/search/repositories", (c) => {
    const q = c.req.query("q");
    if (q === void 0 || q.trim() === "") {
      throw new ApiError(422, "Validation Failed");
    }
    const parsed = parseSearchQuery(q);
    const { page, per_page } = parsePagination(c);
    const sortRaw = (c.req.query("sort") ?? "best-match").toLowerCase();
    const order = (c.req.query("order") ?? "desc").toLowerCase() === "asc" ? "asc" : "desc";
    const authUser = c.get("authUser");
    let list = gh.repos.all().filter((r) => repoVisibleForSearch(r, gh, authUser));
    list = filterRepos(gh, list, parsed, authUser);
    if (sortRaw === "stars") {
      list.sort(
        (a, b) => order === "desc" ? b.stargazers_count - a.stargazers_count : a.stargazers_count - b.stargazers_count
      );
    } else if (sortRaw === "forks") {
      list.sort((a, b) => order === "desc" ? b.forks_count - a.forks_count : a.forks_count - b.forks_count);
    } else if (sortRaw === "updated") {
      list.sort(
        (a, b) => order === "desc" ? b.updated_at.localeCompare(a.updated_at) : a.updated_at.localeCompare(b.updated_at)
      );
    } else {
      list.sort((a, b) => repoRelevance(b, parsed) - repoRelevance(a, parsed));
    }
    const total = list.length;
    const slice = list.slice((page - 1) * per_page, (page - 1) * per_page + per_page);
    setLinkHeader(c, total, page, per_page);
    return c.json({
      total_count: total,
      incomplete_results: false,
      items: slice.map((r) => formatRepo(r, gh, baseUrl))
    });
  });
  app.get("/search/issues", (c) => {
    const q = c.req.query("q");
    if (q === void 0 || q.trim() === "") {
      throw new ApiError(422, "Validation Failed");
    }
    const parsed = parseSearchQuery(q);
    const { page, per_page } = parsePagination(c);
    const sortRaw = (c.req.query("sort") ?? "best-match").toLowerCase();
    const order = (c.req.query("order") ?? "desc").toLowerCase() === "asc" ? "asc" : "desc";
    const authUser = c.get("authUser");
    const hits = [];
    for (const issue of gh.issues.all()) {
      const repo = gh.repos.get(issue.repo_id);
      if (!repo) continue;
      if (!repoVisibleForSearch(repo, gh, authUser)) continue;
      if (issue.is_pull_request) {
        const pr = gh.pullRequests.findBy("repo_id", issue.repo_id).find((p) => p.number === issue.number);
        if (!pr) continue;
        if (!issuePrMatchesFilters(gh, parsed, repo, issue, pr)) continue;
        hits.push({ kind: "pr", pr });
      } else {
        if (!issuePrMatchesFilters(gh, parsed, repo, issue, null)) continue;
        hits.push({ kind: "issue", issue });
      }
    }
    function relevance(h) {
      const title = h.kind === "issue" ? h.issue.title : h.pr.title;
      const body = h.kind === "issue" ? h.issue.body ?? "" : h.pr.body ?? "";
      const t = parsed.text.trim().toLowerCase();
      if (!t) return 1;
      let s = 0;
      if (title.toLowerCase().includes(t)) s += 3;
      if (body.toLowerCase().includes(t)) s += 1;
      return s;
    }
    const sorted = [...hits];
    if (sortRaw === "created") {
      sorted.sort((a, b) => {
        const ca = a.kind === "issue" ? a.issue.created_at : a.pr.created_at;
        const cb = b.kind === "issue" ? b.issue.created_at : b.pr.created_at;
        const cmp = ca.localeCompare(cb);
        return order === "desc" ? -cmp : cmp;
      });
    } else if (sortRaw === "updated") {
      sorted.sort((a, b) => {
        const ca = a.kind === "issue" ? a.issue.updated_at : a.pr.updated_at;
        const cb = b.kind === "issue" ? b.issue.updated_at : b.pr.updated_at;
        const cmp = ca.localeCompare(cb);
        return order === "desc" ? -cmp : cmp;
      });
    } else if (sortRaw === "comments") {
      sorted.sort((a, b) => {
        const ca = a.kind === "issue" ? a.issue.comments : a.pr.comments;
        const cb = b.kind === "issue" ? b.issue.comments : b.pr.comments;
        return order === "desc" ? cb - ca : ca - cb;
      });
    } else {
      sorted.sort((a, b) => relevance(b) - relevance(a));
    }
    const total = sorted.length;
    const slice = sorted.slice((page - 1) * per_page, (page - 1) * per_page + per_page);
    setLinkHeader(c, total, page, per_page);
    const items = slice.map((h) => {
      if (h.kind === "issue") {
        return formatIssue(h.issue, gh, baseUrl);
      }
      return formatPullRequest(h.pr, gh, baseUrl);
    });
    return c.json({
      total_count: total,
      incomplete_results: false,
      items: items.filter(Boolean)
    });
  });
  app.get("/search/users", (c) => {
    const q = c.req.query("q");
    if (q === void 0 || q.trim() === "") {
      throw new ApiError(422, "Validation Failed");
    }
    const parsed = parseSearchQuery(q);
    const { page, per_page } = parsePagination(c);
    const sortRaw = (c.req.query("sort") ?? "best-match").toLowerCase();
    const order = (c.req.query("order") ?? "desc").toLowerCase() === "asc" ? "asc" : "desc";
    const hits = [];
    const typeFilters = parsed.qualifiers.get("type")?.map((t) => t.toLowerCase()) ?? [];
    if (!typeFilters.length || typeFilters.includes("user")) {
      for (const u of gh.users.all()) {
        if (u.type === "Organization") continue;
        if (userMatchesSearch(gh, u, parsed)) hits.push({ kind: "user", u });
      }
    }
    if (!typeFilters.length || typeFilters.includes("org")) {
      for (const o of gh.orgs.all()) {
        if (orgMatchesSearch(gh, o, parsed)) hits.push({ kind: "org", o });
      }
    }
    function rel(h) {
      const text = parsed.text.trim().toLowerCase();
      if (!text) return 1;
      if (h.kind === "user") {
        let s2 = 0;
        if (h.u.login.toLowerCase().includes(text)) s2 += 3;
        if (h.u.name?.toLowerCase().includes(text)) s2 += 1;
        return s2;
      }
      let s = 0;
      if (h.o.login.toLowerCase().includes(text)) s += 3;
      if (h.o.name?.toLowerCase().includes(text)) s += 1;
      return s;
    }
    const list = [...hits];
    if (sortRaw === "followers") {
      list.sort((a, b) => {
        const fa = a.kind === "user" ? a.u.followers : a.o.followers;
        const fb = b.kind === "user" ? b.u.followers : b.o.followers;
        return order === "desc" ? fb - fa : fa - fb;
      });
    } else if (sortRaw === "repositories") {
      list.sort((a, b) => {
        const ra = a.kind === "user" ? a.u.public_repos : a.o.public_repos;
        const rb = b.kind === "user" ? b.u.public_repos : b.o.public_repos;
        return order === "desc" ? rb - ra : ra - rb;
      });
    } else if (sortRaw === "joined") {
      list.sort((a, b) => {
        const ca = a.kind === "user" ? a.u.created_at : a.o.created_at;
        const cb = b.kind === "user" ? b.u.created_at : b.o.created_at;
        const cmp = ca.localeCompare(cb);
        return order === "desc" ? -cmp : cmp;
      });
    } else {
      list.sort((a, b) => rel(b) - rel(a));
    }
    const total = list.length;
    const slice = list.slice((page - 1) * per_page, (page - 1) * per_page + per_page);
    setLinkHeader(c, total, page, per_page);
    const items = slice.map((h) => h.kind === "user" ? formatUser(h.u, baseUrl) : formatOrgBrief(h.o, baseUrl));
    return c.json({
      total_count: total,
      incomplete_results: false,
      items
    });
  });
  app.get("/search/code", (c) => {
    const q = c.req.query("q") ?? "";
    const parsed = parseSearchQuery(q);
    const { page, per_page } = parsePagination(c);
    const authUser = c.get("authUser");
    const text = parsed.text.trim();
    const repoSpecs = parsed.qualifiers.get("repo") ?? [];
    const langs = parsed.qualifiers.get("language") ?? [];
    const paths = parsed.qualifiers.get("path") ?? [];
    const filenames = parsed.qualifiers.get("filename") ?? [];
    const inScopes = (parsed.qualifiers.get("in") ?? []).map((x) => x.toLowerCase());
    const matches = [];
    for (const repo of gh.repos.all()) {
      if (!canReadRepoContents(gh, authUser, repo)) continue;
      if (repoSpecs.length) {
        const ok = repoSpecs.some((rs) => {
          const r = resolveRepoQualifier(gh, rs);
          return r && r.id === repo.id;
        });
        if (!ok) continue;
      }
      if (langs.length) {
        const lang = repo.language;
        if (!lang || !langs.some((l) => l.toLowerCase() === lang.toLowerCase())) continue;
      }
      const head2 = resolveBranchToCommit(gh, repo, repo.default_branch);
      if (!head2) continue;
      for (const [path, entry] of flattenTree(gh, repo.id, head2.tree_sha).blobs) {
        const blob = gh.blobs.findBy("repo_id", repo.id).find((candidate) => candidate.sha === entry.sha);
        if (!blob) continue;
        const base = path.split("/").pop() ?? path;
        if (paths.length && !paths.some((p) => path.toLowerCase().includes(p.toLowerCase()))) continue;
        if (filenames.length && !filenames.some((p) => base.toLowerCase().includes(p.toLowerCase()))) continue;
        const content = blobText2(blob);
        if (text.length) {
          const inFile = content.toLowerCase().includes(text.toLowerCase());
          const inPath = path.toLowerCase().includes(text.toLowerCase());
          let hit = false;
          if (!inScopes.length) hit = inFile || inPath;
          else {
            if (inScopes.includes("file") && inFile) hit = true;
            if (inScopes.includes("path") && inPath) hit = true;
          }
          if (!hit) continue;
        }
        matches.push({
          name: path.split("/").pop() ?? blob.sha,
          path,
          sha: blob.sha,
          score: text.length ? content.toLowerCase().includes(text.toLowerCase()) ? 2 : 1 : 1,
          repo
        });
      }
    }
    matches.sort((a, b) => b.score - a.score);
    const total = matches.length;
    const slice = matches.slice((page - 1) * per_page, (page - 1) * per_page + per_page);
    setLinkHeader(c, total, page, per_page);
    const items = slice.map((m) => {
      const repoUrl = `${baseUrl}/repos/${m.repo.full_name}`;
      const encodedPath = encodeContentPath(m.path);
      return {
        name: m.name,
        path: m.path,
        sha: m.sha,
        url: `${repoUrl}/contents/${encodedPath}?ref=HEAD`,
        git_url: `${repoUrl}/git/blobs/${m.sha}`,
        html_url: `${baseUrl}/${m.repo.full_name}/blob/HEAD/${encodedPath}`,
        repository: formatRepo(m.repo, gh, baseUrl),
        score: 1
      };
    });
    return c.json({
      total_count: total,
      incomplete_results: false,
      items
    });
  });
  app.get("/search/commits", (c) => {
    const q = c.req.query("q");
    if (q === void 0 || q.trim() === "") {
      throw new ApiError(422, "Validation Failed");
    }
    const parsed = parseSearchQuery(q);
    const { page, per_page } = parsePagination(c);
    const sortRaw = (c.req.query("sort") ?? "best-match").toLowerCase();
    const order = (c.req.query("order") ?? "desc").toLowerCase() === "asc" ? "asc" : "desc";
    const authUser = c.get("authUser");
    const repoSpecs = parsed.qualifiers.get("repo") ?? [];
    const authors = parsed.qualifiers.get("author") ?? [];
    const committers = parsed.qualifiers.get("committer") ?? [];
    const mergeVals = parsed.qualifiers.get("merge") ?? [];
    let list = [];
    for (const commit of gh.commits.all()) {
      const repo = gh.repos.get(commit.repo_id);
      if (!repo) continue;
      if (!canReadRepoContents(gh, authUser, repo)) continue;
      if (repoSpecs.length) {
        const ok = repoSpecs.some((rs) => {
          const r = resolveRepoQualifier(gh, rs);
          return r && r.id === repo.id;
        });
        if (!ok) continue;
      }
      if (authors.length) {
        const ok = authors.some((a) => loginMatchesCommitAuthor(gh, a, commit, "author"));
        if (!ok) continue;
      }
      if (committers.length) {
        const ok = committers.some((a) => loginMatchesCommitAuthor(gh, a, commit, "committer"));
        if (!ok) continue;
      }
      if (mergeVals.length) {
        const isMerge = commit.parent_shas.length > 1;
        const ok = mergeVals.every((m) => {
          if (m === "true") return isMerge;
          if (m === "false") return !isMerge;
          return true;
        });
        if (!ok) continue;
      }
      const t = parsed.text.trim();
      if (t.length && !textMatches(commit.message, t)) continue;
      list.push(commit);
    }
    function rel(cm) {
      const t = parsed.text.trim().toLowerCase();
      if (!t) return 1;
      return cm.message.toLowerCase().includes(t) ? 2 : 1;
    }
    if (sortRaw === "author-date") {
      list = [...list].sort((a, b) => {
        const cmp = a.author_date.localeCompare(b.author_date);
        return order === "desc" ? -cmp : cmp;
      });
    } else if (sortRaw === "committer-date") {
      list = [...list].sort((a, b) => {
        const cmp = a.committer_date.localeCompare(b.committer_date);
        return order === "desc" ? -cmp : cmp;
      });
    } else {
      list = [...list].sort((a, b) => rel(b) - rel(a));
    }
    const total = list.length;
    const slice = list.slice((page - 1) * per_page, (page - 1) * per_page + per_page);
    setLinkHeader(c, total, page, per_page);
    const items = slice.map((commit) => {
      const repo = gh.repos.get(commit.repo_id);
      return formatSearchCommit(gh, commit, repo, baseUrl);
    });
    return c.json({
      total_count: total,
      incomplete_results: false,
      items
    });
  });
  app.get("/search/topics", (c) => {
    const q = c.req.query("q") ?? "";
    const parsed = parseSearchQuery(q);
    const { page, per_page } = parsePagination(c);
    const text = parsed.text.trim().toLowerCase();
    const topicSet = /* @__PURE__ */ new Map();
    for (const repo of gh.repos.all()) {
      for (const t of repo.topics) {
        const key = t.toLowerCase();
        if (!topicSet.has(key)) {
          topicSet.set(key, { name: t, updated: repo.updated_at });
        } else {
          const cur = topicSet.get(key);
          if (repo.updated_at > cur.updated) topicSet.set(key, { name: t, updated: repo.updated_at });
        }
      }
    }
    let topics = Array.from(topicSet.values());
    if (text.length) {
      topics = topics.filter((t) => t.name.toLowerCase().includes(text));
    }
    topics.sort((a, b) => a.name.localeCompare(b.name));
    const total = topics.length;
    const slice = topics.slice((page - 1) * per_page, (page - 1) * per_page + per_page);
    setLinkHeader(c, total, page, per_page);
    const items = slice.map((t) => ({
      name: t.name,
      display_name: t.name,
      short_description: "",
      created_by: null,
      created_at: t.updated,
      updated_at: t.updated
    }));
    return c.json({
      total_count: total,
      incomplete_results: false,
      items
    });
  });
  app.get("/search/labels", (c) => {
    const q = c.req.query("q") ?? "";
    const rawId = c.req.query("repository_id");
    if (rawId === void 0 || rawId === "") {
      throw new ApiError(422, "Validation Failed: repository_id is required");
    }
    const repositoryId = parseInt(rawId, 10);
    if (Number.isNaN(repositoryId)) {
      throw new ApiError(422, "Validation Failed: invalid repository_id");
    }
    const repo = gh.repos.get(repositoryId);
    if (!repo) {
      throw new ApiError(404, "Not Found");
    }
    const parsed = parseSearchQuery(q);
    const { page, per_page } = parsePagination(c);
    const text = parsed.text.trim().toLowerCase();
    let labels = gh.labels.findBy("repo_id", repositoryId);
    if (text.length) {
      labels = labels.filter(
        (l) => l.name.toLowerCase().includes(text) || l.description && l.description.toLowerCase().includes(text)
      );
    }
    labels.sort((a, b) => a.name.localeCompare(b.name));
    const total = labels.length;
    const slice = labels.slice((page - 1) * per_page, (page - 1) * per_page + per_page);
    setLinkHeader(c, total, page, per_page);
    return c.json({
      total_count: total,
      incomplete_results: false,
      items: slice.map((l) => ({
        id: l.id,
        node_id: l.node_id,
        url: `${baseUrl}/repos/${repo.full_name}/labels/${encodeURIComponent(l.name)}`,
        name: l.name,
        color: l.color,
        default: l.default,
        description: l.description
      }))
    });
  });
}
function listOrgMembersDeduped3(gh, orgId) {
  const byUser = /* @__PURE__ */ new Map();
  for (const team of gh.teams.findBy("org_id", orgId)) {
    for (const m of gh.teamMembers.findBy("team_id", team.id)) {
      const user = gh.users.get(m.user_id);
      if (!user) continue;
      const isAdmin = m.role === "maintainer";
      const prev = byUser.get(user.id);
      if (!prev) {
        byUser.set(user.id, { user, isAdmin });
      } else {
        byUser.set(user.id, { user, isAdmin: prev.isAdmin || isAdmin });
      }
    }
  }
  return [...byUser.values()].map(({ user, isAdmin }) => ({
    user,
    orgRole: isAdmin ? "admin" : "member"
  })).sort((a, b) => a.user.id - b.user.id);
}
function orgRoleForUser3(gh, orgId, userId) {
  const row = listOrgMembersDeduped3(gh, orgId).find((r) => r.user.id === userId);
  return row?.orgRole ?? null;
}
function assertOrgAdmin2(gh, authUser, org) {
  if (!authUser) throw unauthorized();
  const user = getActorUser(gh, authUser);
  if (!user) throw unauthorized();
  if (orgRoleForUser3(gh, org.id, user.id) === "admin") return;
  throw forbidden();
}
function getOrgByLogin3(gh, login) {
  return gh.orgs.findOneBy("login", login);
}
function resolveWorkflow(gh, repoId, param) {
  const trimmed = param.trim();
  const asNum = parseInt(trimmed, 10);
  if (!Number.isNaN(asNum) && String(asNum) === trimmed) {
    const w = gh.workflows.get(asNum);
    if (w && w.repo_id === repoId) return w;
  }
  return gh.workflows.findBy("repo_id", repoId).find((w) => w.path === trimmed || w.path.endsWith(`/${trimmed}`) || w.name === trimmed);
}
function resolveRefToBranchAndSha(gh, repo, ref) {
  const name = ref.replace(/^refs\/heads\//, "").replace(/^refs\/tags\//, "");
  const branch = gh.branches.findBy("repo_id", repo.id).find((b) => b.name === name);
  if (branch) return { branch: branch.name, sha: branch.sha };
  return { branch: name, sha: generateSha() };
}
function nextRunNumber(gh, workflowId, repoId) {
  const runs = gh.workflowRuns.findBy("workflow_id", workflowId).filter((r) => r.repo_id === repoId);
  return runs.reduce((m, r) => Math.max(m, r.run_number), 0) + 1;
}
function findRepoSecret(gh, repoId, name) {
  return gh.secrets.all().find((s) => s.repo_id === repoId && s.org_id === null && s.name === name);
}
function findOrgSecret(gh, orgId, name) {
  return gh.secrets.all().find((s) => s.org_id === orgId && s.repo_id === null && s.name === name);
}
function listRepoSecrets(gh, repoId) {
  return gh.secrets.all().filter((s) => s.repo_id === repoId && s.org_id === null);
}
function listOrgSecrets(gh, orgId) {
  return gh.secrets.all().filter((s) => s.org_id === orgId && s.repo_id === null);
}
function deleteJobsForRun(gh, runId) {
  for (const j of gh.jobs.findBy("run_id", runId)) {
    gh.jobs.delete(j.id);
  }
}
function deleteArtifactsForRun(gh, runId) {
  for (const a of gh.artifacts.findBy("run_id", runId)) {
    gh.artifacts.delete(a.id);
  }
}
function seedStubJobs(gh, repo, run) {
  const job = gh.jobs.insert({
    node_id: "",
    repo_id: repo.id,
    run_id: run.id,
    name: "build",
    status: run.status === "completed" ? "completed" : "in_progress",
    conclusion: run.status === "completed" ? run.conclusion : null,
    started_at: run.run_started_at,
    completed_at: run.status === "completed" ? run.updated_at : null,
    runner_id: 1,
    runner_name: "Hosted Agent",
    steps: [
      {
        name: "Set up job",
        status: run.status === "completed" ? "completed" : "in_progress",
        conclusion: run.status === "completed" ? run.conclusion : null,
        number: 1,
        started_at: run.run_started_at,
        completed_at: run.status === "completed" ? run.updated_at : null
      }
    ]
  });
  gh.jobs.update(job.id, { node_id: generateNodeId("Job", job.id) });
}
function formatWorkflow(w, repo, gh, baseUrl) {
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  return {
    id: w.id,
    node_id: w.node_id,
    name: w.name,
    path: w.path,
    state: w.state,
    created_at: w.created_at,
    updated_at: w.updated_at,
    url: `${repoUrl}/actions/workflows/${w.id}`,
    html_url: `${baseUrl}/${repo.full_name}/blob/${repo.default_branch}/${w.path}`,
    badge_url: w.badge_url || `${baseUrl}/${repo.full_name}/workflows/${encodeURIComponent(w.path.replace(/^\/.github\/workflows\//, ""))}/badge.svg`
  };
}
function formatWorkflowRun(run, repo, gh, baseUrl) {
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  const wf = gh.workflows.get(run.workflow_id);
  const actor = gh.users.get(run.actor_id);
  const wfPath = wf?.path ?? ".github/workflows/main.yml";
  return {
    id: run.id,
    name: run.name,
    node_id: run.node_id,
    head_branch: run.head_branch,
    head_sha: run.head_sha,
    path: wfPath,
    display_title: run.name,
    run_number: run.run_number,
    event: run.event,
    status: run.status,
    conclusion: run.conclusion,
    workflow_id: run.workflow_id,
    check_suite_id: null,
    url: `${repoUrl}/actions/runs/${run.id}`,
    html_url: `${baseUrl}/${repo.full_name}/actions/runs/${run.id}`,
    pull_requests: [],
    created_at: run.created_at,
    updated_at: run.updated_at,
    actor: actor ? formatUser(actor, baseUrl) : null,
    run_attempt: run.run_attempt,
    run_started_at: run.run_started_at,
    triggering_actor: actor ? formatUser(actor, baseUrl) : null,
    workflow_url: wf ? `${repoUrl}/actions/workflows/${wf.id}` : null,
    repository: formatRepo(repo, gh, baseUrl),
    head_commit: {
      id: run.head_sha,
      tree_id: generateSha(),
      message: "Workflow run",
      timestamp: run.created_at,
      author: actor ? { name: actor.login, email: `${actor.login}@users.noreply.github.com` } : { name: "unknown", email: "unknown@users.noreply.github.com" }
    }
  };
}
function formatJob(job, repo, gh, baseUrl) {
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  const run = gh.workflowRuns.get(job.run_id);
  const headSha = run?.head_sha ?? "";
  return {
    id: job.id,
    run_id: job.run_id,
    workflow_name: run?.name ?? "workflow",
    head_branch: run?.head_branch ?? "",
    run_url: `${repoUrl}/actions/runs/${job.run_id}`,
    node_id: job.node_id,
    head_sha: headSha,
    status: job.status,
    conclusion: job.conclusion,
    started_at: job.started_at,
    completed_at: job.completed_at,
    name: job.name,
    steps: job.steps,
    url: `${repoUrl}/actions/jobs/${job.id}`,
    html_url: `${baseUrl}/${repo.full_name}/commit/${headSha}/checks`,
    check_run_url: `${baseUrl}/repos/${repo.full_name}/check-runs/${job.id}`,
    labels: ["hosted"],
    runner_id: job.runner_id,
    runner_name: job.runner_name,
    runner_group_id: 1,
    runner_group_name: "GitHub Actions",
    created_at: job.created_at,
    updated_at: job.updated_at
  };
}
function formatArtifact(a, repo, gh, baseUrl) {
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  const run = gh.workflowRuns.get(a.run_id);
  return {
    id: a.id,
    node_id: a.node_id,
    name: a.name,
    size_in_bytes: a.size_in_bytes,
    url: `${repoUrl}/actions/artifacts/${a.id}`,
    archive_download_url: `${repoUrl}/actions/artifacts/${a.id}/zip`,
    expired: a.expired,
    digest: null,
    created_at: a.created_at,
    expires_at: a.expires_at,
    workflow_run: run ? {
      id: run.id,
      repository_id: repo.id,
      head_repository_id: repo.id,
      head_branch: run.head_branch,
      head_sha: run.head_sha
    } : null
  };
}
function filterRuns(gh, runs, q) {
  let out = runs;
  if (q.actor) {
    const u = gh.users.findOneBy("login", q.actor);
    out = u ? out.filter((r) => r.actor_id === u.id) : [];
  }
  if (q.branch) {
    out = out.filter((r) => r.head_branch === q.branch);
  }
  if (q.event) {
    out = out.filter((r) => r.event === q.event);
  }
  if (q.status) {
    out = out.filter((r) => r.status === q.status);
  }
  return out.sort((a, b) => b.created_at.localeCompare(a.created_at));
}
function actionsRoutes({ app, store, webhooks, baseUrl }) {
  const gh = getGitHubStore(store);
  app.get("/repos/:owner/:repo/actions/workflows", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "actions");
    const workflows = gh.workflows.findBy("repo_id", repo.id).sort((a, b) => a.path.localeCompare(b.path));
    return c.json({
      total_count: workflows.length,
      workflows: workflows.map((w) => formatWorkflow(w, repo, gh, baseUrl))
    });
  });
  app.get("/repos/:owner/:repo/actions/workflows/:workflow_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "actions");
    const w = resolveWorkflow(gh, repo.id, c.req.param("workflow_id"));
    if (!w) throw notFound();
    return c.json(formatWorkflow(w, repo, gh, baseUrl));
  });
  app.put("/repos/:owner/:repo/actions/workflows/:workflow_id/disable", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoAdmin(gh, c.get("authUser"), repo);
    const w = resolveWorkflow(gh, repo.id, c.req.param("workflow_id"));
    if (!w) throw notFound();
    gh.workflows.update(w.id, { state: "disabled_manually" });
    return c.body(null, 204);
  });
  app.put("/repos/:owner/:repo/actions/workflows/:workflow_id/enable", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoAdmin(gh, c.get("authUser"), repo);
    const w = resolveWorkflow(gh, repo.id, c.req.param("workflow_id"));
    if (!w) throw notFound();
    gh.workflows.update(w.id, { state: "active" });
    return c.body(null, 204);
  });
  app.post("/repos/:owner/:repo/actions/workflows/:workflow_id/dispatches", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const authUser = c.get("authUser");
    assertRepoPermission(gh, authUser, repo, "actions", "write");
    const actor = assertAuthenticatedActor(gh, authUser);
    const w = resolveWorkflow(gh, repo.id, c.req.param("workflow_id"));
    if (!w) throw notFound();
    if (w.state !== "active") {
      throw new ApiError(422, "Workflow is not active");
    }
    const body = await parseJsonBody(c);
    const ref = typeof body.ref === "string" ? body.ref : repo.default_branch;
    const { branch, sha } = resolveRefToBranchAndSha(gh, repo, ref);
    const now = timestamp();
    const runNumber = nextRunNumber(gh, w.id, repo.id);
    const run = gh.workflowRuns.insert({
      node_id: "",
      repo_id: repo.id,
      workflow_id: w.id,
      name: w.name,
      head_branch: branch,
      head_sha: sha,
      run_number: runNumber,
      event: "workflow_dispatch",
      status: "queued",
      conclusion: null,
      actor_id: actor.id,
      run_attempt: 1,
      run_started_at: now
    });
    gh.workflowRuns.update(run.id, { node_id: generateNodeId("WorkflowRun", run.id) });
    const created = gh.workflowRuns.get(run.id);
    seedStubJobs(gh, repo, created);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    void webhooks.dispatch(
      "workflow_dispatch",
      void 0,
      {
        ref: `refs/heads/${branch}`,
        inputs: typeof body.inputs === "object" && body.inputs ? body.inputs : {},
        workflow: formatWorkflow(w, repo, gh, baseUrl),
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    void webhooks.dispatch(
      "workflow_run",
      "requested",
      {
        workflow_run: formatWorkflowRun(created, repo, gh, baseUrl),
        repository: formatRepo(repo, gh, baseUrl),
        sender: formatUser(actor, baseUrl)
      },
      ownerLogin2,
      repo.name
    );
    return c.body(null, 204);
  });
  app.get("/repos/:owner/:repo/actions/runs", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "actions");
    const { page, per_page } = parsePagination(c);
    const actor = c.req.query("actor") ?? void 0;
    const branch = c.req.query("branch") ?? void 0;
    const event = c.req.query("event") ?? void 0;
    const status = c.req.query("status") ?? void 0;
    const all = gh.workflowRuns.findBy("repo_id", repo.id);
    const filtered = filterRuns(gh, all, { actor, branch, event, status });
    const total = filtered.length;
    const slice = filtered.slice((page - 1) * per_page, (page - 1) * per_page + per_page);
    setLinkHeader(c, total, page, per_page);
    return c.json({
      total_count: total,
      workflow_runs: slice.map((r) => formatWorkflowRun(r, repo, gh, baseUrl))
    });
  });
  app.get("/repos/:owner/:repo/actions/runs/:run_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "actions");
    const runId = parseInt(c.req.param("run_id"), 10);
    const run = gh.workflowRuns.get(runId);
    if (!run || run.repo_id !== repo.id) throw notFound();
    return c.json(formatWorkflowRun(run, repo, gh, baseUrl));
  });
  app.get("/repos/:owner/:repo/actions/workflows/:workflow_id/runs", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "actions");
    const w = resolveWorkflow(gh, repo.id, c.req.param("workflow_id"));
    if (!w) throw notFound();
    const { page, per_page } = parsePagination(c);
    const actor = c.req.query("actor") ?? void 0;
    const branch = c.req.query("branch") ?? void 0;
    const event = c.req.query("event") ?? void 0;
    const status = c.req.query("status") ?? void 0;
    const all = gh.workflowRuns.findBy("repo_id", repo.id).filter((r) => r.workflow_id === w.id);
    const filtered = filterRuns(gh, all, { actor, branch, event, status });
    const total = filtered.length;
    const slice = filtered.slice((page - 1) * per_page, (page - 1) * per_page + per_page);
    setLinkHeader(c, total, page, per_page);
    return c.json({
      total_count: total,
      workflow_runs: slice.map((r) => formatWorkflowRun(r, repo, gh, baseUrl))
    });
  });
  app.post("/repos/:owner/:repo/actions/runs/:run_id/cancel", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "actions", "write");
    const runId = parseInt(c.req.param("run_id"), 10);
    const run = gh.workflowRuns.get(runId);
    if (!run || run.repo_id !== repo.id) throw notFound();
    gh.workflowRuns.update(run.id, { status: "completed", conclusion: "cancelled" });
    const updated = gh.workflowRuns.get(run.id);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    const actor = gh.users.get(run.actor_id);
    void webhooks.dispatch(
      "workflow_run",
      "completed",
      {
        workflow_run: formatWorkflowRun(updated, repo, gh, baseUrl),
        repository: formatRepo(repo, gh, baseUrl),
        sender: actor ? formatUser(actor, baseUrl) : null
      },
      ownerLogin2,
      repo.name
    );
    return c.body(null, 202);
  });
  app.post("/repos/:owner/:repo/actions/runs/:run_id/rerun", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "actions", "write");
    const runId = parseInt(c.req.param("run_id"), 10);
    const parent = gh.workflowRuns.get(runId);
    if (!parent || parent.repo_id !== repo.id) throw notFound();
    const wf = gh.workflows.get(parent.workflow_id);
    if (!wf) throw notFound();
    const now = timestamp();
    const runNumber = nextRunNumber(gh, wf.id, repo.id);
    const run = gh.workflowRuns.insert({
      node_id: "",
      repo_id: repo.id,
      workflow_id: wf.id,
      name: parent.name,
      head_branch: parent.head_branch,
      head_sha: parent.head_sha,
      run_number: runNumber,
      event: parent.event,
      status: "queued",
      conclusion: null,
      actor_id: parent.actor_id,
      run_attempt: parent.run_attempt + 1,
      run_started_at: now
    });
    gh.workflowRuns.update(run.id, { node_id: generateNodeId("WorkflowRun", run.id) });
    const created = gh.workflowRuns.get(run.id);
    seedStubJobs(gh, repo, created);
    const ownerLogin2 = ownerLoginOf(gh, repo);
    const actor = gh.users.get(created.actor_id);
    void webhooks.dispatch(
      "workflow_run",
      "requested",
      {
        workflow_run: formatWorkflowRun(created, repo, gh, baseUrl),
        repository: formatRepo(repo, gh, baseUrl),
        sender: actor ? formatUser(actor, baseUrl) : null
      },
      ownerLogin2,
      repo.name
    );
    return c.json(formatWorkflowRun(created, repo, gh, baseUrl), 201);
  });
  app.delete("/repos/:owner/:repo/actions/runs/:run_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoAdmin(gh, c.get("authUser"), repo);
    const runId = parseInt(c.req.param("run_id"), 10);
    const run = gh.workflowRuns.get(runId);
    if (!run || run.repo_id !== repo.id) throw notFound();
    deleteArtifactsForRun(gh, run.id);
    deleteJobsForRun(gh, run.id);
    gh.workflowRuns.delete(run.id);
    return c.body(null, 204);
  });
  app.get("/repos/:owner/:repo/actions/runs/:run_id/logs", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "actions");
    const runId = parseInt(c.req.param("run_id"), 10);
    const run = gh.workflowRuns.get(runId);
    if (!run || run.repo_id !== repo.id) throw notFound();
    return c.text(`2025-01-01T00:00:00.0000000Z Workflow run ${run.id} logs (stub)
${run.head_sha}
`, 200, {
      "Content-Type": "text/plain; charset=utf-8"
    });
  });
  app.get("/repos/:owner/:repo/actions/runs/:run_id/jobs", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "actions");
    const runId = parseInt(c.req.param("run_id"), 10);
    const run = gh.workflowRuns.get(runId);
    if (!run || run.repo_id !== repo.id) throw notFound();
    const jobs = gh.jobs.findBy("run_id", runId).filter((j) => j.repo_id === repo.id);
    return c.json({
      total_count: jobs.length,
      jobs: jobs.map((j) => formatJob(j, repo, gh, baseUrl))
    });
  });
  app.get("/repos/:owner/:repo/actions/jobs/:job_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "actions");
    const jobId = parseInt(c.req.param("job_id"), 10);
    const job = gh.jobs.get(jobId);
    if (!job || job.repo_id !== repo.id) throw notFound();
    return c.json(formatJob(job, repo, gh, baseUrl));
  });
  app.get("/repos/:owner/:repo/actions/jobs/:job_id/logs", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "actions");
    const jobId = parseInt(c.req.param("job_id"), 10);
    const job = gh.jobs.get(jobId);
    if (!job || job.repo_id !== repo.id) throw notFound();
    return c.text(`2025-01-01T00:00:00.0000000Z Job ${job.id} logs (stub)
`, 200, {
      "Content-Type": "text/plain; charset=utf-8"
    });
  });
  app.get("/repos/:owner/:repo/actions/artifacts", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "actions");
    const { page, per_page } = parsePagination(c);
    const all = gh.artifacts.findBy("repo_id", repo.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
    const total = all.length;
    const slice = all.slice((page - 1) * per_page, (page - 1) * per_page + per_page);
    setLinkHeader(c, total, page, per_page);
    return c.json({
      total_count: total,
      artifacts: slice.map((a) => formatArtifact(a, repo, gh, baseUrl))
    });
  });
  app.get("/repos/:owner/:repo/actions/runs/:run_id/artifacts", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "actions");
    const runId = parseInt(c.req.param("run_id"), 10);
    const run = gh.workflowRuns.get(runId);
    if (!run || run.repo_id !== repo.id) throw notFound();
    const arts = gh.artifacts.findBy("run_id", runId).filter((a) => a.repo_id === repo.id);
    return c.json({
      total_count: arts.length,
      artifacts: arts.map((a) => formatArtifact(a, repo, gh, baseUrl))
    });
  });
  app.get("/repos/:owner/:repo/actions/artifacts/:artifact_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "actions");
    const artifactId = parseInt(c.req.param("artifact_id"), 10);
    const a = gh.artifacts.get(artifactId);
    if (!a || a.repo_id !== repo.id) throw notFound();
    return c.json(formatArtifact(a, repo, gh, baseUrl));
  });
  app.delete("/repos/:owner/:repo/actions/artifacts/:artifact_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoAdmin(gh, c.get("authUser"), repo);
    const artifactId = parseInt(c.req.param("artifact_id"), 10);
    const a = gh.artifacts.get(artifactId);
    if (!a || a.repo_id !== repo.id) throw notFound();
    gh.artifacts.delete(a.id);
    return c.body(null, 204);
  });
  app.get("/repos/:owner/:repo/actions/secrets", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "secrets");
    const secrets = listRepoSecrets(gh, repo.id).sort((a, b) => a.name.localeCompare(b.name));
    return c.json({
      total_count: secrets.length,
      secrets: secrets.map((s) => ({
        name: s.name,
        created_at: s.created_at,
        updated_at: s.updated_at
      }))
    });
  });
  app.get("/repos/:owner/:repo/actions/secrets/:secret_name", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "secrets");
    const name = c.req.param("secret_name");
    const s = findRepoSecret(gh, repo.id, name);
    if (!s) throw notFound();
    return c.json({
      name: s.name,
      visibility: s.visibility,
      created_at: s.created_at,
      updated_at: s.updated_at
    });
  });
  app.put("/repos/:owner/:repo/actions/secrets/:secret_name", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoAdmin(gh, c.get("authUser"), repo);
    await parseJsonBody(c);
    const name = c.req.param("secret_name");
    const existing = findRepoSecret(gh, repo.id, name);
    if (existing) {
      gh.secrets.update(existing.id, { visibility: existing.visibility });
      return c.body(null, 204);
    }
    gh.secrets.insert({
      repo_id: repo.id,
      org_id: null,
      name,
      visibility: "all"
    });
    return c.body(null, 201);
  });
  app.delete("/repos/:owner/:repo/actions/secrets/:secret_name", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoAdmin(gh, c.get("authUser"), repo);
    const name = c.req.param("secret_name");
    const s = findRepoSecret(gh, repo.id, name);
    if (!s) throw notFound();
    gh.secrets.delete(s.id);
    return c.body(null, 204);
  });
  app.get("/orgs/:org/actions/secrets", (c) => {
    const orgLogin = c.req.param("org");
    const org = getOrgByLogin3(gh, orgLogin);
    if (!org) throw notFound();
    assertOrgAdmin2(gh, c.get("authUser"), org);
    const secrets = listOrgSecrets(gh, org.id).sort((a, b) => a.name.localeCompare(b.name));
    return c.json({
      total_count: secrets.length,
      secrets: secrets.map((s) => ({
        name: s.name,
        created_at: s.created_at,
        updated_at: s.updated_at
      }))
    });
  });
  app.get("/orgs/:org/actions/secrets/:secret_name", (c) => {
    const orgLogin = c.req.param("org");
    const org = getOrgByLogin3(gh, orgLogin);
    if (!org) throw notFound();
    assertOrgAdmin2(gh, c.get("authUser"), org);
    const name = c.req.param("secret_name");
    const s = findOrgSecret(gh, org.id, name);
    if (!s) throw notFound();
    return c.json({
      name: s.name,
      visibility: s.visibility,
      created_at: s.created_at,
      updated_at: s.updated_at
    });
  });
  app.put("/orgs/:org/actions/secrets/:secret_name", async (c) => {
    const orgLogin = c.req.param("org");
    const org = getOrgByLogin3(gh, orgLogin);
    if (!org) throw notFound();
    assertOrgAdmin2(gh, c.get("authUser"), org);
    await parseJsonBody(c);
    const name = c.req.param("secret_name");
    const existing = findOrgSecret(gh, org.id, name);
    if (existing) {
      gh.secrets.update(existing.id, { visibility: existing.visibility });
      return c.body(null, 204);
    }
    gh.secrets.insert({
      repo_id: null,
      org_id: org.id,
      name,
      visibility: "all"
    });
    return c.body(null, 201);
  });
  app.delete("/orgs/:org/actions/secrets/:secret_name", (c) => {
    const orgLogin = c.req.param("org");
    const org = getOrgByLogin3(gh, orgLogin);
    if (!org) throw notFound();
    assertOrgAdmin2(gh, c.get("authUser"), org);
    const name = c.req.param("secret_name");
    const s = findOrgSecret(gh, org.id, name);
    if (!s) throw notFound();
    gh.secrets.delete(s.id);
    return c.body(null, 204);
  });
}
var CONCLUSION_RANK = {
  success: 0,
  neutral: 1,
  skipped: 2,
  cancelled: 3,
  timed_out: 4,
  action_required: 5,
  failure: 6
};
function findCommitInRepo2(gh, repoId, shaParam) {
  const want = shaParam.toLowerCase();
  const list = gh.commits.findBy("repo_id", repoId);
  return list.find((c) => c.sha === shaParam || c.sha.toLowerCase() === want || c.sha.startsWith(shaParam));
}
function resolveRefToHeadSha(gh, repo, refParam) {
  const commit = findCommitInRepo2(gh, repo.id, refParam);
  if (commit) return commit.sha;
  const branch = gh.branches.findBy("repo_id", repo.id).find((b) => b.name === refParam);
  if (branch) return branch.sha;
  const fullRef = refParam.startsWith("refs/") ? refParam : `refs/heads/${refParam}`;
  const r = gh.refs.findBy("repo_id", repo.id).find((x) => x.ref === fullRef);
  if (r) return r.sha;
  return void 0;
}
function headBranchForSha(gh, repo, headSha) {
  const branch = gh.branches.findBy("repo_id", repo.id).find((b) => b.sha === headSha);
  if (branch) return branch.name;
  return repo.default_branch;
}
function getOrCreateCheckSuite(gh, repo, headSha, headBranch) {
  const existing = gh.checkSuites.findBy("repo_id", repo.id).find((s) => s.head_sha === headSha);
  if (existing) return existing;
  const hb = headBranch?.trim() || headBranchForSha(gh, repo, headSha);
  const row = gh.checkSuites.insert({
    node_id: "",
    repo_id: repo.id,
    head_branch: hb,
    head_sha: headSha,
    status: "queued",
    conclusion: null,
    before: "",
    after: headSha,
    app_id: null
  });
  gh.checkSuites.update(row.id, { node_id: generateNodeId("CheckSuite", row.id) });
  return gh.checkSuites.get(row.id);
}
function worstConclusion(conclusions) {
  let best = "success";
  let rank = -1;
  for (const c of conclusions) {
    const r = CONCLUSION_RANK[c] ?? 3;
    if (r > rank) {
      rank = r;
      best = c;
    }
  }
  return best;
}
function recomputeSuiteFromRuns(runs) {
  if (runs.length === 0) {
    return { status: "completed", conclusion: null };
  }
  const allDone = runs.every((r) => r.status === "completed");
  if (allDone) {
    const conclusions = runs.map((r) => r.conclusion).filter((c) => c != null);
    return {
      status: "completed",
      conclusion: conclusions.length ? worstConclusion(conclusions) : null
    };
  }
  const anyInProgress = runs.some((r) => r.status === "in_progress");
  if (anyInProgress) {
    return { status: "in_progress", conclusion: null };
  }
  const anyQueued = runs.some((r) => r.status === "queued");
  const anyCompleted = runs.some((r) => r.status === "completed");
  if (anyCompleted && anyQueued) {
    return { status: "in_progress", conclusion: null };
  }
  if (anyQueued) {
    return { status: "queued", conclusion: null };
  }
  return { status: "in_progress", conclusion: null };
}
function recomputeCheckSuite(gh, suiteId) {
  const suite = gh.checkSuites.get(suiteId);
  if (!suite) return;
  const runs = gh.checkRuns.findBy("repo_id", suite.repo_id).filter((r) => r.check_suite_id === suiteId);
  const { status, conclusion } = recomputeSuiteFromRuns(runs);
  gh.checkSuites.update(suiteId, { status, conclusion });
}
function parseConclusion(raw) {
  if (raw === void 0) return void 0;
  if (raw === null) return null;
  if (typeof raw !== "string") throw new ApiError(422, "Invalid conclusion");
  const allowed = /* @__PURE__ */ new Set(["success", "failure", "neutral", "cancelled", "skipped", "timed_out", "action_required"]);
  if (!allowed.has(raw)) throw new ApiError(422, "Invalid conclusion");
  return raw;
}
function parseStatus(raw, fallback) {
  if (raw === void 0 || raw === null) return fallback;
  if (raw !== "queued" && raw !== "in_progress" && raw !== "completed") {
    throw new ApiError(422, "Invalid status");
  }
  return raw;
}
function normalizeAnnotations(raw) {
  if (raw === void 0 || raw === null) return [];
  if (!Array.isArray(raw)) throw new ApiError(422, "Invalid annotations");
  const out = [];
  for (const a of raw) {
    if (!a || typeof a !== "object") throw new ApiError(422, "Invalid annotation");
    const o = a;
    const path = typeof o.path === "string" ? o.path : null;
    const message = typeof o.message === "string" ? o.message : null;
    const start_line = typeof o.start_line === "number" ? o.start_line : parseInt(String(o.start_line), 10);
    const end_line = typeof o.end_line === "number" ? o.end_line : parseInt(String(o.end_line), 10);
    const annotation_level = typeof o.annotation_level === "string" ? o.annotation_level : "notice";
    if (!path || !message || !Number.isFinite(start_line) || !Number.isFinite(end_line)) {
      throw new ApiError(422, "Invalid annotation fields");
    }
    out.push({
      path,
      start_line,
      end_line,
      annotation_level,
      message
    });
  }
  return out;
}
function formatCheckSuiteBrief(suite, repo, baseUrl) {
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  return {
    id: suite.id,
    node_id: suite.node_id,
    head_branch: suite.head_branch,
    head_sha: suite.head_sha,
    url: `${repoUrl}/check-suites/${suite.id}`
  };
}
function formatRepoBrief(repo, gh, baseUrl) {
  const owner = formatRepo(repo, gh, baseUrl).owner;
  return {
    id: repo.id,
    node_id: repo.node_id,
    name: repo.name,
    full_name: repo.full_name,
    private: repo.private,
    owner,
    url: `${baseUrl}/repos/${repo.full_name}`,
    html_url: `${baseUrl}/${repo.full_name}`
  };
}
function formatCheckRun(run, repo, gh, baseUrl) {
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  const suite = run.check_suite_id ? gh.checkSuites.get(run.check_suite_id) : null;
  return {
    id: run.id,
    node_id: run.node_id,
    head_sha: run.head_sha,
    name: run.name,
    status: run.status,
    conclusion: run.conclusion,
    started_at: run.started_at,
    completed_at: run.completed_at,
    external_id: run.external_id,
    url: `${repoUrl}/check-runs/${run.id}`,
    html_url: `${baseUrl}/${repo.full_name}/commit/${run.head_sha}/checks/${run.id}`,
    details_url: run.details_url,
    output: {
      title: run.output.title,
      summary: run.output.summary,
      text: run.output.text,
      annotations_count: run.output.annotations_count
    },
    check_suite: suite ? formatCheckSuiteBrief(suite, repo, baseUrl) : null,
    app: null,
    pull_requests: []
  };
}
function formatCheckSuite(suite, repo, gh, baseUrl) {
  const repoUrl = `${baseUrl}/repos/${repo.full_name}`;
  return {
    id: suite.id,
    node_id: suite.node_id,
    head_branch: suite.head_branch,
    head_sha: suite.head_sha,
    status: suite.status,
    conclusion: suite.conclusion,
    url: `${repoUrl}/check-suites/${suite.id}`,
    before: suite.before,
    after: suite.after,
    pull_requests: [],
    app: null,
    repository: formatRepoBrief(repo, gh, baseUrl),
    created_at: suite.created_at,
    updated_at: suite.updated_at
  };
}
function dispatchCheckRun(webhooks, gh, repo, run, actor, baseUrl, action) {
  const ownerLogin2 = ownerLoginOf(gh, repo);
  void webhooks.dispatch(
    "check_run",
    action,
    {
      action,
      check_run: formatCheckRun(run, repo, gh, baseUrl),
      repository: formatRepo(repo, gh, baseUrl),
      sender: formatUser(actor, baseUrl)
    },
    ownerLogin2,
    repo.name
  );
}
function dispatchCheckSuite(webhooks, gh, repo, suite, actor, baseUrl, action) {
  const ownerLogin2 = ownerLoginOf(gh, repo);
  void webhooks.dispatch(
    "check_suite",
    action,
    {
      action,
      check_suite: formatCheckSuite(suite, repo, gh, baseUrl),
      repository: formatRepo(repo, gh, baseUrl),
      sender: formatUser(actor, baseUrl)
    },
    ownerLogin2,
    repo.name
  );
}
function checksRoutes({ app, store, webhooks, baseUrl }) {
  const gh = getGitHubStore(store);
  app.patch("/repos/:owner/:repo/check-suites/preferences", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoWrite(gh, c.get("authUser"), repo, "checks");
    const body = await parseJsonBody(c);
    const auto = Array.isArray(body.auto_trigger_checks) && body.auto_trigger_checks.every((x) => x && typeof x === "object") ? body.auto_trigger_checks : [];
    return c.json({
      preferences: {
        auto_trigger_checks: auto
      }
    });
  });
  app.post("/repos/:owner/:repo/check-suites", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, "checks");
    const body = await parseJsonBody(c);
    if (typeof body.head_sha !== "string" || !body.head_sha.trim()) {
      throw new ApiError(422, "head_sha is required");
    }
    const headSha = body.head_sha.trim();
    const headBranch = typeof body.head_branch === "string" && body.head_branch.trim() ? body.head_branch.trim() : null;
    const suite = getOrCreateCheckSuite(gh, repo, headSha, headBranch);
    if (headBranch && suite.head_branch !== headBranch) {
      gh.checkSuites.update(suite.id, { head_branch: headBranch });
    }
    const updated = gh.checkSuites.get(suite.id);
    dispatchCheckSuite(webhooks, gh, repo, updated, actor, baseUrl, "requested");
    return c.json(formatCheckSuite(updated, repo, gh, baseUrl), 201);
  });
  app.get("/repos/:owner/:repo/check-suites/:check_suite_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "checks");
    const suiteId = parseInt(c.req.param("check_suite_id"), 10);
    const suite = gh.checkSuites.get(suiteId);
    if (!suite || suite.repo_id !== repo.id) throw notFound();
    return c.json(formatCheckSuite(suite, repo, gh, baseUrl));
  });
  app.get("/repos/:owner/:repo/check-suites/:check_suite_id/check-runs", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "checks");
    const suiteId = parseInt(c.req.param("check_suite_id"), 10);
    const suite = gh.checkSuites.get(suiteId);
    if (!suite || suite.repo_id !== repo.id) throw notFound();
    const { page, per_page } = parsePagination(c);
    let runs = gh.checkRuns.findBy("repo_id", repo.id).filter((r) => r.check_suite_id === suiteId);
    runs = runs.sort((a, b) => b.id - a.id);
    const total = runs.length;
    const slice = runs.slice((page - 1) * per_page, (page - 1) * per_page + per_page);
    setLinkHeader(c, total, page, per_page);
    return c.json({
      total_count: total,
      check_runs: slice.map((r) => formatCheckRun(r, repo, gh, baseUrl))
    });
  });
  app.post("/repos/:owner/:repo/check-suites/:check_suite_id/rerequest", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, "checks");
    const suiteId = parseInt(c.req.param("check_suite_id"), 10);
    const suite = gh.checkSuites.get(suiteId);
    if (!suite || suite.repo_id !== repo.id) throw notFound();
    const runs = gh.checkRuns.findBy("repo_id", repo.id).filter((r) => r.check_suite_id === suiteId);
    const now = timestamp();
    for (const r of runs) {
      gh.checkRuns.update(r.id, {
        status: "queued",
        conclusion: null,
        completed_at: null,
        started_at: null,
        updated_at: now
      });
    }
    gh.checkSuites.update(suiteId, { status: "queued", conclusion: null });
    const suiteAfter = gh.checkSuites.get(suiteId);
    dispatchCheckSuite(webhooks, gh, repo, suiteAfter, actor, baseUrl, "rerequested");
    return c.body(null, 201);
  });
  app.get("/repos/:owner/:repo/commits/:ref{.+}/check-suites", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "checks");
    const ref = c.req.param("ref");
    const headSha = resolveRefToHeadSha(gh, repo, ref);
    if (!headSha) throw notFound();
    const suites = gh.checkSuites.findBy("repo_id", repo.id).filter((s) => s.head_sha === headSha).sort((a, b) => b.id - a.id);
    return c.json({
      total_count: suites.length,
      check_suites: suites.map((s) => formatCheckSuite(s, repo, gh, baseUrl))
    });
  });
  app.post("/repos/:owner/:repo/check-runs", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, "checks");
    const body = await parseJsonBody(c);
    if (typeof body.name !== "string" || !body.name.trim()) {
      throw new ApiError(422, "name is required");
    }
    if (typeof body.head_sha !== "string" || !body.head_sha.trim()) {
      throw new ApiError(422, "head_sha is required");
    }
    const name = body.name.trim();
    const headSha = body.head_sha.trim();
    const status = parseStatus(body.status, "queued");
    let conclusion = parseConclusion(body.conclusion);
    if (status === "completed" && (conclusion === void 0 || conclusion === null)) {
      throw new ApiError(422, "conclusion is required when status is completed");
    }
    if (status !== "completed") {
      conclusion = null;
    }
    const details_url = typeof body.details_url === "string" || body.details_url === null ? body.details_url : null;
    const external_id = typeof body.external_id === "string" ? body.external_id : body.external_id == null ? "" : String(body.external_id);
    const started_at = body.started_at === void 0 ? null : body.started_at === null ? null : typeof body.started_at === "string" ? body.started_at : null;
    let completed_at = body.completed_at === void 0 ? null : body.completed_at === null ? null : typeof body.completed_at === "string" ? body.completed_at : null;
    if (status === "completed" && !completed_at) {
      completed_at = timestamp();
    }
    const outRaw = body.output && typeof body.output === "object" ? body.output : {};
    const annotations = normalizeAnnotations(outRaw.annotations);
    const output = {
      title: typeof outRaw.title === "string" ? outRaw.title : outRaw.title === null ? null : null,
      summary: typeof outRaw.summary === "string" ? outRaw.summary : outRaw.summary === null ? null : null,
      text: typeof outRaw.text === "string" ? outRaw.text : outRaw.text === null ? null : null,
      annotations_count: annotations.length,
      annotations
    };
    let actions = null;
    if (Array.isArray(body.actions)) {
      actions = [];
      for (const act of body.actions) {
        if (!act || typeof act !== "object") continue;
        const a = act;
        if (typeof a.id === "string" && typeof a.label === "string" && typeof a.description === "string") {
          actions.push({ id: a.id, label: a.label, description: a.description });
        }
      }
      if (actions.length === 0) actions = null;
    }
    const suite = getOrCreateCheckSuite(gh, repo, headSha, null);
    const row = gh.checkRuns.insert({
      node_id: "",
      repo_id: repo.id,
      head_sha: headSha,
      name,
      status,
      conclusion: conclusion ?? null,
      started_at,
      completed_at,
      external_id,
      details_url,
      actions,
      output,
      check_suite_id: suite.id,
      app_id: typeof body.app_id === "number" ? body.app_id : null
    });
    gh.checkRuns.update(row.id, { node_id: generateNodeId("CheckRun", row.id) });
    const run = gh.checkRuns.get(row.id);
    recomputeCheckSuite(gh, suite.id);
    dispatchCheckRun(webhooks, gh, repo, run, actor, baseUrl, "created");
    return c.json(formatCheckRun(run, repo, gh, baseUrl), 201);
  });
  app.patch("/repos/:owner/:repo/check-runs/:check_run_id", async (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, "checks");
    const runId = parseInt(c.req.param("check_run_id"), 10);
    const prev = gh.checkRuns.get(runId);
    if (!prev || prev.repo_id !== repo.id) throw notFound();
    const body = await parseJsonBody(c);
    const patch = {};
    if (body.name !== void 0) {
      if (typeof body.name !== "string" || !body.name.trim()) throw new ApiError(422, "Invalid name");
      patch.name = body.name.trim();
    }
    if (body.head_sha !== void 0) {
      if (typeof body.head_sha !== "string" || !body.head_sha.trim()) throw new ApiError(422, "Invalid head_sha");
      patch.head_sha = body.head_sha.trim();
    }
    if (body.status !== void 0) {
      patch.status = parseStatus(body.status, prev.status);
    }
    if (body.conclusion !== void 0) {
      const pc = parseConclusion(body.conclusion);
      patch.conclusion = pc === void 0 ? null : pc;
    }
    if (body.details_url !== void 0) {
      patch.details_url = typeof body.details_url === "string" || body.details_url === null ? body.details_url : null;
    }
    if (body.external_id !== void 0) {
      patch.external_id = typeof body.external_id === "string" ? body.external_id : String(body.external_id ?? "");
    }
    if (body.started_at !== void 0) {
      patch.started_at = body.started_at === null ? null : typeof body.started_at === "string" ? body.started_at : null;
    }
    if (body.completed_at !== void 0) {
      patch.completed_at = body.completed_at === null ? null : typeof body.completed_at === "string" ? body.completed_at : null;
    }
    if (body.app_id !== void 0) {
      patch.app_id = typeof body.app_id === "number" ? body.app_id : null;
    }
    if (body.actions !== void 0) {
      if (body.actions === null) {
        patch.actions = null;
      } else if (Array.isArray(body.actions)) {
        const actions = [];
        for (const act of body.actions) {
          if (!act || typeof act !== "object") continue;
          const a = act;
          if (typeof a.id === "string" && typeof a.label === "string" && typeof a.description === "string") {
            actions.push({ id: a.id, label: a.label, description: a.description });
          }
        }
        patch.actions = actions.length ? actions : null;
      }
    }
    if (body.output !== void 0 && body.output !== null && typeof body.output === "object") {
      const outRaw = body.output;
      const annotations = normalizeAnnotations(outRaw.annotations);
      patch.output = {
        title: outRaw.title === void 0 ? prev.output.title : typeof outRaw.title === "string" ? outRaw.title : null,
        summary: outRaw.summary === void 0 ? prev.output.summary : typeof outRaw.summary === "string" ? outRaw.summary : null,
        text: outRaw.text === void 0 ? prev.output.text : typeof outRaw.text === "string" ? outRaw.text : null,
        annotations_count: annotations.length,
        annotations
      };
    }
    const nextStatus = patch.status ?? prev.status;
    const nextConclusion = patch.conclusion !== void 0 ? patch.conclusion : prev.conclusion;
    if (patch.head_sha && patch.head_sha !== prev.head_sha) {
      const newSuite = getOrCreateCheckSuite(gh, repo, patch.head_sha, null);
      patch.check_suite_id = newSuite.id;
    }
    if (nextStatus === "completed") {
      if (nextConclusion === void 0 || nextConclusion === null) {
        throw new ApiError(422, "conclusion is required when status is completed");
      }
      patch.conclusion = nextConclusion;
      const nextCompleted = patch.completed_at !== void 0 ? patch.completed_at : prev.completed_at;
      if (!nextCompleted) {
        patch.completed_at = timestamp();
      }
    } else {
      patch.conclusion = null;
      patch.completed_at = null;
    }
    gh.checkRuns.update(runId, patch);
    const run = gh.checkRuns.get(runId);
    if (run.check_suite_id) {
      recomputeCheckSuite(gh, run.check_suite_id);
    }
    if (prev.status !== "completed" && run.status === "completed") {
      dispatchCheckRun(webhooks, gh, repo, run, actor, baseUrl, "completed");
    }
    return c.json(formatCheckRun(run, repo, gh, baseUrl));
  });
  app.get("/repos/:owner/:repo/check-runs/:check_run_id", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "checks");
    const runId = parseInt(c.req.param("check_run_id"), 10);
    const run = gh.checkRuns.get(runId);
    if (!run || run.repo_id !== repo.id) throw notFound();
    return c.json(formatCheckRun(run, repo, gh, baseUrl));
  });
  app.get("/repos/:owner/:repo/check-runs/:check_run_id/annotations", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "checks");
    const runId = parseInt(c.req.param("check_run_id"), 10);
    const run = gh.checkRuns.get(runId);
    if (!run || run.repo_id !== repo.id) throw notFound();
    const { page, per_page } = parsePagination(c);
    const annotations = run.output.annotations;
    const total = annotations.length;
    const slice = annotations.slice((page - 1) * per_page, (page - 1) * per_page + per_page);
    setLinkHeader(c, total, page, per_page);
    const check_annotations = slice.map((a, i) => ({
      path: a.path,
      blob_href: `${baseUrl}/${repo.full_name}/blob/${run.head_sha}/${a.path}`,
      start_line: a.start_line,
      end_line: a.end_line,
      message: a.message,
      title: null,
      raw_details: null,
      start_column: null,
      end_column: null,
      annotation_level: a.annotation_level,
      id: (page - 1) * per_page + i + 1
    }));
    return c.json({
      total_count: total,
      check_annotations
    });
  });
  app.post("/repos/:owner/:repo/check-runs/:check_run_id/rerequest", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    const actor = assertRepoWrite(gh, c.get("authUser"), repo, "checks");
    const runId = parseInt(c.req.param("check_run_id"), 10);
    const prev = gh.checkRuns.get(runId);
    if (!prev || prev.repo_id !== repo.id) throw notFound();
    const now = timestamp();
    gh.checkRuns.update(runId, {
      status: "queued",
      conclusion: null,
      completed_at: null,
      started_at: null,
      updated_at: now
    });
    const run = gh.checkRuns.get(runId);
    if (run.check_suite_id) {
      recomputeCheckSuite(gh, run.check_suite_id);
    }
    dispatchCheckRun(webhooks, gh, repo, run, actor, baseUrl, "rerequested");
    return c.body(null, 201);
  });
  app.get("/repos/:owner/:repo/commits/:ref{.+}/check-runs", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const repo = lookupRepo(gh, owner, repoName);
    if (!repo) throw notFound();
    assertRepoPermission(gh, c.get("authUser"), repo, "checks");
    const ref = c.req.param("ref");
    const headSha = resolveRefToHeadSha(gh, repo, ref);
    if (!headSha) throw notFound();
    const check_name = c.req.query("check_name")?.trim();
    const statusQ = c.req.query("status")?.trim();
    const filter = (c.req.query("filter") ?? "latest").toLowerCase();
    let runs = gh.checkRuns.findBy("repo_id", repo.id).filter((r) => r.head_sha === headSha);
    if (check_name) {
      runs = runs.filter((r) => r.name === check_name);
    }
    if (statusQ && (statusQ === "queued" || statusQ === "in_progress" || statusQ === "completed")) {
      runs = runs.filter((r) => r.status === statusQ);
    }
    runs = runs.sort((a, b) => b.id - a.id);
    if (filter === "latest") {
      const byName = /* @__PURE__ */ new Map();
      for (const r of runs.sort((a, b) => a.id - b.id)) {
        byName.set(r.name, r);
      }
      runs = [...byName.values()].sort((a, b) => b.id - a.id);
    }
    return c.json({
      total_count: runs.length,
      check_runs: runs.map((r) => formatCheckRun(r, repo, gh, baseUrl))
    });
  });
}
function rateLimitRoutes({ app }) {
  app.get("/rate_limit", (c) => {
    const now = Math.floor(Date.now() / 1e3);
    const reset = now + 3600;
    const rateLimit = {
      limit: 5e3,
      remaining: 4999,
      reset,
      used: 1,
      resource: "core"
    };
    return c.json({
      resources: {
        core: rateLimit,
        search: { limit: 30, remaining: 29, reset, used: 1, resource: "search" },
        graphql: { limit: 5e3, remaining: 4999, reset, used: 1, resource: "graphql" },
        integration_manifest: { limit: 5e3, remaining: 4999, reset, used: 1, resource: "integration_manifest" },
        source_import: { limit: 100, remaining: 99, reset, used: 1, resource: "source_import" },
        code_scanning_upload: { limit: 500, remaining: 499, reset, used: 1, resource: "code_scanning_upload" },
        actions_runner_registration: {
          limit: 1e4,
          remaining: 9999,
          reset,
          used: 1,
          resource: "actions_runner_registration"
        },
        scim: { limit: 15e3, remaining: 14999, reset, used: 1, resource: "scim" }
      },
      rate: rateLimit
    });
  });
}
function metaRoutes({ app, baseUrl }) {
  app.get("/meta", (c) => {
    return c.json({
      verifiable_password_authentication: true,
      ssh_key_fingerprints: {
        SHA256_RSA: "placeholder",
        SHA256_DSA: "placeholder",
        SHA256_ECDSA: "placeholder",
        SHA256_ED25519: "placeholder"
      },
      ssh_keys: ["ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPlaceholder"],
      hooks: ["127.0.0.1/32"],
      web: ["127.0.0.1/32"],
      api: ["127.0.0.1/32"],
      git: ["127.0.0.1/32"],
      github_enterprise_importer: ["127.0.0.1/32"],
      packages: ["127.0.0.1/32"],
      pages: ["127.0.0.1/32"],
      importer: ["127.0.0.1/32"],
      actions: ["127.0.0.1/32"],
      actions_macos: ["127.0.0.1/32"],
      dependabot: ["127.0.0.1/32"],
      copilot: ["127.0.0.1/32"],
      domains: {
        website: ["localhost"],
        codespaces: ["localhost"],
        copilot: ["localhost"],
        packages: ["localhost"],
        actions: ["localhost"],
        artifact_attestations: { trust_domain: "localhost" }
      }
    });
  });
  app.get("/octocat", (c) => {
    const say = c.req.query("s") ?? "emulate says hello!";
    const art = `
               MMM.           .MMM
               MMMMMMMMMMMMMMMMMMM
               MMMMMMMMMMMMMMMMMMM      ____________________________
              MMMMMMMMMMMMMMMMMMMMM    |                            |
             MMMMMMMMMMMMMMMMMMMMMMM   | ${say.padEnd(26)} |
            MMMMMMMMMMMMMMMMMMMMMMMM   |_   ________________________|
            MMMM::- -:::::::- -::MMMM    |/
             MM~:~ 00~:::::~ 00~:~MM
              .. .. :~M]:[~:M. . ..
            .MM.     ~MM. MM~     .MM.
           MMMM.    ~MM:~MM~    .MMMM
          MMMMMM. ~MMMMMMMM~ .MMMMMM
         MMMMMMMMMMMMMMMMMMMMMMMMMMMM
           .MMMMMMMMMMMMMMMMMMMMMM.
             MMMMMMMMMMMMMMMMMM
              ;MMMMMMMMMMMMMMM;
                :MMMMMMMMMMMM:
                .MMMMMMMMMMM.
                 MMMMMMMMMMM
                  MMMMMMMMM
                   MMMMMMM
                    MMMMM
                     MMM
                      M
`;
    c.header("Content-Type", "application/octocat-stream");
    return c.text(art.trim());
  });
  app.get("/emojis", (c) => {
    return c.json({
      "+1": `${baseUrl}/emojis/+1.png`,
      "-1": `${baseUrl}/emojis/-1.png`,
      "100": `${baseUrl}/emojis/100.png`,
      tada: `${baseUrl}/emojis/tada.png`,
      rocket: `${baseUrl}/emojis/rocket.png`,
      heart: `${baseUrl}/emojis/heart.png`,
      eyes: `${baseUrl}/emojis/eyes.png`,
      thinking: `${baseUrl}/emojis/thinking.png`,
      thumbsup: `${baseUrl}/emojis/thumbsup.png`,
      thumbsdown: `${baseUrl}/emojis/thumbsdown.png`
    });
  });
  app.get("/zen", (c) => {
    const phrases = [
      "Non-blocking is better than blocking.",
      "Design for failure.",
      "Half measures are as bad as nothing at all.",
      "Encourage flow.",
      "Anything added dilutes everything else.",
      "Approachable is better than simple.",
      "Mind your words, they are important.",
      "Speak like a human.",
      "It's not fully shipped until it's fast.",
      "Responsive is better than fast.",
      "Keep it logically awesome.",
      "Favor focus over features.",
      "Avoid administrative distraction."
    ];
    return c.text(phrases[Math.floor(Math.random() * phrases.length)]);
  });
  app.get("/versions", (c) => {
    return c.json(["2022-11-28", "2022-08-09"]);
  });
}
var PENDING_CODE_TTL_MS = 10 * 60 * 1e3;
function getPendingCodes(store) {
  let map = store.getData("github.oauth.pendingCodes");
  if (!map) {
    map = /* @__PURE__ */ new Map();
    store.setData("github.oauth.pendingCodes", map);
  }
  return map;
}
function getTokenToClientId(store) {
  let map = store.getData("github.oauth.tokenToClientId");
  if (!map) {
    map = /* @__PURE__ */ new Map();
    store.setData("github.oauth.tokenToClientId", map);
  }
  return map;
}
function getSessionMap(store) {
  let map = store.getData("github.oauth.sessionMap");
  if (!map) {
    map = /* @__PURE__ */ new Map();
    store.setData("github.oauth.sessionMap", map);
  }
  return map;
}
function getPendingCodeIfValid(store, code) {
  const map = getPendingCodes(store);
  const pending = map.get(code);
  if (!pending) return void 0;
  if (Date.now() - pending.created_at > PENDING_CODE_TTL_MS) {
    map.delete(code);
    return void 0;
  }
  return pending;
}
var SERVICE_LABEL = "GitHub";
var DEVICE_GRANT = "urn:ietf:params:oauth:grant-type:device_code";
var DEVICE_CODE_TTL_S = 900;
function getDeviceCodes(store) {
  let map = store.getData("github.oauth.deviceCodes");
  if (!map) {
    map = /* @__PURE__ */ new Map();
    store.setData("github.oauth.deviceCodes", map);
  }
  return map;
}
function oauthRoutes({ app, store, baseUrl, tokenMap }) {
  const gh = getGitHubStore(store);
  function resolveSessionUser(c) {
    const authUser = c.get("authUser");
    if (authUser) {
      const user = gh.users.findOneBy("login", authUser.login);
      if (user) return { login: user.login, id: user.id };
    }
    const cookieHeader = c.req.header("Cookie") ?? "";
    const cookies = parseCookies(cookieHeader);
    const sessionId = cookies["_emu_session"];
    if (sessionId) {
      const login = getSessionMap(store).get(sessionId);
      if (login) {
        const user = gh.users.findOneBy("login", login);
        if (user) return { login: user.login, id: user.id };
      }
    }
    return null;
  }
  app.get("/login/oauth/authorize", (c) => {
    const client_id = c.req.query("client_id") ?? "";
    const redirect_uri = c.req.query("redirect_uri") ?? "";
    const scope = c.req.query("scope") ?? "";
    const state = c.req.query("state") ?? "";
    const oauthAppsConfigured = gh.oauthApps.all().length > 0;
    let oauthAppForSubtitle;
    if (oauthAppsConfigured) {
      const oauthApp = gh.oauthApps.findOneBy("client_id", client_id);
      if (!oauthApp) {
        return c.html(
          renderErrorPage("Application not found", `The client_id '${client_id}' is not registered.`, SERVICE_LABEL),
          400
        );
      }
      if (redirect_uri && !matchesRedirectUri(redirect_uri, oauthApp.redirect_uris)) {
        console.warn(
          `[OAuth] redirect_uri mismatch: got "${redirect_uri}", registered: ${JSON.stringify(oauthApp.redirect_uris)}`
        );
        return c.html(
          renderErrorPage(
            "Redirect URI mismatch",
            "The redirect_uri is not registered for this application.",
            SERVICE_LABEL
          ),
          400
        );
      }
      oauthAppForSubtitle = oauthApp;
    }
    const users = [...gh.users.all()].sort((a, b) => a.login.localeCompare(b.login));
    const subtitleText = oauthAppForSubtitle ? `Authorize <strong>${escapeHtml(oauthAppForSubtitle.name)}</strong> to access your account.` : "Choose a seeded user to authorize this application.";
    const userButtons = users.map((u) => {
      const brief = formatUser(u, baseUrl);
      const full = formatUserFull(u, baseUrl);
      return renderUserButton({
        letter: (brief.login[0] ?? "?").toUpperCase(),
        login: full.login,
        name: full.name ?? void 0,
        email: full.email ?? void 0,
        formAction: "/login/oauth/callback",
        hiddenFields: {
          login: u.login,
          redirect_uri,
          scope,
          state,
          client_id
        }
      });
    }).join("\n");
    const body = users.length === 0 ? '<p class="empty">No users in the emulator store.</p>' : userButtons;
    return c.html(renderCardPage("Sign in to GitHub", subtitleText, body, SERVICE_LABEL));
  });
  app.post("/login/oauth/callback", async (c) => {
    const body = await c.req.parseBody();
    const login = String(body.login ?? "");
    const redirect_uri = String(body.redirect_uri ?? "");
    const scope = String(body.scope ?? "");
    const state = String(body.state ?? "");
    const client_id = String(body.client_id ?? "");
    const code = randomBytes2(20).toString("hex");
    getPendingCodes(store).set(code, {
      login,
      scope,
      redirectUri: redirect_uri,
      clientId: client_id,
      created_at: Date.now()
    });
    debug(
      "github.oauth",
      `[OAuth callback] generated code: ${code.slice(0, 8)}... for login=${login}, pendingCodes size: ${getPendingCodes(store).size}`
    );
    const sessionId = randomBytes2(24).toString("base64url");
    getSessionMap(store).set(sessionId, login);
    c.header("Set-Cookie", `_emu_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax`);
    const sep = redirect_uri.includes("?") ? "&" : "?";
    const target = `${redirect_uri}${sep}code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
    debug("github.oauth", `[OAuth callback] redirecting to: ${target.slice(0, 120)}...`);
    return c.redirect(target, 302);
  });
  app.post("/login/device/code", async (c) => {
    const body = await c.req.parseBody();
    const clientId = String(body.client_id ?? "");
    if (gh.oauthApps.all().length > 0 && !gh.oauthApps.findOneBy("client_id", clientId)) {
      return c.json({ error: "incorrect_client_credentials", error_description: "The client_id is not valid." }, 401);
    }
    const deviceCode = randomBytes2(20).toString("hex");
    const letters = randomBytes2(8).map((byte) => "BCDFGHJKLMNPQRSTVWXZ".charCodeAt(byte % 20));
    const userCode = `${Buffer.from(letters.subarray(0, 4)).toString()}-${Buffer.from(letters.subarray(4)).toString()}`;
    getDeviceCodes(store).set(deviceCode, {
      userCode,
      clientId,
      scope: String(body.scope ?? ""),
      expiresAt: Date.now() + DEVICE_CODE_TTL_S * 1e3
    });
    const result = {
      device_code: deviceCode,
      user_code: userCode,
      verification_uri: `${baseUrl}/login/device`,
      expires_in: DEVICE_CODE_TTL_S,
      interval: 5
    };
    if ((c.req.header("Accept") ?? "").includes("application/json")) return c.json(result);
    c.header("Content-Type", "application/x-www-form-urlencoded");
    return c.body(
      new URLSearchParams(Object.fromEntries(Object.entries(result).map(([k, v]) => [k, String(v)]))).toString(),
      200
    );
  });
  app.get("/login/device", (c) => {
    const userCode = (c.req.query("user_code") ?? "").toUpperCase();
    const users = [...gh.users.all()].sort((a, b) => a.login.localeCompare(b.login));
    const body = users.map(
      (u) => renderUserButton({
        letter: (u.login[0] ?? "?").toUpperCase(),
        login: u.login,
        name: u.name ?? void 0,
        email: u.email ?? void 0,
        formAction: "/login/device",
        hiddenFields: { login: u.login, user_code: userCode }
      })
    ).join("\n");
    return c.html(
      renderCardPage(
        "Device activation",
        userCode ? `Approve code <strong>${escapeHtml(userCode)}</strong> as:` : "Open this page with ?user_code=XXXX-XXXX.",
        body,
        SERVICE_LABEL
      )
    );
  });
  app.post("/login/device", async (c) => {
    const body = await c.req.parseBody();
    const userCode = String(body.user_code ?? "").toUpperCase();
    const device = [...getDeviceCodes(store).values()].find((d) => d.userCode === userCode && d.expiresAt > Date.now());
    if (!device)
      return c.html(renderErrorPage("Code not found", "The code is incorrect or expired.", SERVICE_LABEL), 404);
    if (!gh.users.findOneBy("login", String(body.login ?? ""))) {
      return c.html(renderErrorPage("User not found", "Pick a seeded user.", SERVICE_LABEL), 400);
    }
    device.login = String(body.login);
    return c.html(renderCardPage("Device activated", "You can return to your device.", "", SERVICE_LABEL));
  });
  app.post("/login/oauth/access_token", async (c) => {
    const contentType = c.req.header("Content-Type") ?? "";
    const accept = c.req.header("Accept") ?? "";
    debug("github.oauth", `[OAuth token] Content-Type: ${contentType}`);
    debug("github.oauth", `[OAuth token] Accept: ${accept}`);
    debug("github.oauth", `[OAuth token] pendingCodes size: ${getPendingCodes(store).size}`);
    debug(
      "github.oauth",
      `[OAuth token] pendingCodes keys: ${[...getPendingCodes(store).keys()].map((k) => k.slice(0, 8) + "...").join(", ")}`
    );
    const rawText = await c.req.text();
    debug("github.oauth", `[OAuth token] raw body: ${rawText.slice(0, 500)}`);
    let raw;
    if (contentType.includes("application/json")) {
      try {
        raw = JSON.parse(rawText);
      } catch {
        raw = {};
      }
    } else {
      raw = Object.fromEntries(new URLSearchParams(rawText));
    }
    debug("github.oauth", `[OAuth token] parsed keys: ${Object.keys(raw).join(", ")}`);
    const basic = /^Basic\s+(.+)$/i.exec(c.req.header("Authorization") ?? "");
    if (basic && raw.client_id === void 0) {
      const decoded = Buffer.from(basic[1], "base64").toString("utf8");
      const separator = decoded.indexOf(":");
      const formDecode = (value) => decodeURIComponent(value.replace(/\+/g, " "));
      if (separator > 0) {
        raw.client_id = formDecode(decoded.slice(0, separator));
        raw.client_secret = formDecode(decoded.slice(separator + 1));
      }
    }
    let code = String(raw.code ?? "");
    const deviceGrant = raw.grant_type === DEVICE_GRANT;
    const bodyClientId = String(raw.client_id ?? "");
    const bodyClientSecret = String(raw.client_secret ?? "").slice(0, 4) + "****";
    debug("github.oauth", `[OAuth token] code: ${code.slice(0, 8)}... (len=${code.length})`);
    debug("github.oauth", `[OAuth token] client_id: ${bodyClientId}`);
    debug("github.oauth", `[OAuth token] client_secret: ${bodyClientSecret}`);
    const actualSecret = String(raw.client_secret ?? "");
    const incorrectClientCredentials = () => {
      debug("github.oauth", `[OAuth token] REJECTED: incorrect_client_credentials`);
      return c.json(
        {
          error: "incorrect_client_credentials",
          error_description: "The client_id and/or client_secret passed are incorrect."
        },
        200
      );
    };
    const oauthAppsConfigured = gh.oauthApps.all().length > 0;
    if (oauthAppsConfigured) {
      const oauthApp2 = gh.oauthApps.findOneBy("client_id", bodyClientId);
      if (!oauthApp2) {
        debug("github.oauth", `[OAuth token] REJECTED: client_id not found in oauthApps`);
        return incorrectClientCredentials();
      }
      if (!deviceGrant && !constantTimeSecretEqual(actualSecret, oauthApp2.client_secret)) {
        debug("github.oauth", `[OAuth token] REJECTED: client_secret mismatch`);
        return incorrectClientCredentials();
      }
      debug("github.oauth", `[OAuth token] client credentials OK (app: ${oauthApp2.name})`);
    } else {
      debug("github.oauth", `[OAuth token] no oauth apps configured, skipping client validation`);
    }
    if (deviceGrant) {
      const deviceCode = String(raw.device_code ?? "");
      const device = getDeviceCodes(store).get(deviceCode);
      if (!device || device.clientId !== bodyClientId) {
        return c.json({ error: "incorrect_device_code", error_description: "The device_code provided is not valid." });
      }
      if (device.expiresAt <= Date.now()) {
        getDeviceCodes(store).delete(deviceCode);
        return c.json({ error: "expired_token", error_description: "The device_code has expired." });
      }
      if (!device.login) {
        return c.json({
          error: "authorization_pending",
          error_description: "The authorization request is still pending."
        });
      }
      getDeviceCodes(store).delete(deviceCode);
      code = randomBytes2(20).toString("hex");
      getPendingCodes(store).set(code, {
        login: device.login,
        scope: device.scope,
        redirectUri: "",
        clientId: device.clientId,
        created_at: Date.now()
      });
    }
    const pending = getPendingCodeIfValid(store, code);
    if (!pending) {
      debug("github.oauth", `[OAuth token] REJECTED: code not found in pendingCodes or expired`);
      return c.json(
        { error: "bad_verification_code", error_description: "The code passed is incorrect or expired." },
        200
      );
    }
    debug("github.oauth", `[OAuth token] code valid, login=${pending.login}, scope=${pending.scope}`);
    getPendingCodes(store).delete(code);
    const user = gh.users.findOneBy("login", pending.login);
    if (!user) {
      debug("github.oauth", `[OAuth token] REJECTED: user "${pending.login}" not found in store`);
      return c.json(
        { error: "bad_verification_code", error_description: "The code passed is incorrect or expired." },
        200
      );
    }
    const token = "gho_" + randomBytes2(20).toString("base64url");
    const scopes = pending.scope ? pending.scope.split(/[,\s]+/).filter(Boolean) : ["repo", "user"];
    if (tokenMap) {
      tokenMap.set(token, { login: user.login, id: user.id, scopes });
    }
    const oauthApp = gh.oauthApps.findOneBy("client_id", pending.clientId);
    if (oauthApp) {
      const existingGrant = gh.oauthGrants.all().find((g) => g.user_id === user.id && g.client_id === pending.clientId);
      const orgAccess = {};
      for (const org of gh.orgs.all()) {
        const isMember = gh.teamMembers.all().some((tm) => tm.user_id === user.id && gh.teams.get(tm.team_id)?.org_id === org.id);
        if (isMember) orgAccess[org.login] = "granted";
      }
      if (existingGrant) {
        gh.oauthGrants.update(existingGrant.id, { scopes, org_access: orgAccess });
      } else {
        gh.oauthGrants.insert({
          user_id: user.id,
          oauth_app_id: oauthApp.id,
          client_id: pending.clientId,
          scopes,
          org_access: orgAccess
        });
      }
      getTokenToClientId(store).set(token, pending.clientId);
    }
    debug("github.oauth", `[OAuth token] SUCCESS: issued token for ${user.login} (scopes: ${scopes.join(",")})`);
    const wantsFormEncoded = accept.includes("application/x-www-form-urlencoded");
    const scopeOut = pending.scope;
    if (wantsFormEncoded) {
      const formBody = `access_token=${encodeURIComponent(token)}&token_type=bearer&scope=${encodeURIComponent(scopeOut)}`;
      c.header("Content-Type", "application/x-www-form-urlencoded");
      return c.body(formBody, 200);
    }
    return c.json({
      access_token: token,
      token_type: "bearer",
      scope: scopeOut
    });
  });
  app.get("/user/emails", (c) => {
    const authUser = c.get("authUser");
    if (!authUser) {
      throw unauthorized();
    }
    const user = gh.users.findOneBy("login", authUser.login);
    if (!user) {
      throw unauthorized();
    }
    const email = user.email || `${user.login}@users.noreply.localhost`;
    return c.json([
      {
        email,
        primary: true,
        verified: true,
        visibility: "public"
      }
    ]);
  });
  const SCOPE_LABELS = {
    repo: "Full control of private repositories",
    "read:user": "Read all user profile data",
    "user:email": "Access user email addresses (read-only)",
    user: "Full control of user profile",
    workflow: "Update GitHub action workflows",
    "admin:org": "Full control of orgs and teams",
    "admin:repo_hook": "Full control of repository hooks",
    "read:org": "Read org and team membership",
    "write:repo_hook": "Write repository hooks",
    "read:repo_hook": "Read repository hooks",
    delete_repo: "Delete repositories",
    gist: "Create gists",
    notifications: "Access notifications",
    "write:packages": "Upload packages",
    "read:packages": "Download packages",
    "admin:gpg_key": "Full control of GPG keys",
    "admin:public_key": "Full control of public keys"
  };
  function scopeLabel(scope) {
    return SCOPE_LABELS[scope] ?? scope;
  }
  const sidebarHtml = `
    <a href="/settings/applications" class="active">Authorized Apps</a>`;
  app.get("/settings/applications", (c) => {
    const sessionUser = resolveSessionUser(c);
    if (!sessionUser) {
      return c.html(
        renderErrorPage("Unauthorized", "You must be authenticated to view this page.", SERVICE_LABEL),
        401
      );
    }
    const grants = gh.oauthGrants.findBy("user_id", sessionUser.id);
    let bodyHtml;
    if (grants.length === 0) {
      bodyHtml = `
        <div class="section-heading">Authorized OAuth Apps</div>
        <div class="s-card">
          <p class="empty">No authorized applications. Apps you authorize will appear here.</p>
        </div>`;
    } else {
      const appLinks = grants.map((grant) => {
        const oauthApp = gh.oauthApps.findOneBy("client_id", grant.client_id);
        const name = oauthApp?.name ?? grant.client_id;
        const letter = escapeHtml((name[0] ?? "?").toUpperCase());
        const scopeText = grant.scopes.length > 0 ? grant.scopes.join(", ") : "No scopes";
        return `<a href="/settings/connections/applications/${escapeAttr(grant.client_id)}" class="app-link">
          <div class="s-icon">${letter}</div>
          <div>
            <div class="app-link-name">${escapeHtml(name)}</div>
            <div class="app-link-scopes">${escapeHtml(scopeText)}</div>
          </div>
        </a>`;
      }).join("\n");
      bodyHtml = `
        <div class="section-heading">Authorized OAuth Apps</div>
        <div class="s-card">${appLinks}</div>`;
    }
    return c.html(renderSettingsPage("Authorized OAuth Apps", sidebarHtml, bodyHtml, SERVICE_LABEL));
  });
  app.get("/settings/connections/applications/:client_id", (c) => {
    const sessionUser = resolveSessionUser(c);
    if (!sessionUser) {
      return c.html(
        renderErrorPage("Unauthorized", "You must be authenticated to view this page.", SERVICE_LABEL),
        401
      );
    }
    const clientId = c.req.param("client_id");
    const grant = gh.oauthGrants.all().find((g) => g.user_id === sessionUser.id && g.client_id === clientId);
    if (!grant) {
      return c.html(renderErrorPage("Not Found", "No authorization found for this application.", SERVICE_LABEL), 404);
    }
    const oauthApp = gh.oauthApps.findOneBy("client_id", clientId);
    const appName = oauthApp?.name ?? clientId;
    const appLetter = escapeHtml((appName[0] ?? "?").toUpperCase());
    const lastUsed = new Date(grant.updated_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const permRows = grant.scopes.map((s) => `<li><span class="check">&#10003;</span> ${escapeHtml(scopeLabel(s))}</li>`).join("\n");
    const orgRows = Object.entries(grant.org_access).map(([org, status]) => {
      const letter = escapeHtml((org[0] ?? "?").toUpperCase());
      const badgeClass = status === "granted" ? "badge-granted" : status === "denied" ? "badge-denied" : "badge-requested";
      const icon = status === "granted" ? "&#10003;" : status === "denied" ? "&#10007;" : "&#8943;";
      return `<div class="org-row">
        <div class="org-icon">${letter}</div>
        <span class="org-name">${escapeHtml(org)}</span>
        <span class="badge ${badgeClass}">${icon}</span>
      </div>`;
    }).join("\n");
    const bodyHtml = `
      <div class="s-card">
        <div class="s-card-header">
          <div class="s-icon">${appLetter}</div>
          <div>
            <div class="s-title">${escapeHtml(appName)}</div>
            <div class="s-subtitle">Last used: ${escapeHtml(lastUsed)}</div>
          </div>
        </div>
      </div>

      <div class="s-card">
        <div class="section-heading">
          <span>Permissions</span>
          <form method="post" action="/settings/connections/applications/${escapeAttr(clientId)}/revoke" style="display:inline">
            <button type="submit" class="btn-revoke">Revoke access</button>
          </form>
        </div>
        <ul class="perm-list">
          ${permRows || '<li style="color:#1a8c00">No specific permissions granted.</li>'}
        </ul>
      </div>

      ${orgRows ? `<div class="s-card">
        <div class="section-heading">Organization access</div>
        ${orgRows}
        <p class="info-text">Applications act on your behalf. Organizations control which apps may access their private data.</p>
      </div>` : ""}`;
    return c.html(renderSettingsPage(appName, sidebarHtml, bodyHtml, SERVICE_LABEL));
  });
  app.post("/settings/connections/applications/:client_id/revoke", (c) => {
    const sessionUser = resolveSessionUser(c);
    if (!sessionUser) {
      return c.html(
        renderErrorPage("Unauthorized", "You must be authenticated to perform this action.", SERVICE_LABEL),
        401
      );
    }
    const clientId = c.req.param("client_id");
    const grant = gh.oauthGrants.all().find((g) => g.user_id === sessionUser.id && g.client_id === clientId);
    if (grant) {
      gh.oauthGrants.delete(grant.id);
    }
    if (tokenMap) {
      for (const [token, tokenUser] of tokenMap.entries()) {
        if (tokenUser.login === sessionUser.login && getTokenToClientId(store).get(token) === clientId) {
          tokenMap.delete(token);
          getTokenToClientId(store).delete(token);
        }
      }
    }
    return c.redirect("/settings/applications", 302);
  });
}
function appsRoutes({ app, store, baseUrl, tokenMap }) {
  const gh = getGitHubStore(store);
  function requireApp(c) {
    const authApp = c.get("authApp");
    if (!authApp) {
      c.status(401);
      return null;
    }
    return authApp;
  }
  app.get("/app", (c) => {
    const authApp = requireApp(c);
    if (!authApp) {
      return c.json(
        {
          message: "A JSON web token could not be decoded",
          documentation_url: "https://docs.github.com/rest"
        },
        401
      );
    }
    const ghApp = gh.apps.all().find((a) => a.app_id === authApp.appId);
    if (!ghApp) {
      return c.json({ message: "Not Found" }, 404);
    }
    const installations = gh.appInstallations.findBy("app_id", ghApp.app_id);
    return c.json({
      id: ghApp.app_id,
      slug: ghApp.slug,
      node_id: generateNodeId("App", ghApp.app_id),
      name: ghApp.name,
      description: ghApp.description,
      external_url: `${baseUrl}/apps/${ghApp.slug}`,
      html_url: `${baseUrl}/apps/${ghApp.slug}`,
      created_at: ghApp.created_at,
      updated_at: ghApp.updated_at,
      permissions: ghApp.permissions,
      events: ghApp.events,
      installations_count: installations.length,
      owner: null
    });
  });
  app.get("/app/installations", (c) => {
    const authApp = requireApp(c);
    if (!authApp) {
      return c.json(
        {
          message: "A JSON web token could not be decoded",
          documentation_url: "https://docs.github.com/rest"
        },
        401
      );
    }
    const installations = gh.appInstallations.findBy("app_id", authApp.appId);
    const ghApp = gh.apps.all().find((a) => a.app_id === authApp.appId);
    return c.json(installations.map((inst) => formatInstallation(inst, ghApp, baseUrl)));
  });
  app.get("/app/installations/:installation_id", (c) => {
    const authApp = requireApp(c);
    if (!authApp) {
      return c.json(
        {
          message: "A JSON web token could not be decoded",
          documentation_url: "https://docs.github.com/rest"
        },
        401
      );
    }
    const installationId = parseInt(c.req.param("installation_id"), 10);
    const inst = gh.appInstallations.all().find((i) => i.installation_id === installationId && i.app_id === authApp.appId);
    if (!inst) {
      return c.json({ message: "Not Found", documentation_url: "https://docs.github.com/rest" }, 404);
    }
    const ghApp = gh.apps.all().find((a) => a.app_id === authApp.appId);
    return c.json(formatInstallation(inst, ghApp, baseUrl));
  });
  app.post("/app/installations/:installation_id/access_tokens", async (c) => {
    const authApp = requireApp(c);
    if (!authApp) {
      return c.json(
        {
          message: "A JSON web token could not be decoded",
          documentation_url: "https://docs.github.com/rest"
        },
        401
      );
    }
    const installationId = parseInt(c.req.param("installation_id"), 10);
    const inst = gh.appInstallations.all().find((i) => i.installation_id === installationId && i.app_id === authApp.appId);
    if (!inst) {
      return c.json({ message: "Not Found", documentation_url: "https://docs.github.com/rest" }, 404);
    }
    let requestedPermissions = inst.permissions;
    let requestedRepoIds = inst.repository_ids;
    let tokenRepositorySelection = inst.repository_selection;
    try {
      const body = await c.req.json();
      if (body.permissions && typeof body.permissions === "object") {
        const requested = body.permissions;
        requestedPermissions = Object.fromEntries(
          Object.entries(requested).filter((entry) => typeof entry[1] === "string")
        );
      }
      if (body.repositories !== void 0 && body.repository_ids !== void 0) {
        return c.json({ message: "Only one of repositories or repository_ids may be specified." }, 422);
      }
      if (body.repositories !== void 0) {
        if (!Array.isArray(body.repositories) || body.repositories.length > 500 || body.repositories.some((name) => typeof name !== "string")) {
          return c.json({ message: "The repositories field must contain up to 500 repository names." }, 422);
        }
        const accountRepos = gh.repos.all().filter((repo) => repo.owner_id === inst.account_id && repo.owner_type === inst.account_type);
        const resolvedIds = [];
        for (const name of body.repositories) {
          const repo = accountRepos.find((candidate) => candidate.name.toLowerCase() === name.toLowerCase());
          if (!repo) {
            return c.json({ message: "The repositories requested are not accessible to this installation." }, 422);
          }
          resolvedIds.push(repo.id);
        }
        requestedRepoIds = [...new Set(resolvedIds)];
        tokenRepositorySelection = "selected";
      }
      if (body.repository_ids !== void 0) {
        if (!Array.isArray(body.repository_ids) || body.repository_ids.length > 500 || body.repository_ids.some((id) => typeof id !== "number")) {
          return c.json({ message: "The repository_ids field must contain up to 500 repository IDs." }, 422);
        }
        requestedRepoIds = [...new Set(body.repository_ids)];
        tokenRepositorySelection = "selected";
      }
    } catch {
    }
    const permissionRank = (permission) => permission === "write" ? 2 : permission === "read" ? 1 : 0;
    const invalidPermission = Object.entries(requestedPermissions).some(
      ([name, permission]) => permissionRank(permission) === 0 || permissionRank(permission) > permissionRank(inst.permissions[name])
    );
    if (invalidPermission) {
      return c.json({ message: "The permissions requested are not granted to this installation." }, 422);
    }
    const unavailableRepo = requestedRepoIds.some((id) => {
      const repo = gh.repos.get(id);
      if (!repo || repo.owner_id !== inst.account_id || repo.owner_type !== inst.account_type) return true;
      return inst.repository_selection === "selected" && !inst.repository_ids.includes(id);
    });
    if (unavailableRepo) {
      return c.json({ message: "The repositories requested are not accessible to this installation." }, 422);
    }
    const token = "ghs_" + randomBytes3(20).toString("base64url");
    const issuedAt = (/* @__PURE__ */ new Date()).toISOString();
    const expiresAt = new Date(Date.parse(issuedAt) + 60 * 60 * 1e3).toISOString();
    getGitHubStore(store).installationTokenMetadata.insert({
      app_id: authApp.appId,
      app_slug: authApp.slug,
      app_name: authApp.name,
      installation_id: inst.installation_id,
      account_id: inst.account_id,
      account_login: inst.account_login,
      account_type: inst.account_type,
      permissions: { ...requestedPermissions },
      repository_ids: [...requestedRepoIds],
      repository_selection: tokenRepositorySelection,
      issued_at: issuedAt,
      expires_at: expiresAt
    });
    if (tokenMap) {
      tokenMap.set(token, {
        login: inst.account_login,
        id: inst.account_id,
        scopes: Object.entries(requestedPermissions).map(([k, v]) => `${k}:${v}`),
        installation: {
          installationId: inst.installation_id,
          appId: inst.app_id,
          accountId: inst.account_id,
          accountType: inst.account_type,
          permissions: { ...requestedPermissions },
          repositoryIds: [...requestedRepoIds],
          repositorySelection: tokenRepositorySelection
        }
      });
    }
    const repos = requestedRepoIds.map((id) => gh.repos.get(id)).filter(Boolean).map((r) => ({
      id: r.id,
      node_id: r.node_id,
      name: r.name,
      full_name: r.full_name,
      private: r.private
    }));
    return c.json(
      {
        token,
        expires_at: expiresAt,
        permissions: requestedPermissions,
        repository_selection: tokenRepositorySelection,
        ...tokenRepositorySelection === "selected" ? { repositories: repos } : {}
      },
      201
    );
  });
  app.get("/repos/:owner/:repo/installation", (c) => {
    const owner = c.req.param("owner");
    const repoName = c.req.param("repo");
    const fullName = `${owner}/${repoName}`;
    const repo = gh.repos.findOneBy("full_name", fullName);
    if (!repo) {
      return c.json({ message: "Not Found", documentation_url: "https://docs.github.com/rest" }, 404);
    }
    for (const inst of gh.appInstallations.all()) {
      if (inst.repository_selection === "all" && inst.account_id === repo.owner_id && inst.account_type === repo.owner_type) {
        const ghApp = gh.apps.all().find((a) => a.app_id === inst.app_id);
        return c.json(formatInstallation(inst, ghApp, baseUrl));
      }
      if (inst.repository_selection === "selected" && inst.repository_ids.includes(repo.id)) {
        const ghApp = gh.apps.all().find((a) => a.app_id === inst.app_id);
        return c.json(formatInstallation(inst, ghApp, baseUrl));
      }
    }
    return c.json({ message: "Not Found", documentation_url: "https://docs.github.com/rest" }, 404);
  });
  app.get("/orgs/:org/installation", (c) => {
    const orgLogin = c.req.param("org");
    const org = gh.orgs.findOneBy("login", orgLogin);
    if (!org) {
      return c.json({ message: "Not Found", documentation_url: "https://docs.github.com/rest" }, 404);
    }
    const inst = gh.appInstallations.all().find((i) => i.account_id === org.id && i.account_type === "Organization");
    if (!inst) {
      return c.json({ message: "Not Found", documentation_url: "https://docs.github.com/rest" }, 404);
    }
    const ghApp = gh.apps.all().find((a) => a.app_id === inst.app_id);
    return c.json(formatInstallation(inst, ghApp, baseUrl));
  });
  app.get("/users/:username/installation", (c) => {
    const username = c.req.param("username");
    const user = gh.users.findOneBy("login", username);
    if (!user) {
      return c.json({ message: "Not Found", documentation_url: "https://docs.github.com/rest" }, 404);
    }
    const inst = gh.appInstallations.all().find((i) => i.account_id === user.id && i.account_type === "User");
    if (!inst) {
      return c.json({ message: "Not Found", documentation_url: "https://docs.github.com/rest" }, 404);
    }
    const ghApp = gh.apps.all().find((a) => a.app_id === inst.app_id);
    return c.json(formatInstallation(inst, ghApp, baseUrl));
  });
  function formatInstallation(inst, ghApp, baseUrl2) {
    const account = inst.account_type === "Organization" ? gh.orgs.get(inst.account_id) : gh.users.get(inst.account_id);
    return {
      id: inst.installation_id,
      account: account ? {
        login: account.login,
        id: account.id,
        node_id: account.node_id,
        type: inst.account_type,
        avatar_url: `${baseUrl2}/avatars/u/${account.login}`,
        url: `${baseUrl2}/${inst.account_type === "Organization" ? "orgs" : "users"}/${account.login}`
      } : null,
      repository_selection: inst.repository_selection,
      access_tokens_url: `${baseUrl2}/app/installations/${inst.installation_id}/access_tokens`,
      repositories_url: `${baseUrl2}/installation/repositories`,
      html_url: `${baseUrl2}/settings/installations/${inst.installation_id}`,
      app_id: inst.app_id,
      app_slug: ghApp?.slug ?? null,
      target_type: inst.account_type,
      permissions: inst.permissions,
      events: inst.events,
      created_at: inst.created_at,
      updated_at: inst.updated_at,
      single_file_name: null,
      has_multiple_single_files: false,
      single_file_paths: [],
      suspended_by: null,
      suspended_at: inst.suspended_at
    };
  }
}
function installationTokenRoutes(ctx) {
  const { app, store } = ctx;
  app.get("/_emulate/installation-tokens", (c) => {
    const now = Date.now();
    const installationTokens = getGitHubStore(store).installationTokenMetadata.all().map((entry) => ({
      app: {
        id: entry.app_id,
        slug: entry.app_slug,
        name: entry.app_name
      },
      installation: {
        id: entry.installation_id
      },
      account: {
        id: entry.account_id,
        login: entry.account_login,
        type: entry.account_type
      },
      permissions: { ...entry.permissions },
      repository_selection: entry.repository_selection,
      repository_ids: [...entry.repository_ids],
      issued_at: entry.issued_at,
      expires_at: entry.expires_at,
      status: now < Date.parse(entry.expires_at) ? "active" : "expired"
    }));
    return c.json({ installation_tokens: installationTokens });
  });
}
function generateAppPrivateKey() {
  return new Promise((resolve, reject) => {
    generateKeyPair(
      "rsa",
      {
        modulusLength: 2048,
        privateKeyEncoding: { type: "pkcs1", format: "pem" },
        publicKeyEncoding: { type: "pkcs1", format: "pem" }
      },
      (error, _publicKey, privateKey) => {
        if (error) reject(error);
        else resolve(privateKey);
      }
    );
  });
}
async function materializeGitHubSeedConfig(config) {
  const appIds = /* @__PURE__ */ new Set();
  const slugs = /* @__PURE__ */ new Set();
  for (const app of config.apps ?? []) {
    if (app.private_key === "") {
      throw new Error(`GitHub App "${app.slug}" private_key must not be empty`);
    }
    if (appIds.has(app.app_id)) {
      throw new Error(`Duplicate GitHub App app_id: ${app.app_id}`);
    }
    if (slugs.has(app.slug)) {
      throw new Error(`Duplicate GitHub App slug: "${app.slug}"`);
    }
    appIds.add(app.app_id);
    slugs.add(app.slug);
  }
  const generatedPrivateKeys = [];
  const apps = [];
  for (const app of config.apps ?? []) {
    if (app.private_key !== void 0) {
      apps.push({ ...app });
      continue;
    }
    const privateKey = await generateAppPrivateKey();
    generatedPrivateKeys.push({
      app_id: app.app_id,
      slug: app.slug,
      name: app.name,
      private_key: privateKey
    });
    apps.push({ ...app, private_key: privateKey });
  }
  return {
    config: config.apps ? { ...config, apps } : { ...config },
    generatedPrivateKeys
  };
}
async function prepareSeed(config, generatedSecrets = []) {
  const restoredKeys = new Map(
    generatedSecrets.filter((secret) => secret.kind === "github.app_private_key").map((secret) => [secret.id, secret.value])
  );
  const restoredConfig = {
    ...config,
    apps: config.apps?.map((app) => {
      if (app.private_key !== void 0) return app;
      const privateKey = restoredKeys.get(String(app.app_id));
      if (!privateKey) return app;
      return { ...app, private_key: privateKey };
    })
  };
  const materialized = await materializeGitHubSeedConfig(restoredConfig);
  const nextGeneratedSecrets = generatedSecrets.map((secret) => ({ ...secret }));
  const generatedIds = new Set(
    nextGeneratedSecrets.filter((secret) => secret.kind === "github.app_private_key").map((secret) => secret.id)
  );
  for (const key of materialized.generatedPrivateKeys) {
    const id = String(key.app_id);
    if (generatedIds.has(id)) continue;
    nextGeneratedSecrets.push({
      kind: "github.app_private_key",
      id,
      label: key.name,
      value: key.private_key
    });
  }
  return {
    config: materialized.config,
    generatedSecrets: nextGeneratedSecrets
  };
}
function needsGeneratedSecrets(config) {
  return (config.apps ?? []).some((app) => app.private_key === void 0);
}
function createAppKeyResolver(store) {
  return (appId) => {
    try {
      const gh = getGitHubStore(store);
      const ghApp = gh.apps.all().find((app) => app.app_id === appId);
      if (!ghApp) return null;
      return { privateKey: ghApp.private_key, slug: ghApp.slug, name: ghApp.name };
    } catch {
      return null;
    }
  };
}
function seedDefaults(store, baseUrl) {
  const gh = getGitHubStore(store);
  const ghost = gh.users.insert({
    login: "ghost",
    node_id: "",
    avatar_url: `${baseUrl}/avatars/u/ghost`,
    gravatar_id: "",
    type: "User",
    site_admin: false,
    name: "Ghost",
    company: null,
    blog: "",
    location: null,
    email: null,
    hireable: null,
    bio: null,
    twitter_username: null,
    public_repos: 0,
    public_gists: 0,
    followers: 0,
    following: 0
  });
  gh.users.update(ghost.id, { node_id: generateNodeId("User", ghost.id) });
  const admin = gh.users.insert({
    login: "admin",
    node_id: "",
    avatar_url: `${baseUrl}/avatars/u/admin`,
    gravatar_id: "",
    type: "User",
    site_admin: true,
    name: "Admin",
    company: null,
    blog: "",
    location: null,
    email: "admin@localhost",
    hireable: null,
    bio: "Default admin user",
    twitter_username: null,
    public_repos: 0,
    public_gists: 0,
    followers: 0,
    following: 0
  });
  gh.users.update(admin.id, { node_id: generateNodeId("User", admin.id) });
}
function seedFromConfig(store, baseUrl, config) {
  for (const app of config.apps ?? []) {
    if (!app.private_key) {
      throw new Error(
        `GitHub App "${app.slug}" requires private_key when seedFromConfig is called directly; use createEmulator to generate one`
      );
    }
  }
  const gh = getGitHubStore(store);
  if (config.users) {
    for (const u of config.users) {
      const existing = gh.users.findOneBy("login", u.login);
      if (existing) continue;
      const user = gh.users.insert({
        login: u.login,
        node_id: "",
        avatar_url: `${baseUrl}/avatars/u/${u.login}`,
        gravatar_id: "",
        type: "User",
        site_admin: u.site_admin ?? false,
        name: u.name ?? null,
        company: u.company ?? null,
        blog: u.blog ?? "",
        location: u.location ?? null,
        email: u.email ?? null,
        hireable: null,
        bio: u.bio ?? null,
        twitter_username: u.twitter_username ?? null,
        public_repos: 0,
        public_gists: 0,
        followers: 0,
        following: 0
      });
      gh.users.update(user.id, { node_id: generateNodeId("User", user.id) });
    }
  }
  if (config.orgs) {
    for (const o of config.orgs) {
      const existing = gh.orgs.findOneBy("login", o.login);
      if (existing) continue;
      const org = gh.orgs.insert({
        login: o.login,
        node_id: "",
        description: o.description ?? null,
        name: o.name ?? null,
        company: null,
        blog: "",
        location: null,
        email: o.email ?? null,
        twitter_username: null,
        is_verified: false,
        has_organization_projects: true,
        has_repository_projects: true,
        public_repos: 0,
        public_gists: 0,
        followers: 0,
        following: 0,
        members_can_create_repositories: true,
        default_repository_permission: "read",
        billing_email: null
      });
      gh.orgs.update(org.id, { node_id: generateNodeId("Org", org.id) });
    }
  }
  if (config.orgs) {
    for (const orgConfig of config.orgs) {
      const org = gh.orgs.findOneBy("login", orgConfig.login);
      if (!org) continue;
      const membersTeam = getOrCreateMembersTeam(gh, org);
      for (const memberConfig of orgConfig.members ?? []) {
        const user = gh.users.findOneBy("login", memberConfig.login);
        if (!user) continue;
        const role = memberConfig.role === "admin" ? "maintainer" : "member";
        const existing = gh.teamMembers.findBy("team_id", membersTeam.id).find((member) => member.user_id === user.id);
        if (existing) {
          gh.teamMembers.update(existing.id, { role });
        } else {
          gh.teamMembers.insert({ team_id: membersTeam.id, user_id: user.id, role });
        }
      }
      gh.teams.update(membersTeam.id, {
        members_count: gh.teamMembers.findBy("team_id", membersTeam.id).length
      });
    }
  }
  if (config.repos) {
    for (const r of config.repos) {
      const ownerUser = gh.users.findOneBy("login", r.owner);
      const owner = ownerUser ?? gh.orgs.findOneBy("login", r.owner);
      if (!owner) continue;
      const fullName = `${r.owner}/${r.name}`;
      const existing = gh.repos.findOneBy("full_name", fullName);
      if (existing) continue;
      const ownerType = ownerUser ? "User" : "Organization";
      const defaultBranch = r.default_branch ?? "main";
      const repo = gh.repos.insert({
        node_id: "",
        name: r.name,
        full_name: fullName,
        owner_id: owner.id,
        owner_type: ownerType,
        private: r.private ?? false,
        description: r.description ?? null,
        fork: false,
        forked_from_id: null,
        homepage: null,
        language: r.language ?? null,
        languages: r.language ? { [r.language]: 1e4 } : {},
        forks_count: 0,
        stargazers_count: 0,
        watchers_count: 0,
        size: 0,
        default_branch: defaultBranch,
        open_issues_count: 0,
        topics: r.topics ?? [],
        has_issues: true,
        has_projects: true,
        has_wiki: true,
        has_pages: false,
        has_downloads: true,
        has_discussions: false,
        archived: false,
        disabled: false,
        visibility: r.private ? "private" : "public",
        pushed_at: null,
        allow_rebase_merge: true,
        allow_squash_merge: true,
        allow_merge_commit: true,
        allow_auto_merge: false,
        delete_branch_on_merge: false,
        allow_forking: true,
        is_template: false,
        license: null
      });
      gh.repos.update(repo.id, { node_id: generateNodeId("Repository", repo.id) });
      if (r.auto_init !== false) {
        const readme = `# ${r.name}
${r.description ? `
${r.description}
` : ""}`;
        const readmeSize = Buffer.byteLength(readme, "utf8");
        const blob = findOrCreateBlob(gh, repo.id, Buffer.from(readme, "utf8"));
        const tree = findOrCreateTree(gh, repo.id, [
          { path: "README.md", mode: "100644", type: "blob", sha: blob.sha, size: readmeSize }
        ]);
        const commit = findOrCreateCommit(gh, repo.id, {
          message: "Initial commit",
          author_name: r.owner,
          author_email: `${r.owner}@localhost`,
          author_date: repo.created_at,
          committer_name: r.owner,
          committer_email: `${r.owner}@localhost`,
          committer_date: repo.created_at,
          tree_sha: tree.sha,
          parent_shas: [],
          user_id: owner.id
        });
        gh.branches.insert({
          repo_id: repo.id,
          name: defaultBranch,
          sha: commit.sha,
          protected: false
        });
        const refRow = gh.refs.insert({
          repo_id: repo.id,
          ref: `refs/heads/${defaultBranch}`,
          sha: commit.sha,
          node_id: ""
        });
        gh.refs.update(refRow.id, { node_id: generateNodeId("Ref", refRow.id) });
        gh.repos.update(repo.id, { pushed_at: repo.created_at, size: 1 });
      }
      if (ownerType === "User") {
        const user = gh.users.findOneBy("login", r.owner);
        if (user && !r.private) {
          gh.users.update(user.id, { public_repos: user.public_repos + 1 });
        }
      } else {
        const org = gh.orgs.findOneBy("login", r.owner);
        if (org && !r.private) {
          gh.orgs.update(org.id, { public_repos: org.public_repos + 1 });
        }
      }
    }
  }
  if (config.oauth_apps) {
    for (const oa of config.oauth_apps) {
      const existing = gh.oauthApps.findOneBy("client_id", oa.client_id);
      if (existing) continue;
      gh.oauthApps.insert({
        client_id: oa.client_id,
        client_secret: oa.client_secret,
        name: oa.name,
        redirect_uris: oa.redirect_uris
      });
    }
  }
  if (config.apps) {
    for (const a of config.apps) {
      const existingApp = gh.apps.findOneBy("slug", a.slug);
      if (existingApp) continue;
      const privateKey = a.private_key;
      if (!privateKey) {
        throw new Error(`GitHub App "${a.slug}" requires private_key`);
      }
      gh.apps.insert({
        app_id: a.app_id,
        slug: a.slug,
        name: a.name,
        private_key: privateKey,
        permissions: a.permissions ?? {},
        events: a.events ?? [],
        webhook_url: a.webhook_url ?? null,
        webhook_secret: a.webhook_secret ?? null,
        description: a.description ?? null
      });
      if (a.installations) {
        for (const inst of a.installations) {
          const account = gh.users.findOneBy("login", inst.account) ?? gh.orgs.findOneBy("login", inst.account);
          if (!account) continue;
          const accountType = gh.users.findOneBy("login", inst.account) ? "User" : "Organization";
          const repoIds = [];
          if (inst.repositories) {
            for (const repoFullName of inst.repositories) {
              const fullName = repoFullName.includes("/") ? repoFullName : `${inst.account}/${repoFullName}`;
              const repo = gh.repos.findOneBy("full_name", fullName);
              if (repo) repoIds.push(repo.id);
            }
          }
          gh.appInstallations.insert({
            installation_id: inst.installation_id,
            app_id: a.app_id,
            account_type: accountType,
            account_id: account.id,
            account_login: inst.account,
            repository_selection: inst.repository_selection ?? "all",
            repository_ids: repoIds,
            permissions: inst.permissions ?? a.permissions ?? {},
            events: inst.events ?? a.events ?? [],
            suspended_at: null
          });
        }
      }
    }
  }
}
function findInstallationsForRepo(gh, ownerLogin2, repoName, event) {
  const repoEntity = repoName ? gh.repos.findOneBy("full_name", `${ownerLogin2}/${repoName}`) : null;
  const ownerUser = gh.users.findOneBy("login", ownerLogin2);
  const ownerOrg = gh.orgs.findOneBy("login", ownerLogin2);
  const ownerId = repoEntity?.owner_id ?? ownerUser?.id ?? ownerOrg?.id;
  const ownerType = repoEntity?.owner_type ?? (ownerUser ? "User" : ownerOrg ? "Organization" : void 0);
  if (ownerId === void 0 || ownerType === void 0) return [];
  const results = [];
  for (const inst of gh.appInstallations.all()) {
    if (inst.account_id !== ownerId || inst.account_type !== ownerType) continue;
    if (inst.suspended_at) continue;
    const ghApp = gh.apps.all().find((a) => a.app_id === inst.app_id);
    if (!ghApp) continue;
    if (!ghApp.events.includes(event) && !ghApp.events.includes("*")) continue;
    if (repoEntity && inst.repository_selection === "selected") {
      if (!inst.repository_ids.includes(repoEntity.id)) continue;
    }
    results.push(inst);
  }
  return results;
}
function enrichPayloadWithInstallation(payload, installation) {
  if (!payload || typeof payload !== "object") return payload;
  return {
    ...payload,
    installation: {
      id: installation.installation_id,
      node_id: generateNodeId("Installation", installation.installation_id)
    }
  };
}
async function deliverToAppWebhookUrls(gh, event, action, payload, ownerLogin2, repoName) {
  const installations = findInstallationsForRepo(gh, ownerLogin2, repoName, event);
  for (const inst of installations) {
    const ghApp = gh.apps.all().find((a) => a.app_id === inst.app_id);
    if (!ghApp?.webhook_url) continue;
    const enriched = enrichPayloadWithInstallation(payload, inst);
    const body = JSON.stringify(enriched);
    const headers = {
      "Content-Type": "application/json",
      "X-GitHub-Event": event,
      "X-GitHub-Delivery": String(Date.now())
    };
    if (ghApp.webhook_secret) {
      const hmac = createHmac("sha256", ghApp.webhook_secret).update(body).digest("hex");
      headers["X-Hub-Signature-256"] = `sha256=${hmac}`;
    }
    try {
      await fetch(ghApp.webhook_url, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(1e4)
      });
    } catch {
    }
  }
}
var githubPlugin = {
  name: "github",
  register(app, store, webhooks, baseUrl, tokenMap) {
    const gh = getGitHubStore(store);
    const originalDispatch = webhooks.dispatch.bind(webhooks);
    webhooks.dispatch = async (event, action, payload, owner, repo) => {
      const installations = findInstallationsForRepo(gh, owner, repo, event);
      const enrichedPayload = installations.length > 0 ? enrichPayloadWithInstallation(payload, installations[0]) : payload;
      await originalDispatch(event, action, enrichedPayload, owner, repo);
      await deliverToAppWebhookUrls(gh, event, action, payload, owner, repo);
    };
    const ctx = { app, store, webhooks, baseUrl, tokenMap };
    usersRoutes(ctx);
    reposRoutes(ctx);
    issuesRoutes(ctx);
    pullsRoutes(ctx);
    commentsRoutes(ctx);
    reviewsRoutes(ctx);
    labelsAndMilestonesRoutes(ctx);
    branchesAndGitRoutes(ctx);
    orgsAndTeamsRoutes(ctx);
    releasesRoutes(ctx);
    webhooksRoutes(ctx);
    searchRoutes(ctx);
    actionsRoutes(ctx);
    checksRoutes(ctx);
    rateLimitRoutes(ctx);
    metaRoutes(ctx);
    oauthRoutes(ctx);
    appsRoutes(ctx);
    installationTokenRoutes(ctx);
    contentsRoutes(ctx);
    commitsRoutes(ctx);
  },
  seed(store, baseUrl) {
    seedDefaults(store, baseUrl);
  }
};
var index_default = githubPlugin;
export {
  createAppKeyResolver,
  index_default as default,
  getGitHubStore,
  githubPlugin,
  materializeGitHubSeedConfig,
  needsGeneratedSecrets,
  prepareSeed,
  seedFromConfig
};
/*!
 * This HTTP compatibility layer builds on Hono's API and design.
 * https://github.com/honojs/hono
 * Copyright (c) 2021 - present, Yusuke Wada and Hono contributors
 * MIT license: see THIRD_PARTY_NOTICES.md in the repository and npm packages.
 */
//# sourceMappingURL=dist-RDG5UJO3.js.map