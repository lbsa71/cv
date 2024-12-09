# LinkedIn CV Generator

A Node.js application that generates a professional PDF CV from LinkedIn data exports. First draft by Claude.ai, adjusted by lbsa71.

Caveat: I did this for me. You will need to tailor the typescript code for your own needs.

## Features

- Converts LinkedIn CSV exports into a professionally formatted PDF CV
- Includes sections for:
  - Professional Summary
  - Work Experience
  - Notable Projects
  - Education
  - Technical Skills (automatically categorized)
- Clean, professional formatting with proper spacing and typography

## Prerequisites

- Node.js (v14 or higher)
- npm

## Setup

1. Export your LinkedIn data:

   - Go to LinkedIn > Settings & Privacy > Data Privacy > Get a copy of your data
   - Select "Want something in particular?" and choose:
     - Positions
     - Profile
     - Projects
     - Skills
     - Education
   - Place the exported CSV files in the `exports/` directory

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Build the project:

   ```bash
   npm run build
   ```

2. Generate your CV:
   ```bash
   npm start
   ```

The generated PDF will be saved to `output/cv.pdf`.

## Development

- `npm run dev` - Run the application using ts-node (useful during development)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Generate the CV using the compiled JavaScript

## Project Structure

- `src/`
  - `index.ts` - Main application entry point
  - `types.ts` - TypeScript interfaces for LinkedIn data
  - `utils/`
    - `csvParser.ts` - CSV parsing utilities
    - `pdfGenerator.ts` - PDF generation logic
- `exports/` - Directory for LinkedIn CSV exports
- `output/` - Directory for generated PDF
