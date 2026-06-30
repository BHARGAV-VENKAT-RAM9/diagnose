# Vicky Diagnostics - Admin Frontend

This is the Next.js admin frontend portal for the Vicky Diagnostics platform.

## Features
- Built with **Next.js** (App Router)
- Styled using **Tailwind CSS**
- Integrates with the backend REST APIs

## Prerequisites
- Node.js (v18+)
- npm

## Getting Started

### 1. Installation
Navigate to the `admin-frontend` directory and install the required dependencies:
```bash
cd admin-frontend
npm install
```

### 2. Environment Variables
Ensure you have a `.env.local` file configured in the root of the `admin-frontend` directory:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. Running the Development Server
Start the development server. By default, it is configured to run on port `3001` to avoid conflicting with the main user-facing frontend:
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser to view the application.

## Available Scripts

In the project directory, you can run:

- **`npm run dev`**: Runs the app in development mode on port `3001`.
- **`npm run build`**: Builds the production application.
- **`npm run start`**: Starts the production server.
- **`npm run lint`**: Runs ESLint to check for code quality and style issues.
