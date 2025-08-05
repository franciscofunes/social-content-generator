// Simple test for the prompt saving API
const testPromptSaving = async () => {
  console.log('Testing prompt saving functionality...');
  
  const testUserId = 'test-user-123';
  const testPrompt = 'Professional corporate photography of modern office workspace with safety equipment, detailed lighting, high resolution';

  try {
    // Test saving a prompt
    console.log('1. Testing save prompt...');
    const saveResponse = await fetch('http://localhost:3000/api/prompts/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: testPrompt,
        userId: testUserId
      }),
    });

    if (!saveResponse.ok) {
      throw new Error(`Save failed: ${saveResponse.status}`);
    }

    const saveData = await saveResponse.json();
    console.log('✅ Save successful:', saveData.promptId);

    // Test loading prompts
    console.log('2. Testing load prompts...');
    const loadResponse = await fetch(`http://localhost:3000/api/prompts/load?userId=${testUserId}`);
    
    if (!loadResponse.ok) {
      throw new Error(`Load failed: ${loadResponse.status}`);
    }

    const loadData = await loadResponse.json();
    console.log('✅ Load successful:', loadData.count, 'prompts found');

    // Test deleting the prompt
    console.log('3. Testing delete prompt...');
    const deleteResponse = await fetch('http://localhost:3000/api/prompts/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        promptId: saveData.promptId,
        userId: testUserId
      }),
    });

    if (!deleteResponse.ok) {
      throw new Error(`Delete failed: ${deleteResponse.status}`);
    }

    const deleteData = await deleteResponse.json();
    console.log('✅ Delete successful:', deleteData.promptId);

    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test only if we're in a testing environment
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  // testPromptSaving();
  console.log('Test file created. Run manually if needed.');
}