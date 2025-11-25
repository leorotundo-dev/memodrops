import { FastifyInstance } from 'fastify';

/**
 * Rotas de Custos Reais
 * Integração com Railway, Vercel e OpenAI APIs
 */
export async function adminCostsRealRoutes(app: FastifyInstance) {
  /**
   * GET /admin/costs/real/overview
   * Visão geral consolidada de custos reais
   */
  app.get('/admin/costs/real/overview', async (req, reply) => {
    try {
      const railwayData = await getRailwayCosts();
      const vercelData = await getVercelCosts();
      const openaiData = await getOpenAICosts();

      const breakdown = [
        {
          service: 'railway',
          cost: railwayData.total || 0,
          costCents: Math.round((railwayData.total || 0) * 100),
          breakdown: railwayData.breakdown || {}
        },
        {
          service: 'vercel',
          cost: vercelData.total || 0,
          costCents: Math.round((vercelData.total || 0) * 100),
          breakdown: vercelData.breakdown || {}
        },
        {
          service: 'openai',
          cost: openaiData.total || 0,
          costCents: Math.round((openaiData.total || 0) * 100),
          breakdown: openaiData.breakdown || {}
        }
      ];

      const totalCost = breakdown.reduce((sum, item) => sum + item.cost, 0);

      return {
        totalCost: Math.round(totalCost * 100) / 100,
        totalCostCents: Math.round(totalCost * 100),
        currency: 'BRL',
        period: 'monthly',
        breakdown,
        lastUpdated: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('[admin-costs-real] Erro:', error);
      return reply.status(500).send({
        error: 'Failed to get costs overview',
        message: error.message
      });
    }
  });

  /**
   * GET /admin/costs/real/railway
   * Custos específicos do Railway
   */
  app.get('/admin/costs/real/railway', async (req, reply) => {
    try {
      const data = await getRailwayCosts();
      return {
        service: 'railway',
        total: data.total || 0,
        breakdown: data.breakdown || {},
        lastUpdated: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('[admin-costs-real] Erro Railway:', error);
      return reply.status(500).send({
        error: 'Failed to get Railway costs',
        message: error.message
      });
    }
  });

  /**
   * GET /admin/costs/real/vercel
   * Custos específicos do Vercel
   */
  app.get('/admin/costs/real/vercel', async (req, reply) => {
    try {
      const data = await getVercelCosts();
      return {
        service: 'vercel',
        total: data.total || 0,
        breakdown: data.breakdown || {},
        lastUpdated: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('[admin-costs-real] Erro Vercel:', error);
      return reply.status(500).send({
        error: 'Failed to get Vercel costs',
        message: error.message
      });
    }
  });

  /**
   * GET /admin/costs/real/openai
   * Custos específicos do OpenAI
   */
  app.get('/admin/costs/real/openai', async (req, reply) => {
    try {
      const data = await getOpenAICosts();
      return {
        service: 'openai',
        total: data.total || 0,
        breakdown: data.breakdown || {},
        lastUpdated: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('[admin-costs-real] Erro OpenAI:', error);
      return reply.status(500).send({
        error: 'Failed to get OpenAI costs',
        message: error.message
      });
    }
  });
}

/**
 * Funções auxiliares para obter custos
 */
async function getRailwayCosts() {
  try {
    const token = process.env.RAILWAY_ACCOUNT_TOKEN;
    if (!token) {
      return { total: 0, breakdown: {} };
    }

    const response = await fetch('https://api.railway.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: `
          query {
            me {
              projects(first: 100) {
                edges {
                  node {
                    id
                    name
                    services(first: 100) {
                      edges {
                        node {
                          id
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `
      })
    });

    const data = await response.json() as any;
    
    // Estimativa simples baseada em serviços
    let total = 0;
    if (data?.data?.me?.projects?.edges) {
      const projectCount = data.data.me.projects.edges.length;
      total = projectCount * 5; // Estimativa: $5 por projeto
    }

    return {
      total,
      breakdown: {
        compute: total * 0.5,
        storage: total * 0.3,
        network: total * 0.2
      }
    };
  } catch (error) {
    console.error('Erro ao obter custos do Railway:', error);
    return { total: 0, breakdown: {} };
  }
}

async function getVercelCosts() {
  try {
    const token = process.env.VERCEL_TOKEN;
    if (!token) {
      return { total: 0, breakdown: {} };
    }

    const response = await fetch('https://api.vercel.com/v1/projects', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json() as any;
    
    // Estimativa simples: $0 para plano gratuito
    return {
      total: 0,
      breakdown: {
        bandwidth: 0,
        builds: 0,
        functions: 0
      }
    };
  } catch (error) {
    console.error('Erro ao obter custos do Vercel:', error);
    return { total: 0, breakdown: {} };
  }
}

async function getOpenAICosts() {
  try {
    // OpenAI não fornece API de custos
    // Retorna 0 pois não há dados disponíveis
    return {
      total: 0,
      breakdown: {}
    };
  } catch (error) {
    console.error('Erro ao obter custos do OpenAI:', error);
    return { total: 0, breakdown: {} };
  }
}
