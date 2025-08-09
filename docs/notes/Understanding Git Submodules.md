# **Clonning All.This**
 **As a Contributor** you have access to the full structure of All.This. 

### **Setup for Development**

1. **Clone the Repository**
```bash
git clone https://github.com/neurons-me/all.this.git
```

## 1. Understanding Git Submodules
Each submodule is a fully independent Git repository embedded within the “parent” repository.
The parent repo stores a reference (a specific commit SHA) of the submodule, not the entire submodule’s commit history.
When you commit and push changes inside a submodule, you also need to commit an update in the parent repository (because the parent repo’s pointer/reference to that submodule changes).

## Common Pain Points
Having to commit/push in each submodule:

You must enter each submodule folder, commit changes, push them, then go back to the parent repo, update the submodule reference, and commit/push that reference.

## Cloning only one submodule:
If you want just one submodule locally, you can clone that submodule’s repo directly (since it’s an independent repo). However, it won’t automatically track changes in the parent or other submodules.
**Detecting when submodules are behind:**

You can run `git submodule status` or `git submodule foreach git status` to see if you’re behind or have uncommitted changes.

You must manually coordinate pulling/pushing each submodule to stay in sync.

2. ### Committing & Pushing All Submodules at Once
You can automate the repetitive commit/push steps with commands like:

**From your parent repo:**

```bash
git submodule foreach --recursive 'git add . && git commit -m "Commit from script" && git push'
```

Then you’d do:

```bash
# In the parent repo, stage the submodule reference changes:
git add .
git commit -m "Update submodule references"
git push
```

Note: This command attempts to commit and push every submodule with the same commit message, which might not be ideal if each submodule needs a unique message or different logic. It is, however, a quick automation hack.

## 3. Cloning Only a Single Submodule
If you want to work on just one submodule:

1. **Clone that submodule’s repository directly** (since it is a standalone repo). Example:

   ```bash
   git clone git@github.com:your-org/that-one-submodule.git
   ```

2. Make changes, commit, push.
3. To update the reference in the parent repo:
   - You’d pull the new submodule commits into the parent (with `git submodule update --remote --merge that-one-submodule` or manually pulling in that folder).
   - Then commit the parent repo to update the pointer.

**But** you lose the convenience of seeing how your changes integrate with the rest of the parent repo in real-time.