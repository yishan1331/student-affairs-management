/**
 * 網站設置實體接口
 */
export interface IWebsiteSettings {
  siteName: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  metaDescription: string;
  metaKeywords: string[];
  updatedAt: string;
}

/**
 * 更新網站設置的數據類型
 */
export interface IWebsiteSettingsUpdateInput {
  siteName?: string;
  logo?: string;
  favicon?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  metaDescription?: string;
  metaKeywords?: string[];
}

/**
 * 網站訪問統計數據
 */
export interface IVisitStats {
  totalVisits: number;
  uniqueVisitors: number;
  period: 'day' | 'week' | 'month' | 'year';
  data: {
    date: string;
    visits: number;
    uniqueVisitors: number;
  }[];
}
