import { NextRequest, NextResponse } from 'next/server';

export interface BriaImageRequest {
  prompt: string;
  model_type?: 'base' | 'fast' | 'hd' | 'vector';
  model_version?: '2.2' | '2.3' | '3.2';
  num_results?: number;
  aspect_ratio?: '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9';
  sync?: boolean;
  seed?: number;
  negative_prompt?: string;
  medium?: 'photography' | 'art';
  steps_num?: number;
  text_guidance_scale?: number;
  prompt_enhancement?: boolean;
  enhance_image?: boolean;
  prompt_content_moderation?: boolean;
  content_moderation?: boolean;
  ip_signal?: boolean;
}

export interface BriaImageResponse {
  result: {
    seed: number;
    urls: string[];
    uuid: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const body: BriaImageRequest = await request.json();
    
    // Validate required parameters
    if (!body.prompt || !body.prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check for API token
    const apiToken = process.env.BRIA_AI_API_KEY;
    if (!apiToken) {
      console.error('BRIA_AI_API_KEY not configured');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Set defaults with no restrictions
    const {
      model_type = 'base',
      model_version = '3.2',
      num_results = 1,
      aspect_ratio = '1:1',
      sync = true,
      medium = 'photography',
      steps_num = 30,
      text_guidance_scale = 5,
      prompt_enhancement = true,
      enhance_image = true,
      prompt_content_moderation = false, // Disabled per request
      content_moderation = false, // Disabled per request
      ip_signal = false, // Disabled per request
      ...otherParams
    } = body;

    // Determine the endpoint based on model type
    let endpoint: string;
    let finalModelVersion = model_version;
    
    switch (model_type) {
      case 'fast':
        endpoint = `https://engine.prod.bria-api.com/v1/text-to-image/fast/${model_version}`;
        break;
      case 'hd':
        endpoint = `https://engine.prod.bria-api.com/v1/text-to-image/hd/2.2`;
        finalModelVersion = '2.2'; // HD only supports 2.2
        break;
      case 'vector':
        endpoint = `https://engine.prod.bria-api.com/v1/text-to-vector/base/${model_version}`;
        break;
      case 'base':
      default:
        endpoint = `https://engine.prod.bria-api.com/v1/text-to-image/base/${model_version}`;
        break;
    }

    // Build request payload
    const payload: any = {
      prompt: body.prompt.trim(),
      num_results,
      aspect_ratio,
      sync,
      medium,
      prompt_enhancement,
      enhance_image,
      prompt_content_moderation,
      content_moderation,
      ip_signal,
      ...otherParams
    };

    // Add model-specific parameters
    if (model_type === 'fast') {
      payload.steps_num = Math.min(Math.max(steps_num || 8, 4), 10);
    } else if (model_type === 'base' || model_type === 'hd') {
      payload.steps_num = Math.min(Math.max(steps_num || 30, 20), 50);
      payload.text_guidance_scale = Math.min(Math.max(text_guidance_scale || 5, 1), 10);
    }

    // Add optional parameters if provided
    if (body.seed !== undefined) payload.seed = body.seed;
    if (body.negative_prompt) payload.negative_prompt = body.negative_prompt;

    console.log('Calling Bria AI API:', {
      endpoint,
      model_type,
      model_version: finalModelVersion,
      prompt: payload.prompt.substring(0, 100) + '...',
      payload: { ...payload, prompt: '[truncated]' }
    });

    // Call Bria AI API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_token': apiToken,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Bria AI API Error:', {
        status: response.status,
        statusText: response.statusText,
        response: responseText
      });

      let errorMessage = 'Failed to generate image';
      
      switch (response.status) {
        case 400:
          errorMessage = 'Invalid request parameters';
          break;
        case 403:
          errorMessage = 'API authentication failed';
          break;
        case 408:
          errorMessage = 'Content was rejected by moderation';
          break;
        case 422:
          errorMessage = 'Content moderation failed';
          break;
        case 429:
          errorMessage = 'Rate limit exceeded. Please try again later';
          break;
        case 500:
          errorMessage = 'Server error. Please try again';
          break;
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          details: response.status === 400 ? responseText : undefined
        },
        { status: response.status }
      );
    }

    let data: BriaImageResponse;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Bria AI response:', responseText);
      return NextResponse.json(
        { error: 'Invalid response from image generation service' },
        { status: 500 }
      );
    }

    // Log successful generation
    console.log('Bria AI API Success:', {
      resultsCount: data.result?.length || 0,
      seeds: data.result?.map(r => r.seed) || []
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error('Generate image API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}