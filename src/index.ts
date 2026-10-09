import { CAMPUSES, fetchWeeklyMenu } from './scraper.js';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    // CORS headers for easy front-end integration
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json; charset=utf-8',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      if (pathname === '/api/campuses') {
        return new Response(JSON.stringify(CAMPUSES, null, 2), {
          status: 200,
          headers: corsHeaders,
        });
      }

      if (pathname === '/api/menu') {
        const campus = searchParams.get('campus') || 'GKG';
        const rawWeek = searchParams.get('week') || 'current';
        const week = ['current', 'next', 'previous'].includes(rawWeek)
          ? (rawWeek as 'current' | 'next' | 'previous')
          : 'current';

        const data = await fetchWeeklyMenu(campus, week);
        return new Response(JSON.stringify(data, null, 2), {
          status: 200,
          headers: corsHeaders,
        });
      }

      if (pathname === '/api/menu/today') {
        const campus = searchParams.get('campus') || 'GKG';
        const rawWeek = searchParams.get('week') || 'current';
        const week = ['current', 'next', 'previous'].includes(rawWeek)
          ? (rawWeek as 'current' | 'next' | 'previous')
          : 'current';

        const data = await fetchWeeklyMenu(campus, week);

        // Map today's day of week to Dutch 2-letter abbreviation
        const dayMap: Record<number, string> = {
          1: 'Ma',
          2: 'Di',
          3: 'Wo',
          4: 'Do',
          5: 'Vr',
        };
        const currentDayOfWeek = new Date().getDay();
        const expectedAbbr = dayMap[currentDayOfWeek];

        const todayMenu = data.days.find((d) => d.day === expectedAbbr);

        if (!todayMenu) {
          return new Response(
            JSON.stringify(
              {
                error: `No menu available for today (${expectedAbbr || 'Weekend'}) at campus ${campus}.`,
                availableDays: data.days.map((d) => d.day),
              },
              null,
              2
            ),
            {
              status: 404,
              headers: corsHeaders,
            }
          );
        }

        return new Response(JSON.stringify(todayMenu, null, 2), {
          status: 200,
          headers: corsHeaders,
        });
      }

      // Root endpoint
      if (pathname === '/' || pathname === '/api') {
        return new Response(
          JSON.stringify(
            {
              name: 'Howest Resto API',
              description: 'Cloudflare Forge & OpenAPI service for Howest student restaurant menus',
              endpoints: {
                campuses: '/api/campuses',
                weeklyMenu: '/api/menu?campus=GKG',
                todayMenu: '/api/menu/today?campus=GKG',
                openApiSpec: '/docs/openapi.yaml',
              },
              author: 'Mauro Druwel',
            },
            null,
            2
          ),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      }

      return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: corsHeaders,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return new Response(
        JSON.stringify({ error: errorMessage }, null, 2),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  },
};
