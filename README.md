# Synthiq PDF Data Extractor

A modern web application for extracting structured data from PDF files using AI.

## Features

- Upload multiple PDF files
- Define custom extraction schema
- Extract data using OpenAI GPT-4
- Export to Excel
- Real-time preview
- Modern UI with shadcn/ui

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI GPT-4
- LlamaParser
- shadcn/ui

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key
   LLAMA_CLOUD_API_KEY=your_llama_api_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Upload PDF files using the file upload area
2. Define your extraction schema using the schema builder
3. Click "Start Extraction" to process the files
4. Download the extracted data as an Excel file

## License

MIT
