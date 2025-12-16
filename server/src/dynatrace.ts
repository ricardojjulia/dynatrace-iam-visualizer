import axios, { AxiosInstance } from 'axios';
import {
  Policy,
  PolicyDtoList,
  CreateOrUpdatePolicyRequest,
  PolicyBindingDto,
  PolicyUuidsDto,
  PolicyBoundary,
  PolicyBoundaryDto,
  EffectivePermissions,
  ValidationResponse,
  ErrorResponse,
  User,
  UserListDto,
  Group,
  GroupListDto,
  GroupUserListDto,
  ServiceUser,
  ServiceUserDto,
  ServiceUsersPageDto,
  AccountLimits,
  AccountLimitsPage,
  LevelLimits,
  Environment,
  EnvironmentListDto,
} from './types';

export class DynatraceClient {
  private client: AxiosInstance;
  private accountUuid: string;

  constructor(accountUuid: string, apiToken: string, apiUrl: string) {
    this.accountUuid = accountUuid;
    this.client = axios.create({
      baseURL: apiUrl,
      headers: {
        Authorization: `Api-Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * List all users in an account
   */
  async getUsers(includeServiceUsers: boolean = false): Promise<UserListDto> {
    try {
      const response = await this.client.get(`/iam/v1/accounts/${this.accountUuid}/users`, {
        params: { 'service-users': includeServiceUsers },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  /**
   * Create a new user
   */
  async createUser(email: string): Promise<void> {
    try {
      await this.client.post(`/iam/v1/accounts/${this.accountUuid}/users`, { email });
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Get groups for a user
   */
  async getUserGroups(email: string): Promise<GroupListDto> {
    try {
      const response = await this.client.get(
        `/iam/v1/accounts/${this.accountUuid}/users/${encodeURIComponent(email)}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user groups:', error);
      throw new Error('Failed to fetch user groups');
    }
  }

  /**
   * Add user to groups
   */
  async addUserToGroups(email: string, groupUuids: string[]): Promise<void> {
    try {
      await this.client.post(
        `/iam/v1/accounts/${this.accountUuid}/users/${encodeURIComponent(email)}`,
        groupUuids
      );
    } catch (error) {
      console.error('Error adding user to groups:', error);
      throw new Error('Failed to add user to groups');
    }
  }

  /**
   * Remove user from account
   */
  async removeUser(email: string): Promise<void> {
    try {
      await this.client.delete(
        `/iam/v1/accounts/${this.accountUuid}/users/${encodeURIComponent(email)}`
      );
    } catch (error) {
      console.error('Error removing user:', error);
      throw new Error('Failed to remove user');
    }
  }

  /**
   * Set user group membership
   */
  async setUserGroups(email: string, groupUuids: string[]): Promise<void> {
    try {
      await this.client.put(
        `/iam/v1/accounts/${this.accountUuid}/users/${encodeURIComponent(email)}/groups`,
        groupUuids
      );
    } catch (error) {
      console.error('Error setting user groups:', error);
      throw new Error('Failed to set user groups');
    }
  }

  // ==================== GROUP MANAGEMENT ====================

  /**
   * List all groups
   */
  async getGroups(): Promise<GroupListDto> {
    try {
      const response = await this.client.get(`/iam/v1/accounts/${this.accountUuid}/groups`);
      return response.data;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw new Error('Failed to fetch groups');
    }
  }

  /**
   * Create groups
   */
  async createGroups(
    groups: Array<{ name: string; description?: string; federatedAttributeValues?: string[] }>
  ): Promise<Group[]> {
    try {
      const response = await this.client.post(
        `/iam/v1/accounts/${this.accountUuid}/groups`,
        groups
      );
      return response.data;
    } catch (error) {
      console.error('Error creating groups:', error);
      throw new Error('Failed to create groups');
    }
  }

  /**
   * Get users in a group
   */
  async getGroupUsers(groupUuid: string): Promise<GroupUserListDto> {
    try {
      const response = await this.client.get(
        `/iam/v1/accounts/${this.accountUuid}/groups/${groupUuid}/users`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching group users:', error);
      throw new Error('Failed to fetch group users');
    }
  }

  /**
   * Update a group
   */
  async updateGroup(
    groupUuid: string,
    groupData: { name: string; description?: string; federatedAttributeValues?: string[] }
  ): Promise<void> {
    try {
      await this.client.put(
        `/iam/v1/accounts/${this.accountUuid}/groups/${groupUuid}`,
        groupData
      );
    } catch (error) {
      console.error('Error updating group:', error);
      throw new Error('Failed to update group');
    }
  }

  /**
   * Delete a group
   */
  async deleteGroup(groupUuid: string): Promise<void> {
    try {
      await this.client.delete(`/iam/v1/accounts/${this.accountUuid}/groups/${groupUuid}`);
    } catch (error) {
      console.error('Error deleting group:', error);
      throw new Error('Failed to delete group');
    }
  }

  // ==================== POLICY MANAGEMENT ====================

  /**
   * List all policies for a level (account or environment)
   */
  async getPolicies(
    levelType: 'account' | 'environment',
    levelId: string
  ): Promise<PolicyDtoList> {
    try {
      const response = await this.client.get(`/iam/v1/repo/${levelType}/${levelId}/policies`);
      return response.data;
    } catch (error) {
      console.error('Error fetching policies:', error);
      throw new Error('Failed to fetch policies');
    }
  }

  /**
   * Get a specific policy
   */
  async getPolicy(
    levelType: 'account' | 'environment' | 'global',
    levelId: string,
    policyUuid: string
  ): Promise<Policy> {
    try {
      const response = await this.client.get(
        `/iam/v1/repo/${levelType}/${levelId}/policies/${policyUuid}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching policy:', error);
      throw new Error('Failed to fetch policy');
    }
  }

  /**
   * Create a new policy
   */
  async createPolicy(
    levelType: 'account' | 'environment',
    levelId: string,
    policy: CreateOrUpdatePolicyRequest
  ): Promise<Policy> {
    try {
      const response = await this.client.post(
        `/iam/v1/repo/${levelType}/${levelId}/policies`,
        policy
      );
      return response.data;
    } catch (error) {
      console.error('Error creating policy:', error);
      throw new Error('Failed to create policy');
    }
  }

  /**
   * Update a policy
   */
  async updatePolicy(
    levelType: 'account' | 'environment',
    levelId: string,
    policyUuid: string,
    policy: CreateOrUpdatePolicyRequest
  ): Promise<Policy> {
    try {
      const response = await this.client.put(
        `/iam/v1/repo/${levelType}/${levelId}/policies/${policyUuid}`,
        policy
      );
      return response.data;
    } catch (error) {
      console.error('Error updating policy:', error);
      throw new Error('Failed to update policy');
    }
  }

  /**
   * Delete a policy
   */
  async deletePolicy(
    levelType: 'account' | 'environment',
    levelId: string,
    policyUuid: string,
    force: boolean = false
  ): Promise<void> {
    try {
      await this.client.delete(`/iam/v1/repo/${levelType}/${levelId}/policies/${policyUuid}`, {
        params: { force },
      });
    } catch (error) {
      console.error('Error deleting policy:', error);
      throw new Error('Failed to delete policy');
    }
  }

  /**
   * Validate a policy
   */
  async validatePolicy(
    levelType: 'account' | 'environment',
    levelId: string,
    policy: CreateOrUpdatePolicyRequest
  ): Promise<ValidationResponse> {
    try {
      const response = await this.client.post(
        `/iam/v1/repo/${levelType}/${levelId}/policies/validation`,
        policy
      );
      return response.data;
    } catch (error) {
      console.error('Error validating policy:', error);
      throw new Error('Failed to validate policy');
    }
  }

  // ==================== POLICY BINDINGS ====================

  /**
   * Get policies bound to a group
   */
  async getGroupPolicies(
    levelType: 'account' | 'environment' | 'global',
    levelId: string,
    groupUuid: string
  ): Promise<PolicyUuidsDto> {
    try {
      const response = await this.client.get(
        `/iam/v1/repo/${levelType}/${levelId}/bindings/groups/${groupUuid}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching group policies:', error);
      throw new Error('Failed to fetch group policies');
    }
  }

  /**
   * Update policy bindings for a group
   */
  async updateGroupPolicies(
    levelType: 'account' | 'environment',
    levelId: string,
    groupUuid: string,
    policyUuids: string[]
  ): Promise<void> {
    try {
      await this.client.put(
        `/iam/v1/repo/${levelType}/${levelId}/bindings/groups/${groupUuid}`,
        { policyUuids }
      );
    } catch (error) {
      console.error('Error updating group policies:', error);
      throw new Error('Failed to update group policies');
    }
  }

  /**
   * Get all policy bindings at a level
   */
  async getPolicyBindings(
    levelType: 'account' | 'environment' | 'global',
    levelId: string
  ): Promise<PolicyBindingDto> {
    try {
      const response = await this.client.get(`/iam/v1/repo/${levelType}/${levelId}/bindings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching policy bindings:', error);
      throw new Error('Failed to fetch policy bindings');
    }
  }

  // ==================== POLICY BOUNDARIES ====================

  /**
   * Get policy boundaries
   */
  async getPolicyBoundaries(accountId: string): Promise<PolicyBoundary[]> {
    try {
      const response = await this.client.get(`/iam/v1/repo/account/${accountId}/boundaries`);
      return response.data.content || [];
    } catch (error) {
      console.error('Error fetching policy boundaries:', error);
      throw new Error('Failed to fetch policy boundaries');
    }
  }

  /**
   * Create a policy boundary
   */
  async createPolicyBoundary(
    accountId: string,
    boundary: PolicyBoundaryDto
  ): Promise<PolicyBoundary> {
    try {
      const response = await this.client.post(
        `/iam/v1/repo/account/${accountId}/boundaries`,
        boundary
      );
      return response.data;
    } catch (error) {
      console.error('Error creating policy boundary:', error);
      throw new Error('Failed to create policy boundary');
    }
  }

  /**
   * Delete a policy boundary
   */
  async deletePolicyBoundary(accountId: string, boundaryUuid: string): Promise<void> {
    try {
      await this.client.delete(`/iam/v1/repo/account/${accountId}/boundaries/${boundaryUuid}`);
    } catch (error) {
      console.error('Error deleting policy boundary:', error);
      throw new Error('Failed to delete policy boundary');
    }
  }

  // ==================== EFFECTIVE PERMISSIONS ====================

  /**
   * Get effective permissions for a user or group
   */
  async getEffectivePermissions(
    levelType: 'account' | 'environment',
    levelId: string,
    entityId: string,
    entityType: 'user' | 'group',
    services?: string[]
  ): Promise<EffectivePermissions> {
    try {
      const response = await this.client.get(
        `/iam/v1/resolution/${levelType}/${levelId}/effectivepermissions`,
        {
          params: {
            entityId,
            entityType,
            services: services ? services.join(',') : undefined,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching effective permissions:', error);
      throw new Error('Failed to fetch effective permissions');
    }
  }

  // ==================== SERVICE USERS ====================

  /**
   * Create a service user
   */
  async createServiceUser(serviceUser: ServiceUserDto): Promise<ServiceUser> {
    try {
      const response = await this.client.post(
        `/iam/v1/accounts/${this.accountUuid}/service-users`,
        serviceUser
      );
      return response.data;
    } catch (error) {
      console.error('Error creating service user:', error);
      throw new Error('Failed to create service user');
    }
  }

  /**
   * List service users
   */
  async getServiceUsers(
    page?: number,
    pageSize?: number,
    pageKey?: string
  ): Promise<ServiceUsersPageDto> {
    try {
      const response = await this.client.get(
        `/iam/v1/accounts/${this.accountUuid}/service-users`,
        {
          params: { page, 'page-size': pageSize, 'page-key': pageKey },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching service users:', error);
      throw new Error('Failed to fetch service users');
    }
  }

  /**
   * Delete a service user
   */
  async deleteServiceUser(userUuid: string): Promise<void> {
    try {
      await this.client.delete(
        `/iam/v1/accounts/${this.accountUuid}/service-users/${userUuid}`
      );
    } catch (error) {
      console.error('Error deleting service user:', error);
      throw new Error('Failed to delete service user');
    }
  }

  // ==================== ACCOUNT LIMITS ====================

  /**
   * Get account limits
   */
  async getAccountLimits(): Promise<AccountLimitsPage> {
    try {
      const response = await this.client.get(
        `/iam/v1/accounts/${this.accountUuid}/limits`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching account limits:', error);
      throw new Error('Failed to fetch account limits');
    }
  }

  /**
   * Get limits for a level
   */
  async getLevelLimits(levelType: 'account' | 'environment', levelId: string): Promise<LevelLimits> {
    try {
      const response = await this.client.get(
        `/iam/v1/repo/${levelType}/${levelId}/limits`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching level limits:', error);
      throw new Error('Failed to fetch level limits');
    }
  }

  // ==================== ENVIRONMENTS ====================

  /**
   * List environments
   */
  async getEnvironments(): Promise<EnvironmentListDto> {
    try {
      const response = await this.client.get(
        `/env/v2/accounts/${this.accountUuid}/environments`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching environments:', error);
      throw new Error('Failed to fetch environments');
    }
  }
}
