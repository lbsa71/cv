# LinkedIn CV Generator

Please see [my CV](https://raw.githubusercontent.com/lbsa71/cv/refs/heads/main/output/cv.pdf) for example of what this app does.

You can see the web browser version of the app on my [github pages](https://lbsa71.github.io/linkedin-cv-export/) but will probably not work out of the box for your CV (yet)

A Node.js application that generates a professional PDF CV from LinkedIn data exports. First draft by Claude.ai, adjusted by lbsa71, then jointly developed in iterations.

Caveat: I did this for me, as an gen-aI experiment. You will need to do heavy tailoring of the typescript code for your own needs.

## Story

This app has cost about

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
   - Download the ZIP file that LinkedIn provides

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
   npm start <linkedin-export.zip> [config.json] [image.jpg]
   ```

   Where:
   - `<linkedin-export.zip>` - Required: The ZIP file downloaded from LinkedIn
   - `[config.json]` - Optional: Custom configuration file (defaults to built-in config)
   - `[image.jpg]` - Optional: Profile picture image file

   Example:
   ```bash
   npm start linkedin-data.zip docs/example-config.json docs/default.jpg
   ```

The generated PDF will be saved to `output/cv.pdf`.

## Development

- `npm run dev` - Run the application using ts-node (useful during development)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Generate the CV using the compiled JavaScript

## Project Structure

- `src/`
  - `index.ts` - Main application entry point
  - `services/pdf/pdfGenerator.ts` - PDF generation logic
- `shared/` - Shared code between frontend and backend
  - `src/models/types.ts` - TypeScript interfaces for LinkedIn data
  - `src/utils/csvParser.ts` - CSV parsing utilities
  - `src/services/parseFiles.ts` - File parsing logic
  - `src/services/transformationService.ts` - Data transformation logic
- `docs/` - Documentation and example configuration
  - `example-config.json` - Example configuration file
- `output/` - Directory for generated PDF
