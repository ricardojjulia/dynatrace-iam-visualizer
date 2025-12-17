import { Router, Request, Response, NextFunction } from 'express';
import { DynatraceClient } from './dynatrace';

export function createPolicyRoutes(dynatraceClient: DynatraceClient | null) {
  const router = Router();

  // Middleware to check if client is configured
  const checkClient = (req: Request, res: Response, next: NextFunction) => {
    if (!dynatraceClient) {
      return res.status(503).json({ error: 'Dynatrace client not configured' });
    }
    next();
  };

  // ==================== POLICIES ====================

  /**
   * List all policies for a level
   * GET /api/policies or /api/policies?levelType=account&levelId=<uuid>
   */
  router.get('/', checkClient, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { levelType = 'account', levelId } = req.query;

      // If no levelId provided, try to get account from Dynatrace
      if (!levelId) {
        try {
          // Get account info to use as default levelId
          const accounts = await dynatraceClient!.getAccounts?.();
          if (accounts && accounts.length > 0) {
            const accountId = accounts[0].uuid || accounts[0].id;
            const policies = await dynatraceClient!.getPolicies(
              'account',
              accountId
            );
            return res.json(policies);
          }
        } catch (e) {
          console.log('Failed to fetch from Dynatrace API, using demo data:', e);
          // Fall back to demo data if API fails
          return res.json([
            {
              uuid: 'demo-policy-1',
              name: 'Admin Policy',
              description: 'Administrative access policy (DEMO DATA)',
              version: 1,
              created: new Date().toISOString(),
              lastModified: new Date().toISOString(),
              createdBy: 'demo@example.com',
              lastModifiedBy: 'demo@example.com'
            },
            {
              uuid: 'demo-policy-2',
              name: 'Viewer Policy',
              description: 'Read-only access policy (DEMO DATA)',
              version: 1,
              created: new Date().toISOString(),
              lastModified: new Date().toISOString(),
              createdBy: 'demo@example.com',
              lastModifiedBy: 'demo@example.com'
            }
          ]);
        }
        return res.status(400).json({ error: 'levelId query parameter is required' });
      }

      const policies = await dynatraceClient!.getPolicies(
        levelType as 'account' | 'environment',
        levelId as string
      );

      res.json(policies);
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get a specific policy
   * GET /api/policies/:policyUuid?levelType=account&levelId=<uuid>
   */
  router.get('/:policyUuid', checkClient, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { policyUuid } = req.params;
      const { levelType = 'account', levelId } = req.query;

      if (!levelId) {
        return res.status(400).json({ error: 'levelId query parameter is required' });
      }

      const policy = await dynatraceClient!.getPolicy(
        levelType as 'account' | 'environment' | 'global',
        levelId as string,
        policyUuid
      );

      res.json(policy);
    } catch (error) {
      next(error);
    }
  });

  /**
   * Create a new policy
   * POST /api/policies
   */
  router.post('/', checkClient, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { levelType = 'account', levelId, ...policyData } = req.body;

      if (!levelId) {
        return res.status(400).json({ error: 'levelId is required' });
      }

      const policy = await dynatraceClient!.createPolicy(
        levelType as 'account' | 'environment',
        levelId,
        policyData
      );

      res.status(201).json(policy);
    } catch (error) {
      next(error);
    }
  });

  /**
   * Update a policy
   * PUT /api/policies/:policyUuid
   */
  router.put('/:policyUuid', checkClient, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { policyUuid } = req.params;
      const { levelType = 'account', levelId, ...policyData } = req.body;

      if (!levelId) {
        return res.status(400).json({ error: 'levelId is required' });
      }

      const policy = await dynatraceClient!.updatePolicy(
        levelType as 'account' | 'environment',
        levelId,
        policyUuid,
        policyData
      );

      res.json(policy);
    } catch (error) {
      next(error);
    }
  });

  /**
   * Delete a policy
   * DELETE /api/policies/:policyUuid?levelType=account&levelId=<uuid>&force=false
   */
  router.delete(
    '/:policyUuid',
    checkClient,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { policyUuid } = req.params;
        const { levelType = 'account', levelId, force = false } = req.query;

        if (!levelId) {
          return res.status(400).json({ error: 'levelId query parameter is required' });
        }

        await dynatraceClient!.deletePolicy(
          levelType as 'account' | 'environment',
          levelId as string,
          policyUuid,
          force === 'true'
        );

        res.status(204).send();
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * Validate a policy
   * POST /api/policies/validate
   */
  router.post(
    '/validate',
    checkClient,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { levelType = 'account', levelId, ...policyData } = req.body;

        if (!levelId) {
          return res.status(400).json({ error: 'levelId is required' });
        }

        const validation = await dynatraceClient!.validatePolicy(
          levelType as 'account' | 'environment',
          levelId,
          policyData
        );

        res.json(validation);
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}

export function createGroupRoutes(dynatraceClient: DynatraceClient | null) {
  const router = Router();

  const checkClient = (req: Request, res: Response, next: NextFunction) => {
    if (!dynatraceClient) {
      return res.status(503).json({ error: 'Dynatrace client not configured' });
    }
    next();
  };

  // ==================== GROUPS ====================

  /**
   * List all groups
   * GET /api/groups
   */
  router.get('/', checkClient, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const groups = await dynatraceClient!.getGroups();
      res.json(groups);
    } catch (error) {
      next(error);
    }
  });

  /**
   * Create groups
   * POST /api/groups
   */
  router.post('/', checkClient, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const groupsData = Array.isArray(req.body) ? req.body : [req.body];
      const groups = await dynatraceClient!.createGroups(groupsData);
      res.status(201).json(groups);
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get users in a group
   * GET /api/groups/:groupUuid/users
   */
  router.get(
    '/:groupUuid/users',
    checkClient,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { groupUuid } = req.params;
        const users = await dynatraceClient!.getGroupUsers(groupUuid);
        res.json(users);
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * Update a group
   * PUT /api/groups/:groupUuid
   */
  router.put(
    '/:groupUuid',
    checkClient,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { groupUuid } = req.params;
        await dynatraceClient!.updateGroup(groupUuid, req.body);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * Delete a group
   * DELETE /api/groups/:groupUuid
   */
  router.delete(
    '/:groupUuid',
    checkClient,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { groupUuid } = req.params;
        await dynatraceClient!.deleteGroup(groupUuid);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}

export function createUserRoutes(dynatraceClient: DynatraceClient | null) {
  const router = Router();

  const checkClient = (req: Request, res: Response, next: NextFunction) => {
    if (!dynatraceClient) {
      return res.status(503).json({ error: 'Dynatrace client not configured' });
    }
    next();
  };

  // ==================== USERS ====================

  /**
   * List users
   * GET /api/users?serviceUsers=false
   */
  router.get('/', checkClient, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { serviceUsers = false } = req.query;
      const users = await dynatraceClient!.getUsers(serviceUsers === 'true');
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  /**
   * Create a user
   * POST /api/users
   */
  router.post('/', checkClient, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'email is required' });
      }
      await dynatraceClient!.createUser(email);
      res.status(201).send();
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get user groups
   * GET /api/users/:email/groups
   */
  router.get(
    '/:email/groups',
    checkClient,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email } = req.params;
        const groups = await dynatraceClient!.getUserGroups(email);
        res.json(groups);
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * Add user to groups
   * POST /api/users/:email/groups
   */
  router.post(
    '/:email/groups',
    checkClient,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email } = req.params;
        const groupUuids = Array.isArray(req.body) ? req.body : req.body.groupUuids;
        await dynatraceClient!.addUserToGroups(email, groupUuids);
        res.status(201).send();
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * Set user groups (replace)
   * PUT /api/users/:email/groups
   */
  router.put(
    '/:email/groups',
    checkClient,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email } = req.params;
        const groupUuids = Array.isArray(req.body) ? req.body : req.body.groupUuids;
        await dynatraceClient!.setUserGroups(email, groupUuids);
        res.status(200).send();
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * Remove user from account
   * DELETE /api/users/:email
   */
  router.delete(
    '/:email',
    checkClient,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email } = req.params;
        await dynatraceClient!.removeUser(email);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}

export function createBindingRoutes(dynatraceClient: DynatraceClient | null) {
  const router = Router();

  const checkClient = (req: Request, res: Response, next: NextFunction) => {
    if (!dynatraceClient) {
      return res.status(503).json({ error: 'Dynatrace client not configured' });
    }
    next();
  };

  // ==================== POLICY BINDINGS ====================

  /**
   * Get policies bound to a group
   * GET /api/bindings/groups/:groupUuid?levelType=account&levelId=<uuid>
   */
  router.get(
    '/groups/:groupUuid',
    checkClient,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { groupUuid } = req.params;
        const { levelType = 'account', levelId } = req.query;

        if (!levelId) {
          return res.status(400).json({ error: 'levelId query parameter is required' });
        }

        const policies = await dynatraceClient!.getGroupPolicies(
          levelType as 'account' | 'environment' | 'global',
          levelId as string,
          groupUuid
        );

        res.json(policies);
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * Update policies bound to a group
   * PUT /api/bindings/groups/:groupUuid
   */
  router.put(
    '/groups/:groupUuid',
    checkClient,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { groupUuid } = req.params;
        const { levelType = 'account', levelId, policyUuids } = req.body;

        if (!levelId) {
          return res.status(400).json({ error: 'levelId is required' });
        }

        await dynatraceClient!.updateGroupPolicies(
          levelType as 'account' | 'environment',
          levelId,
          groupUuid,
          policyUuids
        );

        res.status(204).send();
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * Get all policy bindings at a level
   * GET /api/bindings?levelType=account&levelId=<uuid>
   */
  router.get('/', checkClient, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { levelType = 'account', levelId } = req.query;

      if (!levelId) {
        return res.status(400).json({ error: 'levelId query parameter is required' });
      }

      const bindings = await dynatraceClient!.getPolicyBindings(
        levelType as 'account' | 'environment' | 'global',
        levelId as string
      );

      res.json(bindings);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export function createPermissionsRoutes(dynatraceClient: DynatraceClient | null) {
  const router = Router();

  const checkClient = (req: Request, res: Response, next: NextFunction) => {
    if (!dynatraceClient) {
      return res.status(503).json({ error: 'Dynatrace client not configured' });
    }
    next();
  };

  // ==================== EFFECTIVE PERMISSIONS ====================

  /**
   * Get effective permissions for a user or group
   * GET /api/permissions/effective?levelType=account&levelId=<uuid>&entityId=<id>&entityType=user|group
   */
  router.get(
    '/effective',
    checkClient,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { levelType = 'account', levelId, entityId, entityType, services } = req.query;

        if (!levelId || !entityId || !entityType) {
          return res
            .status(400)
            .json({ error: 'levelId, entityId, and entityType query parameters are required' });
        }

        const permissions = await dynatraceClient!.getEffectivePermissions(
          levelType as 'account' | 'environment',
          levelId as string,
          entityId as string,
          entityType as 'user' | 'group',
          services ? (services as string).split(',') : undefined
        );

        res.json(permissions);
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}
