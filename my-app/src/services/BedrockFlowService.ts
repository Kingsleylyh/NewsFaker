export class BedrockFlowService {
  private baseUrl = 'https://zbbups6sz4.execute-api.us-east-1.amazonaws.com/DEV';

  private getEndpoint(type: 'Text' | 'URLs' | 'X' | 'Media'): string {
    const endpoints = {
      'Text': '/chat', // change the addresses here to whatever endpoint babebibobu you got =D 
      'URLs': '/chat', 
      'X': '/chat',
      'Media': '/chat'
    };
    return `${this.baseUrl}${endpoints[type]}`;
  }

  async analyzeContent(content: string, type: 'Text' | 'URLs' | 'X' | 'Media'): Promise<string> {
    try {
      const response = await fetch(this.getEndpoint(type), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: content,
          type: type
        })  
      });

      const result = await response.json();
      
      if (!response.ok) {
        const errorMessage = result.error || result.message || `${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return result.response || result.message || 'Analysis completed';
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Network error: ${String(error)}`);
    }
  }
}