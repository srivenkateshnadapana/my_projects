# Git Collaboration Guide: adhoc_test_lms

This guide outlines the standard workflow for contributing to the repository. **Direct pushes to the `main` branch are restricted.** All changes must be submitted via Pull Requests.

## 1. Initial Setup

Run this once to get the project on your machine.

``` powershell
git clone https://github.com/srivenkateshnadapana/adhoc_test_lms.git
cd adhoc_test_lms
```

## 2. Start of Work (Daily)

Always sync with the main codebase before starting new changes.

``` powershell
# Sync main branch
git checkout main
git pull origin main

# Create your own branch for the task
git checkout -b feature/your-feature-name
```

## 3. During Development

Save your progress locally.

``` powershell
# Check modified files
git status

# Add and commit
git add .
git commit -m "feat: description of your changes"
```

## 4. Before Submitting

Ensure your branch is up-to-date with any changes others might have pushed to the main repository.

``` powershell
# Pull latest main into your feature branch to resolve conflicts locally
git pull origin main

# Resolve any conflicts if they appear, then commit them.
```

## 5. Share Your Work & Create Pull Request

Publish your branch to the remote repository. **Do not attempt to merge into `main` locally.**

``` powershell
# Publish your feature branch
git push origin feature/your-feature-name
```

**After pushing:**
1. Navigate to the [GitHub Repository](https://github.com/srivenkateshnadapana/adhoc_test_lms).
2. You will see a notification to "Compare & pull request" for your recently pushed branch.
3. Click it, provide a description of your changes, and submit the Pull Request for review.

## 6. Helpful Commands

-   `git branch` : List local branches
-   `git log --oneline` : View commit history
-   `git stash` : Save uncommitted changes for later
-   `git stash pop` : Restore stashed changes
-   `git checkout branch-name` : Switch between branches
