## 1. Create Repo at Github

- Many setups are available, but at the start, do the following:
  - Create a new repository at Github, and name it "some-repo-name"
  - Do not initialize the repository with a README, .gitignore, or license
  - Click "Create Repository"
- Add gitignore file (the very first file so that subsequent commits will not include unwanted files)
  - Click "Add file" > "Create new file"
  - Name the file ".gitignore"
  - Add the following content to the file:

    ```
    # Ignore node_modules
    node_modules/

    # Ignore build output
    dist/

    # Ignore environment variables
    .env

    # Ignore log files
    *.log
    ```

  - Scroll and click "Commit new file"

## 2. Clone the Repository to Local Machine (GitHub Desktop)

- Open GitHub Desktop
- Click "File" > "Clone Repository"
- Select the repository you just created from the list
- Choose a local path where you want to clone the repository
- Click "Clone"

## 3. Install dependencies or devdependencies

- Either install dependencies one by one using npm i <dependency-name> or install all dependencies at once using npm i
- If you have a package.json file with all dependencies listed.
