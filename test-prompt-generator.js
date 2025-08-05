// Simple test for the enhanced prompt generator
const testPromptGeneration = async () => {
  try {
    console.log('Testing prompt enhancement...');
    
    const response = await fetch('http://localhost:3000/api/generate-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'A professional office worker using safety equipment'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Enhanced prompt:', data.prompt);
    console.log('Original description:', data.originalDescription);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
testPromptGeneration();