import * as cheerio from 'cheerio';

export interface Campus {
  code: string;
  name: string;
  address: string;
  city: string;
  fullName: string;
}

export interface DailyMenu {
  day: string;
  date: string;
  dutchDishes: string[];
  englishDishes: string[];
  allRawItems: string[];
}

export interface WeeklyMenuResponse {
  campus: string;
  campusName: string;
  week: 'current' | 'next' | 'previous';
  days: DailyMenu[];
  fetchedAt: string;
}

export const CAMPUSES: Campus[] = [
  {
    code: 'GKG',
    name: "'t Obeetje",
    address: 'Graaf Karel de Goedelaan 5',
    city: 'Kortrijk',
    fullName: "'t Obeetje (Graaf Karel de Goedelaan 5, Kortrijk)",
  },
  {
    code: 'PENTA',
    name: 'Plaza',
    address: 'Sint-Martens-Latemlaan 1B',
    city: 'Kortrijk',
    fullName: 'Plaza (Sint-Martens-Latemlaan 1B, Kortrijk)',
  },
  {
    code: 'RSS',
    name: 'YUM',
    address: 'Rijselstraat 5',
    city: 'Brugge',
    fullName: 'YUM (Rijselstraat 5, Brugge)',
  },
  {
    code: 'RSS1',
    name: 'DAD',
    address: 'Spoorwegstraat 4',
    city: 'Brugge',
    fullName: 'DAD (Spoorwegstraat 4, Brugge)',
  },
  {
    code: 'SIC',
    name: 'BSI',
    address: 'Nijverheidsstraat 112',
    city: 'Brugge',
    fullName: 'BSI (Nijverheidsstraat 112, Brugge)',
  },
  {
    code: 'TS',
    name: 'The Square',
    address: 'Luipaardstraat 12A',
    city: 'Kortrijk',
    fullName: 'The Square (Luipaardstraat 12A, Kortijk)',
  },
];

const BASE_URL = 'https://resto.howest.be/MenuWeekly.aspx';

export class HowestRestoClient {
  private userAgent: string;

  constructor(userAgent = 'HowestRestoTS/1.0 (+https://github.com/MauroDruwel)') {
    this.userAgent = userAgent;
  }

  getCampuses(): Campus[] {
    return CAMPUSES;
  }

  async getMenu(options?: {
    campus?: string;
    week?: 'current' | 'next' | 'previous';
  }): Promise<WeeklyMenuResponse> {
    const campusCode = (options?.campus || 'GKG').toUpperCase();
    const week = options?.week || 'current';

    const matching = CAMPUSES.find((c) => c.code === campusCode);
    if (!matching) {
      throw new Error(`Unknown campus: ${campusCode}. Available: ${CAMPUSES.map((c) => c.code).join(', ')}`);
    }

    const initialRes = await fetch(BASE_URL, {
      headers: { 'User-Agent': this.userAgent },
    });
    if (!initialRes.ok) {
      throw new Error(`Failed to load Howest menu: HTTP ${initialRes.status}`);
    }

    let html = await initialRes.text();

    if (campusCode !== 'GKG' || week !== 'current') {
      const $ = cheerio.load(html);
      const vs = ($('input#__VIEWSTATE').val() as string) || '';
      const vsg = ($('input#__VIEWSTATEGENERATOR').val() as string) || '';
      const ev = ($('input#__EVENTVALIDATION').val() as string) || '';

      const bodyParams = new URLSearchParams({
        __EVENTTARGET: week === 'current' ? 'ddlChooseCampus' : '',
        __EVENTARGUMENT: '',
        __VIEWSTATE: vs,
        __VIEWSTATEGENERATOR: vsg,
        __EVENTVALIDATION: ev,
        ddlChooseCampus: campusCode,
      });

      if (week === 'next') {
        bodyParams.set('btnNextWeeklyMenu', 'Volgende week');
      } else if (week === 'previous') {
        bodyParams.set('btnPreviousWeeklyMenu', 'Vorige week');
      }

      const postRes = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.userAgent,
        },
        body: bodyParams.toString(),
      });

      if (!postRes.ok) {
        throw new Error(`Failed to switch campus/week: HTTP ${postRes.status}`);
      }

      html = await postRes.text();
    }

    const $ = cheerio.load(html);
    const title = $('#titleWeekmenu').text().replace(/^Weekmenu\s*/i, '').trim() || matching.fullName;

    const days: DailyMenu[] = [];
    $('.divWeekdag').each((_, elem) => {
      const day = $(elem).find('.spanDate').text().trim();
      const date = $(elem).find('.spanDag').text().trim();
      const items: string[] = [];

      $(elem)
        .find('li')
        .each((_, li) => {
          const t = $(li).text().trim();
          if (t) items.push(t);
        });

      const starIdx = items.indexOf('***');
      let dutch: string[] = [];
      let english: string[] = [];
      if (starIdx !== -1) {
        dutch = items.slice(0, starIdx);
        english = items.slice(starIdx + 1);
      } else {
        dutch = items.slice();
      }

      days.push({
        day,
        date,
        dutchDishes: dutch.filter(Boolean),
        englishDishes: english.filter(Boolean),
        allRawItems: items.filter(Boolean),
      });
    });

    return {
      campus: campusCode,
      campusName: title,
      week,
      days,
      fetchedAt: new Date().toISOString(),
    };
  }

  async getTodayMenu(options?: {
    campus?: string;
    week?: 'current' | 'next' | 'previous';
  }): Promise<DailyMenu | null> {
    const data = await this.getMenu(options);
    const dayMap: Record<number, string> = {
      1: 'Ma',
      2: 'Di',
      3: 'Wo',
      4: 'Do',
      5: 'Vr',
    };
    const expected = dayMap[new Date().getDay()];
    return data.days.find((d) => d.day === expected) || null;
  }
}
