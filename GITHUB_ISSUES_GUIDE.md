# GitHub Issues & Milestones Guide for AI Dev Agents

This guide defines the workflow and discipline required for AI development agents to manage tasks, track progress, and update milestones using GitHub Issues. 

Follow these instructions at the start of every session and during development.

---

## 🛠️ Step 1: Initialization (Start of Session/Chat)

Before writing any code or making changes, the agent must check the current state of the project:
1. **List Milestones:** Fetch all milestones to understand the active phase of the project.
2. **List Open Issues:** Retrieve open issues to see what is currently pending or in progress.
3. **Align with the User:** Verify which issue/milestone is the immediate focus of this session.

---

## 📝 Step 2: Issue Creation & Structure

When a new task, feature, or bug is identified, the agent must create a GitHub Issue before starting work.

### Issue Format
Every issue must follow this clean structure:
```markdown
## Description
[A concise explanation of what needs to be built or fixed and why.]

## Acceptance Criteria
- [ ] Criteria 1 (e.g., UI component matches design)
- [ ] Criteria 2 (e.g., API returns 200 OK with correct payload)
- [ ] Criteria 3 (e.g., Mobile responsive layout tested)

## Technical Approach (Optional but recommended)
- [Brief outline of the files to modify or create]
```

### Metadata Configuration
* **Milestone:** Assign the issue to the current active milestone.
* **Labels:** Assign relevant labels from the following available project labels:
  - `bug` — Something isn't working
  - `documentation` — Improvements or additions to documentation
  - `duplicate` — This issue or pull request already exists
  - `enhancement` — New feature or request
  - `good first issue` — Good for newcomers
  - `help wanted` — Extra attention is needed
  - `invalid` — This doesn't seem right
  - `question` — Further information is requested
  - `wontfix` — This will not be worked on

---

## 🔄 Step 3: Development & Updates (In Progress)

During development, the agent must keep the issue state updated:
1. **Comment on Progress:** If a task is complex or takes multiple steps, add a comment on the issue with progress updates.
2. **Link Pull Requests / Commits:** When commits or PRs are made, reference the issue number (e.g., `Closes #12` or `Addresses #12`) to keep the history linked.

---

## 🏁 Step 4: Verification & Closure

An issue can only be closed once all acceptance criteria are fully met and verified:
1. **Run Verification:** Test the implementation (automated tests or manual check).
2. **Check off Checklist:** Update the issue description to mark the acceptance criteria checkboxes as completed (`[x]`).
3. **Close the Issue:** Close the issue with a final summary comment explaining what was done.
4. **Milestone Progress Review:** If all issues for a milestone are completed, notify the user to discuss closing the milestone.

---

## 🚨 Summary of Actions & Commands

| Action | GitHub MCP Tool / CLI Command | When to run |
| :--- | :--- | :--- |
| **Check status** | `list_issues`, `list_pull_requests` | Start of chat / task |
| **Create Task** | `create_issue` | Before writing code |
| **Log progress** | `add_issue_comment` | Significant progress made / blocked |
| **Check off criteria** | `update_issue` (edit body) | Criteria met |
| **Complete Task** | `update_issue` (state: closed) | Fully verified & merged |
