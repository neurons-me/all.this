### How ALL.THIS Setup Works
- **`all.this`** is the parent repository. Inside it, each subfolder is a submodule pointing to a different GitHub repo.
- Each submodule is **fully independent**—it has its own commit history, remote, and branches.
- The parent repo simply stores a reference (a specific commit SHA) to each submodule. When you pull and update submodules, it points to the latest commit on each submodule’s branch.

### Workflow Tips for Submodules
1. **Making Changes in Multiple Submodules**
   - Go into each submodule folder, make changes, commit, and push.
   - Then go back to the parent 

     ```
     all.this
     ```

      repo, run:

     ```
     git add .
     git commit -m "Update submodule references"
     git push
     ```

     This updates the parent’s pointers.

2. **Automating Commits**
   - Use a command like:

     ```
     git submodule foreach --recursive \
       'git add . && git commit -m "Commit from script" && git push'
     ```

     That commits and pushes changes in all submodules. Then commit in 

     ```
     all.this
     ```

      to record the new submodule references.

3. **Cloning & Working on a Single Submodule**
   - If you only need code for one submodule, you can clone that submodule’s repo directly:

     ```
     git clone https://github.com/neurons-me/this.DOM.git
     ```

   - It doesn’t affect `all.this` unless you then **return** to `all.this` to pull in that submodule’s latest commits.

4. **Checking Which Submodules Are Out-of-Date**
   - From inside the parent repo:
     ```
     git submodule status
     ```

     or

     ```
     git submodule foreach git status
     ```

     This lets you see if any submodule has uncommitted changes or is behind the remote.

### Summary
- **`all.this`** becomes your “central index,” referencing all individual repos.
- It just requires a bit of extra care in committing and pushing each submodule (and then updating the parent repo) whenever you make changes.