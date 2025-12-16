import axios, { AxiosInstance } from 'axios';

export interface DynatracePolicy {
  id: string;
  name: string;
  description?: string;
  rules?: string[];
  lastModified?: string;
}

export class DynatraceClient {
  private client: AxiosInstance;
  private environmentId: string;

  constructor(environmentId: string, apiToken: string, apiUrl: string) {
    this.environmentId = environmentId;
    this.client = axios.create({
      baseURL: apiUrl,
      headers: {
        Authorization: `Api-Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch all IAM policies from Dynatrace
   */
  async getPolicies(): Promise<DynatracePolicy[]> {
    try {
      // This is a placeholder endpoint - adjust based on actual Dynatrace IAM API
      const response = await this.client.get('/api/v2/iam/policies');
      return response.data.policies || [];
    } catch (error) {
      console.error('Error fetching policies from Dynatrace:', error);
      throw new Error('Failed to fetch IAM policies');
    }
  }

  /**
   * Fetch a specific policy by ID
   */
  async getPolicy(policyId: string): Promise<DynatracePolicy> {
    try {
      const response = await this.client.get(`/api/v2/iam/policies/${policyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching policy ${policyId}:`, error);
      throw new Error(`Failed to fetch policy ${policyId}`);
    }
  }

  /**
   * Create a new policy
   */
  async createPolicy(policy: Omit<DynatracePolicy, 'id'>): Promise<DynatracePolicy> {
    try {
      const response = await this.client.post('/api/v2/iam/policies', policy);
      return response.data;
    } catch (error) {
      console.error('Error creating policy:', error);
      throw new Error('Failed to create policy');
    }
  }

  /**
   * Update an existing policy
   */
  async updatePolicy(policyId: string, policy: Partial<DynatracePolicy>): Promise<DynatracePolicy> {
    try {
      const response = await this.client.put(`/api/v2/iam/policies/${policyId}`, policy);
      return response.data;
    } catch (error) {
      console.error(`Error updating policy ${policyId}:`, error);
      throw new Error(`Failed to update policy ${policyId}`);
    }
  }

  /**
   * Delete a policy
   */
  async deletePolicy(policyId: string): Promise<void> {
    try {
      await this.client.delete(`/api/v2/iam/policies/${policyId}`);
    } catch (error) {
      console.error(`Error deleting policy ${policyId}:`, error);
      throw new Error(`Failed to delete policy ${policyId}`);
    }
  }

  /**
   * Validate a policy against Dynatrace rules
   */
  async validatePolicy(policy: DynatracePolicy): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      const response = await this.client.post('/api/v2/iam/policies/validate', policy);
      return response.data;
    } catch (error) {
      console.error('Error validating policy:', error);
      throw new Error('Failed to validate policy');
    }
  }
}
