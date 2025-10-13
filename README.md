# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/3f04d52a-1447-4534-8a72-54a3b48828a9

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3f04d52a-1447-4534-8a72-54a3b48828a9) and start prompting.

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

## Build Configuration

This project includes integration with Visual Studio (3sat.web). The build output is automatically copied to the ASP.NET project.

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# API Configuration
VITE_API_TARGET=https://localhost:44348

# Build Configuration  
VITE_BUILD_BASE=/reactappview/

# Build Output Destination
COPY_DESTINATION_PATH=../3sat.web/WebApp/ReactApp
```

### Build Scripts

The project includes these build scripts in `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "lint": "eslint .",
  "preview": "vite preview",
  "postbuild": "shx cp -r dist/* \"$COPY_DESTINATION_PATH\" 2>nul || :",
  "test:env": "dotenv -e .env -- node -e \"console.log(process.env)\""
}
```

- `postbuild`: Automatically copies build output to Visual Studio project
- `test:env`: Tests environment variable configuration

### Building for Production

```bash
# Development build
npm run build:dev

# Production build (automatically copies to Visual Studio)
npm run build
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

Simply open [Lovable](https://lovable.dev/projects/3f04d52a-1447-4534-8a72-54a3b48828a9) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
