import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test the full flow
    const baseUrl = 'http://localhost:3000';
    
    console.log('Testing topics generation...');
    
    // Step 1: Generate topics
    const discoverResponse = await fetch(`${baseUrl}/api/topics/discover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!discoverResponse.ok) {
      const discoverError = await discoverResponse.json();
      return NextResponse.json({
        success: false,
        step: 'discover',
        error: discoverError
      }, { status: 500 });
    }
    
    const discoverResult = await discoverResponse.json();
    console.log('Topics generated:', discoverResult);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Select topics
    const selectResponse = await fetch(`${baseUrl}/api/topics/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        date: new Date().toISOString().split('T')[0], 
        excludeDays: 30 
      })
    });
    
    if (!selectResponse.ok) {
      const selectError = await selectResponse.json();
      return NextResponse.json({
        success: false,
        step: 'select',
        error: selectError
      }, { status: 500 });
    }
    
    const selectResult = await selectResponse.json();
    console.log('Topics selected:', selectResult);
    
    return NextResponse.json({
      success: true,
      message: 'Generation flow working correctly',
      discoverResult,
      selectResult
    });
    
  } catch (error) {
    console.error('Test generation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}