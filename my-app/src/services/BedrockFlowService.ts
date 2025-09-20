import { BedrockAgentRuntimeClient, InvokeFlowCommand } from '@aws-sdk/client-bedrock-agent-runtime';

export class BedrockFlowService {
  private client: BedrockAgentRuntimeClient;

  constructor() {
    this.client = new BedrockAgentRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  async analyzeContent(content: string, flowId: string): Promise<any> {
    try {
      const command = new InvokeFlowCommand({
        flowIdentifier: flowId,
        flowAliasIdentifier: 'TSTALIASID',
        inputs: [
          {
            content: { document: content },
            nodeName: 'FlowInputNode',
            nodeOutputName: 'document'
          }
        ]
      });

      const response = await this.client.send(command);
      return response.responseStream;
    } catch (error) {
      throw new Error(`Flow invocation failed: ${error.message}`);
    }
  }
}