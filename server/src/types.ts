/**
 * Auto-generated TypeScript interfaces from Dynatrace Account Management API spec
 * Generated from: DT-Account-MGMT-API.json
 */

// User Management Types
export interface User {
  uid: string;
  email: string;
  name?: string;
  surname?: string;
  userStatus: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'DELETED' | 'ECUSTOMS_MANUALLY_BLOCKED';
  emergencyContact: boolean;
  userLoginMetadata?: UserLoginMetadata;
}

export interface UserLoginMetadata {
  successfulLoginCounter: number;
  failedLoginCounter: number;
  lastSuccessfulLogin: string;
  lastFailedLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserListDto {
  count: number;
  items: User[];
}

// Group Management Types
export interface Group {
  uuid: string;
  name: string;
  owner: 'LOCAL' | 'SCIM' | 'SAML' | 'DCS' | 'ALL_USERS';
  description: string;
  federatedAttributeValues?: string[];
  createdAt: string;
  updatedAt: string;
  accountUUID?: string;
  accountName?: string;
}

export interface GroupListDto {
  count: number;
  items: Group[];
}

export interface GroupUserListDto {
  count: number;
  items: User[];
}

// IAM Policy Types
export interface Policy {
  uuid: string;
  name: string;
  description: string;
  statementQuery: string;
  tags?: string[];
  statements?: Statement[];
}

export interface PolicyDto {
  uuid: string;
  name: string;
  description: string;
}

export interface PolicyDtoList {
  policies: PolicyDto[];
}

export interface Statement {
  effect: string;
  permissions: string[];
  conditions: Condition[];
}

export interface Condition {
  name: string;
  operator: string;
  values: string[];
}

export interface CreateOrUpdatePolicyRequest {
  name: string;
  description: string;
  statementQuery: string;
  tags?: string[];
}

// Policy Binding Types
export interface PolicyBinding {
  policyUuid: string;
  groups: string[];
  parameters?: Record<string, string>;
  metadata?: Record<string, string>;
  boundaries?: string[];
}

export interface PolicyBindingDto {
  levelType: string;
  levelId: string;
  policyBindings: PolicyBinding[];
}

export interface PolicyUuidsDto {
  policyUuids: string[];
}

// Policy Boundary Types
export interface PolicyBoundary {
  uuid: string;
  levelType: string;
  levelId: string;
  name: string;
  boundaryQuery: string;
  boundaryConditions: Condition[];
  metadata?: Record<string, any>;
}

export interface PolicyBoundaryDto {
  name: string;
  boundaryQuery: string;
  metadata?: Record<string, any>;
}

// Effective Permissions Types
export interface EffectivePermission {
  permission: string;
  effects: EffectivePermissionEffect[];
}

export interface EffectivePermissionEffect {
  effect: string;
  conditions: Condition[];
  effectivePolicies: EffectivePolicyWithBinding[];
}

export interface EffectivePolicy {
  uuid: string;
  name: string;
  statementQuery: string;
  levelType: string;
  levelId: string;
}

export interface EffectivePolicyWithBinding {
  policy: EffectivePolicy;
  binding: EffectiveBinding;
}

export interface EffectiveBinding {
  groupUuid: string;
  levelType: string;
  levelId: string;
}

export interface EffectivePermissions {
  effectivePermissions: EffectivePermission[];
}

// Service User Types
export interface ServiceUser {
  uid: string;
  email: string;
  name: string;
  surname?: string;
  description?: string;
  createdAt: string;
  groupUuid?: string;
}

export interface ServiceUserDto {
  name: string;
  description?: string;
}

export interface ServiceUsersPageDto {
  results: ServiceUser[];
  nextPageKey?: string;
  totalCount: number;
}

// Limits Types
export interface AccountLimits {
  currentValue: number;
  limitType: string;
  limitValue: number;
}

export interface AccountLimitsPage {
  pageSize: number;
  pageNumber: number;
  total: number;
  results: AccountLimits[];
}

export interface LevelLimits {
  policies: LimitEntry;
  bindings: LimitEntry;
  boundaries: LimitEntry;
}

export interface LimitEntry {
  count: number;
  limit: string;
}

// Environment Types
export interface Environment {
  id: string;
  name: string;
  active: boolean;
  url: string;
}

export interface EnvironmentListDto {
  data: Environment[];
}

// Error Response
export interface ErrorResponse {
  code: number;
  message: string;
  errorsMap?: Record<string, string>;
}

// Validation Response
export interface ValidationResponse {
  warnings: string[];
}

// Pagination
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  pageKey?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  nextPageKey?: string;
}
