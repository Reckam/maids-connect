
import { aidMaidBioCreation } from '@/ai/flows/aid-maid-bio-creation';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { skills, experience, currentBio } = await req.json();

    if (!skills || !Array.isArray(skills)) {
      return NextResponse.json({ error: 'Skills are required and must be an array.' }, { status: 400 });
    }

    const result = await aidMaidBioCreation.run({
      input: {
        skills,
        experience: experience || 0,
        currentBio: currentBio || '',
      },
    });

    return NextResponse.json({ generatedBio: result.generatedBio });
  } catch (error) {
    console.error('AI bio generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate AI-powered bio. Please try again later.' }, { status: 500 });
  }
}
