# LinkedIn CV Generator

Please see [my CV (PDF)](https://raw.githubusercontent.com/lbsa71/cv/refs/heads/main/output/cv.pdf) or [my CV (HTML)](https://raw.githubusercontent.com/lbsa71/cv/refs/heads/main/output/cv.html) for examples of what this app does.

You can see the web browser version of the app on my [github pages](https://lbsa71.github.io/linkedin-cv-export/) but will probably not work out of the box for your CV (yet)

A Node.js application that generates a professional PDF CV from LinkedIn data exports. First draft by Claude.ai, adjusted by lbsa71, then jointly developed in iterations.

Caveat: I did this for me, as an gen-aI experiment. You will need to do heavy tailoring of the typescript code for your own needs.

## Story

This app has cost about

## Features

- Converts LinkedIn CSV exports into professionally formatted PDF and HTML CVs
- Includes sections for:
  - Professional Summary
  - Work Experience
  - Notable Projects
  - Education
  - Technical Skills (automatically categorized)
- Clean, professional formatting with proper spacing and typography
- **Privatize mode**: Option to remove email and phone from output for public sharing
- Single-file HTML output with embedded CSS and images

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
   - (Optional) Place the ZIP file in the `exports/` folder to use it automatically without specifying it on the command line

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
   npm start [linkedin-export.zip] [config.json] [image.jpg] [--privatize|-p]
   ```

   Where:
   - `[linkedin-export.zip]` - Optional: The ZIP file downloaded from LinkedIn. If not provided, the app will automatically scan the `exports/` folder and use the most recently modified ZIP file found there.
   - `[config.json]` - Optional: Custom configuration file (defaults to built-in config)
   - `[image.jpg]` - Optional: Profile picture image file
   - `[--privatize|-p]` - Optional: Remove email and phone from output (useful for public sharing)

   Examples:
   ```bash
   # Use a specific ZIP file
   npm start linkedin-data.zip docs/example-config.json docs/default.jpg
   
   # Use the most recent ZIP from exports folder
   npm start docs/example-config.json docs/default.jpg
   
   # Use only the exports folder (no additional arguments)
   npm start
   
   # Generate privatized output (no email/phone)
   npm start -- --privatize
   npm start -- -p
   ```

The generated PDF and HTML files will be saved to `output/cv.pdf` and `output/cv.html` respectively.

### Frontend Version

The frontend version (available on GitHub Pages) also supports privatize mode. Simply check the "Privatize output (remove email and phone)" checkbox before processing your files. Both PDF and HTML outputs will be generated without email and phone information.

## Development

- `npm run dev` - Run the application using ts-node (useful during development)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Generate the CV using the compiled JavaScript

## Project Structure

- `src/`
  - `index.ts` - Main application entry point
  - `services/pdf/pdfGenerator.ts` - PDF generation logic
  - `services/html/htmlGenerator.ts` - HTML generation logic
- `frontend/` - Web browser version of the CV generator
  - `src/pages/index.astro` - Frontend UI with file upload and processing
  - `src/services/pdf/pdfGenerator.ts` - Browser-based PDF generation
  - `src/services/html/htmlGenerator.ts` - Browser-based HTML generation
- `shared/` - Shared code between frontend and backend
  - `src/models/types.ts` - TypeScript interfaces for LinkedIn data
  - `src/utils/csvParser.ts` - CSV parsing utilities
  - `src/services/parseFiles.ts` - File parsing logic
  - `src/services/transformationService.ts` - Data transformation logic
- `docs/` - Documentation and example configuration
  - `example-config.json` - Example configuration file
- `exports/` - Optional directory for LinkedIn export ZIP files (automatically scanned if no ZIP is specified on command line)
- `output/` - Directory for generated PDF and HTML files
