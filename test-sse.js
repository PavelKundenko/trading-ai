// Simple test script to verify SSE functionality
const testSSE = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/analyzer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'This is a test message for analysis',
        options: {
          analysisType: 'sentiment',
          includeMetadata: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No reader available');
    }

    console.log('Starting SSE stream...');
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('Stream ended');
        break;
      }
      
      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data.trim()) {
            try {
              const parsed = JSON.parse(data);
              console.log('Received:', parsed);
            } catch (e) {
              console.log('Raw data:', data);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSSE();
}

export { testSSE };
