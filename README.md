# Wage Predictor App

A Next.js frontend that predicts a user's wage through a conversational UI.

The app asks the user to describe themselves in natural language, sends that text to a hosted backend for analysis, and then requests a wage prediction once all required details have been collected.

## What this project does

This repository contains the frontend for a wage prediction experience built with:

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion

The UI works like a chat:

1. The user enters a short description such as age, experience, education, country, gender, and industry.
2. The frontend sends the combined user messages to the backend `POST /wage/analyze` endpoint.
3. The backend returns structured data plus any missing fields.
4. If information is still missing, the app asks a follow-up question.
5. Once all fields are available, the frontend calls `POST /wage/predict`.
6. The predicted wage is shown in the interface.

## Project scope

This repo is the frontend only.

It depends on an external backend currently referenced in the code:

- `https://wage-predictor-app-backend.onrender.com/wage/analyze`
- `https://wage-predictor-app-backend.onrender.com/wage/predict`

If that backend is unavailable, the chat flow and prediction feature will not work.

## Features

- Chat-style wage prediction flow
- Follow-up questions when required user data is missing
- Animated interface using Framer Motion
- Responsive centered layout
- Final wage result shown in a modal-style overlay

## Tech stack

- Next.js App Router
- React client components
- TypeScript
- Tailwind CSS
- Framer Motion

## Getting started

### Prerequisites

- Node.js 18.18+ or newer
- npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Available scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

What they do:

- `npm run dev` starts the Next.js development server with Turbopack
- `npm run build` creates a production build
- `npm run start` runs the production build
- `npm run lint` runs the configured Next.js lint command

## Folder structure

```text
src/
  app/
    favicon.ico
    globals.css
    layout.tsx
    page.tsx
public/
package.json
next.config.ts
tailwind.config.js
tsconfig.json
```

## Main frontend logic

The core app lives in `src/app/page.tsx`.

Important behavior in that file:

- stores the conversation in local component state
- combines all user messages into one text block before analysis
- asks follow-up questions when the backend reports missing fields
- sends structured data to the prediction endpoint
- formats the returned wage value for display

## Current API contract expected by the frontend

From the current implementation, the analyze endpoint is expected to return data including:

- `missingFields`
- `nextQuestion`
- `age`
- `years_experience`
- `education`
- `gender`
- `country`
- `industry`

The predict endpoint is expected to return:

- `predictedWage`

## Notes

- There are no environment variables configured in this repo right now; backend URLs are hardcoded in the frontend.
- There are no test files in the current project.
- The page metadata title is set to `Predict your wage.AI`.

## Future improvements

- move backend URLs into environment variables
- add loading and error states around API requests
- add input validation
- add tests for the chat flow
- add a clearer separation between UI, API calls, and state logic

## License

No license file is included in this repository yet.
