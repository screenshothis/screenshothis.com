# screenshothis

**screenshothis** is a modern, full-stack application designed to capture and manage screenshots with ease. Built with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), it leverages a robust and type-safe TypeScript-centric technology stack.

## ✨ Features

- **TypeScript**: End-to-end type safety for a better developer experience and fewer runtime errors.
- **Monorepo Architecture**: Managed with `turbo` for optimized build and development workflows.
- **Frontend (TanStack Start & React)**:
    - SSR (Server-Side Rendering) capabilities via TanStack Start.
    - Modern UI built with React and TailwindCSS.
    - Reusable and accessible UI components from `alignui`.
    - Client-side routing with TanStack Router.
- **Backend (Hono & tRPC)**:
    - Lightweight and performant server built with Hono.
    - End-to-end type-safe APIs using tRPC, ensuring seamless communication between frontend and backend.
- **Database (PostgreSQL & Drizzle ORM)**:
    - Robust and scalable PostgreSQL database.
    - TypeScript-first ORM (Drizzle) for intuitive and type-safe database interactions.
- **Authentication**: Secure email & password authentication provided by Better Auth.
- **Development Tools**:
    - **Bun**: Fast JavaScript runtime, bundler, and package manager.
    - **Biome**: Integrated linter and formatter for consistent code quality.
    - **Husky**: Git hooks for automated checks.

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

- [Bun](https://bun.sh/) (v1.0 or higher)
- [Node.js](https://nodejs.org/) (for some tooling, though Bun is primary)
- [Git](https://git-scm.com/)
- A running PostgreSQL instance

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/screenshothis.git
    cd screenshothis
    ```

2.  **Install dependencies:**
    This project uses Bun for package management.
    ```bash
    bun install
    ```

## ⚙️ Configuration

### Environment Variables

The backend server requires environment variables for database connection and authentication.

1.  Navigate to the server application directory:
    ```bash
    cd apps/server
    ```
2.  Create a `.env` file by copying the example file (if one exists, otherwise create it from scratch):
    ```bash
    cp .env.example .env
    ```
    If `.env.example` does not exist, create `.env` with the following content:
    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"

    # For Better Auth (example variables, refer to Better Auth documentation)
    BETTER_AUTH_SECRET="your_strong_auth_secret_here"
    DEFAULT_API_KEY_PREFIX="ss_test_"
    # Add other necessary auth variables like OAuth credentials if you plan to use them
    ```
3.  Update the `.env` file in `apps/server/.env` with your PostgreSQL connection string and other necessary credentials.

## 🗄️ Database Setup

This project uses PostgreSQL with Drizzle ORM.

1.  **Ensure PostgreSQL is Running**: Make sure you have a PostgreSQL server running and accessible.
2.  **Configure Connection**: Update your `apps/server/.env` file with your PostgreSQL connection details (as described in the Environment Variables section).
3.  **Apply Schema (Push Migrations)**:
    This command introspects your Drizzle schema and applies the necessary changes to your database.
    ```bash
    bun db:push
    ```
4.  **(Optional) Drizzle Studio**:
    To view and manage your database with a UI, you can use Drizzle Studio:
    ```bash
    bun db:studio
    ```

## 🗂️ File Storage Setup (MinIO)

This project uses MinIO as an S3-compatible object storage solution for local development. The MinIO service is configured in the `docker-compose.yml` file in the root directory.

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose

### Setup Instructions

1.  **Start MinIO Service:**
    Run the following command from the root directory to start the MinIO container:
    ```bash
    docker-compose up -d
    ```

    **Note**: MinIO data will be persisted in a Docker volume named `minio_data`.

2.  **Configure Environment Variables:**
    Add the following MinIO configuration to your `apps/server/.env` file:
    ```env
    # MinIO Configuration (for local development)
    AWS_ACCESS_KEY_ID=screenshothis-access-key
    AWS_SECRET_ACCESS_KEY=screenshothis-secret-key
    AWS_REGION=us-east-1
    AWS_BUCKET=screenshothis-bucket
    AWS_URL=http://localhost:9000
    AWS_ENDPOINT=http://localhost:9000
    AWS_USE_PATH_STYLE_ENDPOINT=true
    ```

3.  **Access MinIO Console:**
    - Open your browser and navigate to [http://localhost:9001](http://localhost:9001)
    - Login with:
      - **Username**: `screenshothis-access-key`
      - **Password**: `screenshothis-secret-key`

4.  **Create Storage Bucket:**
    - In the MinIO console, click "Create Bucket"
    - Enter bucket name: `screenshothis-bucket` (or match your `AWS_BUCKET` environment variable)
    - Click "Create Bucket"

5.  **Verify Setup:**
    - MinIO API is available at: [http://localhost:9000](http://localhost:9000)
    - MinIO Console is available at: [http://localhost:9001](http://localhost:9001)

### Managing MinIO

- **Stop MinIO**: `docker-compose down`
- **View MinIO logs**: `docker-compose logs minio`
- **Restart MinIO**: `docker-compose restart minio`

## ▶️ Running the Application

Once the dependencies are installed and the database is configured:

1.  **Start the development servers:**
    This command will start both the web frontend and the Hono backend API concurrently.
    ```bash
    bun dev
    ```

2.  **Access the applications:**
    -   Web Application: [http://localhost:3001](http://localhost:3001)
    -   API Server: [http://localhost:3000](http://localhost:3000) (typically accessed by the web app)

## 📂 Project Structure

The project is organized as a monorepo using `turbo`.

```
screenshothis/
├── .husky/            # Git hooks
├── .turbo/            # Turborepo cache and logs
├── apps/
│   ├── server/        # Backend API (Hono, tRPC, Drizzle)
│   │   ├── src/
│   │   │   ├── actions/     # Server-side actions/logic
│   │   │   ├── common/      # Shared utilities for the server
│   │   │   ├── db/          # Drizzle ORM setup, schema, migrations
│   │   │   │   ├── migrations/ # Database migration files
│   │   │   │   └── schema/     # Drizzle schema definitions
│   │   │   ├── lib/         # Core libraries and helpers for the server
│   │   │   ├── routers/     # tRPC routers
│   │   │   ├── routes/      # Hono routes (including tRPC handler)
│   │   │   └── utils/       # Server-specific utility functions
│   │   ├── .env.example   # Example environment variables
│   │   └── package.json
│   └── web/           # Frontend application (React, TanStack Start, TailwindCSS)
│       ├── public/        # Static assets
│       ├── src/
│       │   ├── actions/     # Client-side actions (e.g., form submissions)
│       │   ├── components/  # React components (UI, forms, sections)
│       │   ├── content/     # Content collections (e.g., legal pages)
│       │   ├── hooks/       # Custom React hooks
│       │   ├── lib/         # Client-side libraries and helpers (e.g., utils, shadcn)
│       │   ├── routes/      # TanStack Router route definitions
│       │   ├── types/       # TypeScript type definitions for the web app
│       │   └── utils/       # Client-specific utility functions
│       └── package.json
├── packages/
│   ├── common/        # Shared code/types between apps (e.g., validation logic)
│   │   └── src/
│   ├── id/            # Utilities for generating IDs (e.g., KSUID)
│   │   └── src/
│   └── schemas/       # Shared Zod schemas for validation (tRPC inputs, etc.)
│       └── src/
├── .gitignore
├── biome.json         # Biome (linter/formatter) configuration
├── bun.lockb          # Bun lockfile
├── LICENSE            # Project License
├── package.json       # Root package.json for the monorepo
├── README.md
└── turbo.json         # Turborepo configuration
```

## 📜 Available Scripts

The following scripts can be run from the root of the monorepo:

-   `bun install`: Install all dependencies for the monorepo.
-   `bun dev`: Start all applications (web and server) in development mode.
-   `bun build`: Build all applications for production.
-   `bun dev:web`: Start only the web (frontend) application in development mode.
-   `bun dev:server`: Start only the server (backend) application in development mode.
-   `bun check-types`: Run TypeScript type checking across all packages and applications.
-   `bun db:push`: Apply Drizzle schema changes to the configured database.
-   `bun db:studio`: Open Drizzle Studio to view and manage the database.
-   `bun check`: Run Biome linting and formatting checks across the codebase.
-   `bun format`: Apply Biome formatting to the codebase.
-   `bun lint`: Run Biome linting checks.
-   `bun lint:fix`: Run Biome linting and attempt to automatically fix issues.

*(Note: Individual apps within `apps/*` and packages within `packages/*` may have their own specific scripts defined in their respective `package.json` files.)*

## 🛠️ Linting and Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

-   To check for issues: `bun check`
-   To format code: `bun format`
-   To lint code: `bun lint`
-   To lint and attempt to fix issues: `bun lint:fix`

Husky is configured to run checks before commits.

## ☁️ Deployment

TBD

### Troubleshooting

- **Port conflicts**: If port 9000 or 9001 is already in use, update the ports in `docker-compose.yml` and corresponding environment variables.
- **Connection issues**: Ensure Docker is running and the MinIO container is healthy: `docker-compose ps`

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes and commit them (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/your-feature-name`).
5.  Open a Pull Request.

Please ensure your code adheres to the linting and formatting guidelines (`bun check`).

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
