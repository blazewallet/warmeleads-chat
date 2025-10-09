import { NextRequest, NextResponse } from 'next/server';
import { testAIGeneration } from '@/lib/aiContentGenerator';

export async function GET(req: NextRequest) {
  try {
    console.log('🧪 Testing AI content generation...');
    
    await testAIGeneration();
    
    return NextResponse.json({
      success: true,
      message: "AI content generation test completed",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI test failed:', error);
    return NextResponse.json(
      { 
        error: 'AI test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { branche = 'thuisbatterijen' } = await req.json();
    
    console.log(`🤖 Generating AI content for ${branche}...`);
    
    // Test AI generation voor specifieke branche
    const { generateAIContent } = await import('@/lib/aiContentGenerator');
    
    const result = await generateAIContent({
      branche,
      contentType: 'marktanalyse',
      targetKeywords: [`${branche} Nederland`, `${branche} leads`, `${branche} markt`],
      actueleData: [
        `${branche} markt groeit explosief in 2025`,
        `Nieuwe subsidies beschikbaar voor ${branche}`,
        `Nederlandse ${branche} installateurs zien recordjaar`
      ]
    });
    
    return NextResponse.json({
      success: true,
      result,
      message: `AI artikel gegenereerd voor ${branche}`
    });

  } catch (error) {
    console.error('AI generation failed:', error);
    return NextResponse.json(
      { 
        error: 'AI generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


