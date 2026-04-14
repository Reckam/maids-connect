import { aidMaidBioCreation } from '@/ai/flows/aid-maid-bio-creation';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Robust body parsing
    const body = await req.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { skills, experience, currentBio } = body;

    if (!skills || !Array.isArray(skills)) {
      return NextResponse.json({ error: 'Skills are required and must be an array.' }, { status: 400 });
    }

    // Check for API keys to provide better error messages
    const hasApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    if (!hasApiKey) {
      console.error('AI Configuration Error: GEMINI_API_KEY is missing.');
      return NextResponse.json({ 
        error: 'AI service is not configured on the server. Please check environment variables.' 
      }, { status: 503 });
    }

    // Call the Genkit flow wrapper
    const result = await aidMaidBioCreation({
      skills,
      experience: Number(experience) || 0,
      currentBio: currentBio || '',
    });

    if (!result || !result.generatedBio) {
      throw new Error('AI returned an empty response.');
    }

    return NextResponse.json({ generatedBio: result.generatedBio });
  } catch (error: any) {
    console.error('AI bio generation failed:', error);
    
    return NextResponse.json({ 
      error: 'Failed to generate AI-powered bio.',
      message: error.message || 'Unknown server error'
    }, { status: 500 });
  }
}
