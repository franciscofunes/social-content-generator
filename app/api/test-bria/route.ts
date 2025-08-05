import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing BRIA AI API configuration...');
    
    // Check environment variable
    const apiKey = process.env.BRIA_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'BRIA_AI_API_KEY environment variable not found',
        hasApiKey: false
      }, { status: 500 });
    }
    
    console.log('API Key found, length:', apiKey.length);
    console.log('API Key first 10 chars:', apiKey.substring(0, 10));
    
    // Test 1: Check API endpoint accessibility
    const baseUrl = 'https://engine.prod.bria-api.com/v1';
    console.log('Testing endpoint:', `${baseUrl}/text-to-image/hd/2.2`);
    
    // Test with proper BRIA API format according to documentation
    const testPayload = {
      prompt: "Professional workplace safety equipment display, hard hats, safety glasses, protective clothing",
      num_results: 1,
      sync: true
    };
    
    console.log('Test payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await fetch(`${baseUrl}/text-to-image/hd/2.2`, {
      method: 'POST',
      headers: {
        'api_token': apiKey,  // CORRECT BRIA AI header format
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-App/1.0'
      },
      body: JSON.stringify(testPayload),
    });
    
    console.log('Response status:', response.status);
    console.log('Response statusText:', response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (!response.ok) {
      let errorDetails = responseText;
      try {
        const errorJson = JSON.parse(responseText);
        errorDetails = errorJson;
      } catch (e) {
        // Response is not JSON
      }
      
      return NextResponse.json({
        success: false,
        error: `BRIA AI API error (${response.status}): ${response.statusText}`,
        details: errorDetails,
        apiKeyLength: apiKey.length,
        apiKeyPrefix: apiKey.substring(0, 10),
        endpoint: `${baseUrl}/text-to-image/hd/2.2`,
        requestPayload: testPayload
      }, { status: 500 });
    }
    
    // Try to parse response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON response from BRIA AI',
        responseText: responseText.substring(0, 500),
        apiKeyLength: apiKey.length
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'BRIA AI API is working correctly',
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 10),
      responseStructure: {
        hasResult: !!data.result,
        resultLength: data.result?.length || 0,
        hasUrls: !!(data.result?.[0]?.urls),
        urlsLength: data.result?.[0]?.urls?.length || 0
      },
      sampleData: data
    });
    
  } catch (error) {
    console.error('BRIA AI test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      hasApiKey: !!process.env.BRIA_AI_API_KEY,
      apiKeyLength: process.env.BRIA_AI_API_KEY?.length || 0
    }, { status: 500 });
  }
}