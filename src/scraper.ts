import * as cheerio from 'cheerio';
import { Campus, DailyMenu, WeeklyMenuResponse } from './types.js';

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

/**
 * Parses raw HTML of a MenuWeekly page into structured DailyMenu items
 */
export function parseMenuHtml(html: string): { campusTitle: string; days: DailyMenu[] } {
  const $ = cheerio.load(html);
  const campusTitle = $('#titleWeekmenu').text().replace(/^Weekmenu\s*/i, '').trim() || '';

  const days: DailyMenu[] = [];

  $('.divWeekdag').each((_, elem) => {
    const day = $(elem).find('.spanDate').text().trim();
    const date = $(elem).find('.spanDag').text().trim();

    const items: string[] = [];
    $(elem)
      .find('li')
      .each((_, li) => {
        const text = $(li).text().trim();
        if (text) {
          items.push(text);
        }
      });

    const starIndex = items.indexOf('***');
    let dutchDishes: string[] = [];
    let englishDishes: string[] = [];

    if (starIndex !== -1) {
      dutchDishes = items.slice(0, starIndex).filter((s) => s.length > 0);
      englishDishes = items.slice(starIndex + 1).filter((s) => s.length > 0);
    } else {
      dutchDishes = items.filter((s) => s.length > 0);
    }

    days.push({
      day,
      date,
      dutchDishes,
      englishDishes,
      allRawItems: items,
    });
  });

  return { campusTitle, days };
}

/**
 * Fetches weekly menu for a given campus and week offset from resto.howest.be
 */
export async function fetchWeeklyMenu(
  campusCode = 'GKG',
  week: 'current' | 'next' | 'previous' = 'current'
): Promise<WeeklyMenuResponse> {
  const normalizedCode = campusCode.toUpperCase();
  const campus = CAMPUSES.find((c) => c.code === normalizedCode);
  if (!campus) {
    throw new Error(`Unknown campus code: ${campusCode}. Available: ${CAMPUSES.map((c) => c.code).join(', ')}`);
  }

  const initialRes = await fetch(BASE_URL, {
    headers: {
      'User-Agent': 'HowestRestoForge/1.0 (+https://github.com/MauroDruwel)',
    },
  });

  if (!initialRes.ok) {
    throw new Error(`Failed to fetch menu page from Howest: HTTP ${initialRes.status}`);
  }

  let html = await initialRes.text();

  // If campus is not default (GKG) OR if week is not current, post the form
  if (normalizedCode !== 'GKG' || week !== 'current') {
    const $ = cheerio.load(html);
    const viewState = ($('input#__VIEWSTATE').val() as string) || '';
    const viewStateGen = ($('input#__VIEWSTATEGENERATOR').val() as string) || '';
    const eventValidation = ($('input#__EVENTVALIDATION').val() as string) || '';

    const bodyParams = new URLSearchParams({
      __EVENTTARGET: week === 'current' ? 'ddlChooseCampus' : '',
      __EVENTARGUMENT: '',
      __VIEWSTATE: viewState,
      __VIEWSTATEGENERATOR: viewStateGen,
      __EVENTVALIDATION: eventValidation,
      ddlChooseCampus: normalizedCode,
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
        'User-Agent': 'HowestRestoForge/1.0 (+https://github.com/MauroDruwel)',
      },
      body: bodyParams.toString(),
    });

    if (!postRes.ok) {
      throw new Error(`Failed to fetch menu for ${normalizedCode} (${week}): HTTP ${postRes.status}`);
    }

    html = await postRes.text();
  }

  const parsed = parseMenuHtml(html);

  return {
    campus: normalizedCode,
    campusName: parsed.campusTitle || campus.fullName,
    week,
    days: parsed.days,
    fetchedAt: new Date().toISOString(),
  };
}
