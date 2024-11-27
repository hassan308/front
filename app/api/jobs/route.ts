import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  try {
    // Använd relativ sökväg från projektets rot
    const filePath = path.join(process.cwd(), 'data', `${filename}.json`);

    let fileContents;
    try {
      fileContents = await fs.readFile(filePath, 'utf8');
      console.log(`File found at: ${filePath}`);
    } catch (error) {
      console.log(`File not found at: ${filePath}`);
      throw new Error('File not found in the specified location');
    }

    const jobs = JSON.parse(fileContents);
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error reading jobs file:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}