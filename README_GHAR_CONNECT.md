# GHAR_CONNECT

GHAR_CONNECT is a platform designed to help students living in hostels
and PGs connect with local home cooks who prepare homemade meals. The
goal is to make home-style food more accessible while creating an
opportunity for cooks to reach students in their area.

## Features

-   **Student experience:** Explore meal options and access food-related
    services.
-   **Cook experience:** Provide a space for cooks to manage their food
    offerings.
-   **Meal-focused platform:** Designed around convenient access to
    homemade food.
-   **Full-stack structure:** The repository contains separate frontend
    and backend folders.

> Note: Features and workflows may vary as the project develops. Please
> check the current application before documenting additional
> functionality.

## Repository Structure

``` text
GHAR_CONNECT/
├── code for frontend/       # Frontend application
├── gharconnect-backend/     # Backend application and API
├── package.json             # Root project configuration
├── pnpm-lock.yaml           # pnpm dependency lockfile
├── .gitignore
├── .gitattributes
└── README.md
```

## Getting Started

### Prerequisites

Install the tools required by the project:

-   [Git](https://git-scm.com/)
-   [Node.js](https://nodejs.org/)
-   [pnpm](https://pnpm.io/) (if required by the project configuration)

### 1. Clone the repository

``` bash
git clone <REPOSITORY_URL>
cd GHAR_CONNECT
```

Replace `<REPOSITORY_URL>` with the repository's GitHub URL.

### 2. Install dependencies

Check the `package.json` files in the root, frontend, and backend
folders. Install dependencies in the locations that define their own
packages.

For a folder that uses pnpm:

``` bash
pnpm install
```

### 3. Configure environment variables

If the backend or frontend requires environment variables, check the
project's existing documentation or example environment files. Create a
local `.env` file with the required values.

**Do not commit API keys, passwords, database credentials, tokens, or
other secrets.**

### 4. Run the applications

Check the `scripts` section of the relevant `package.json` file before
starting the frontend or backend. Use the existing development scripts
and configuration rather than creating new ones unnecessarily.

## Contributing

Contributions are welcome! To keep changes easy to review:

1.  Fork the repository or create a branch if you have write access.

2.  Create a branch for your change.

    ``` bash
    git checkout -b feature/your-change
    ```

3.  Make a focused change and test it locally.

4.  Commit your work with a clear message.

    ``` bash
    git add .
    git commit -m "docs: improve project README"
    ```

5.  Push your branch and open a pull request with a short explanation of
    the change.

Please avoid unrelated changes, keep the existing project structure
intact, and do not commit generated folders such as `node_modules`.

## Reporting Issues

If you find a bug or have a feature suggestion, open a GitHub issue.
Include clear steps to reproduce bugs and screenshots or error messages
when useful.

## Project Status

GHAR_CONNECT is an evolving project. Setup instructions and features may
change as development continues.

## License

No license information has been specified here. Please check with the
repository maintainers before reusing or distributing the project.
