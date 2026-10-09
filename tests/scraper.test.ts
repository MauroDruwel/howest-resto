import { describe, it, expect } from 'vitest';
import { parseMenuHtml, CAMPUSES } from '../src/scraper.js';

describe('Howest Resto Scraper', () => {
  it('registers all known Howest campuses', () => {
    expect(CAMPUSES.length).toBeGreaterThanOrEqual(6);
    const codes = CAMPUSES.map((c) => c.code);
    expect(codes).toContain('GKG');
    expect(codes).toContain('RSS');
    expect(codes).toContain('RSS1');
  });

  it('correctly parses HTML with Dutch and English dishes', () => {
    const sampleHtml = `
      <h3 id="titleWeekmenu">Weekmenu 't Obeetje (Graaf Karel de Goedelaan 5, Kortrijk)</h3>
      <div class="divWeekdag">
        <span class="spanDate">Vr</span>
        <span class="spanDag">09 oktober</span>
        <ul>
          <li>Ravioli 4-kazen met spinazie &amp; Ricotta</li>
          <li>***</li>
          <li>Ravioli 4-Cheeses with Spinach &amp; Ricotta</li>
        </ul>
      </div>
      <div class="divWeekdag">
        <span class="spanDate">Do</span>
        <span class="spanDag">08 oktober</span>
        <ul>
          <li>Orloffgebraad met Champignonroomsaus</li>
          <li>Gestoofde duo van Wortelen</li>
          <li>Kroketten</li>
          <li>***</li>
          <li>Orloff Roast with Mushroom Cream Sauce</li>
          <li>Braised Duo Carrots</li>
          <li>Crocquettes</li>
        </ul>
      </div>
    `;

    const result = parseMenuHtml(sampleHtml);
    expect(result.days).toHaveLength(2);

    const friday = result.days[0];
    expect(friday.day).toBe('Vr');
    expect(friday.date).toBe('09 oktober');
    expect(friday.dutchDishes).toEqual(['Ravioli 4-kazen met spinazie & Ricotta']);
    expect(friday.englishDishes).toEqual(['Ravioli 4-Cheeses with Spinach & Ricotta']);

    const thursday = result.days[1];
    expect(thursday.day).toBe('Do');
    expect(thursday.dutchDishes).toHaveLength(3);
    expect(thursday.englishDishes).toHaveLength(3);
    expect(thursday.dutchDishes[0]).toBe('Orloffgebraad met Champignonroomsaus');
  });

  it('handles menus without English translations gracefully', () => {
    const sampleHtml = `
      <div class="divWeekdag">
        <span class="spanDate">Ma</span>
        <span class="spanDag">05 oktober</span>
        <ul>
          <li>Dagschotel</li>
        </ul>
      </div>
    `;

    const result = parseMenuHtml(sampleHtml);
    expect(result.days).toHaveLength(1);
    expect(result.days[0].dutchDishes).toEqual(['Dagschotel']);
    expect(result.days[0].englishDishes).toEqual([]);
  });
});
