export interface Campus {
  code: string;
  name: string;
  address: string;
  city: string;
  fullName: string;
}

export interface DailyMenu {
  day: string; // 'Ma', 'Di', 'Wo', 'Do', 'Vr'
  date: string; // '09 oktober'
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
