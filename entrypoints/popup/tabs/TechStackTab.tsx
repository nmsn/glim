import { useState, useEffect, useCallback } from 'react';
import { TechStackCard } from '../components/TechStackCard';
import { loadRules } from '@/utils/tech-stack/rule-loader';
import { detectFromHeaders } from '@/utils/tech-stack/header-detector';
import { detectPageTechnologiesFromData } from '@/utils/tech-stack/page-detector';
import { mergeTechnologyRecords } from '@/utils/tech-stack/merge';
import { getResponseHeaders } from '@/utils/headers';
import type { RuleConfig, TechnologyRecord, PageData } from '@/utils/tech-stack/types';
import { browser } from 'wxt/browser';

interface TechStackTabProps {
  tabUrl: string;
}

export function TechStackTab({ tabUrl }: TechStackTabProps) {
  const [technologies, setTechnologies] = useState<TechnologyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const runDetection = useCallback(async () => {
    setLoading(true);
    setTechnologies([]);

    try {
      // 1. 加载规则
      const rules = await loadRules() as RuleConfig;

      // 2. 获取页面数据（通过 content script）
      let pageData: PageData | null = null;
      try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          const response = await browser.tabs.sendMessage(tab.id, { type: 'GET_PAGE_DATA' });
          if (response?.success && response.data) {
            pageData = response.data;
          }
        }
      } catch (err) {
        console.error('获取页面数据失败:', err);
      }

      // 3. 并行执行页面检测和 header 检测
      const [pageTechnologies, headerRecords] = await Promise.all([
        pageData
          ? Promise.resolve(detectPageTechnologiesFromData(pageData, rules))
          : Promise.resolve([]),
        getResponseHeaders(tabUrl).catch(() => null),
      ]);

      // 4. Header 检测
      const headerTechs = headerRecords
        ? detectFromHeaders(headerRecords, tabUrl, {
            serverProducts: (rules as any).serverProducts || [],
            poweredByProducts: (rules as any).poweredByProducts || [],
            headerPatterns: (rules as any).headerPatterns || [],
            cdnProviders: (rules as any).cdnProviders || [],
            languages: (rules as any).languages || [],
            websitePrograms: (rules as any).websitePrograms || [],
            interestingHeaders: (rules as any).interestingHeaders || [],
          })
        : [];

      // 5. 合并结果
      const merged = mergeTechnologyRecords([
        ...pageTechnologies,
        ...headerTechs,
      ]);

      setTechnologies(merged);
    } catch (err) {
      console.error('Tech stack detection error:', err);
    } finally {
      setLoading(false);
    }
  }, [tabUrl]);

  useEffect(() => {
    runDetection();
  }, [runDetection]);

  return (
    <TechStackCard technologies={technologies} loading={loading} />
  );
}