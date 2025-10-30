# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b76702aa-0b4f-463a-93bb-a6e01827d055

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b76702aa-0b4f-463a-93bb-a6e01827d055) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b76702aa-0b4f-463a-93bb-a6e01827d055) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Running a local Taccar (Traccar) server

This project expects a Taccar-compatible tracking server that exposes the Traccar REST API. A lightweight Docker configuration is included to help you spin one up locally.

### 1. Start the Taccar server

```bash
docker compose -f docker-compose.taccar.yml up -d
```

The Traccar web UI and REST API will be available at [http://localhost:8082](http://localhost:8082) with the default `admin/admin` credentials. Logs and data are persisted in the Docker volumes declared in `docker-compose.taccar.yml`.

### 3. Add devices / locations

Log into the Traccar UI, create devices for your staff members, and feed positions to port `5055` (or use Traccar's built-in simulator). The front-end will automatically display any live positions retrieved through the REST API.

### 4. Connect the front-end

Open the Mountain Tracker app and click **Connect server** in the header. Provide your Traccar URL (for example `http://localhost:8082`), username, and password. The connection details are stored locally in the browser so staff locations load automatically on future visits.

> ℹ️ You can still inject credentials at build time with the `VITE_TACCAR_BASE_URL`, `VITE_TACCAR_USERNAME`, and `VITE_TACCAR_PASSWORD` environment variables if you prefer. When those values are present they will be used as the default connection.

> ✅ If you host Traccar on a different origin than the web app, make sure the `<entry key='web.origin'>*</entry>` (or a specific origin) line is present in your `traccar.xml`. Without it the browser will block API requests because of CORS.
