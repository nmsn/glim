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
  const [refreshKey, setRefreshKey] = useState(0);

  const runDetection = useCallback(async () => {
    setLoading(true);
    setTechnologies([]);

    try {
      // 1. 加载规则
      console.log('[TechStackTab] 开始加载规则');
      const rules = await loadRules() as RuleConfig;
      console.log('[TechStackTab] 规则加载完成, keys:', Object.keys(rules));

      // 2. 获取页面数据（通过 content script）
      console.log('[TechStackTab] 开始获取页面数据, tabUrl:', tabUrl);
      let pageData: PageData | null = null;
      try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        console.log('[TechStackTab] 当前活动标签:', tab?.id, tab?.url);
        if (tab?.id) {
          console.log('[TechStackTab] 发送 GET_PAGE_DATA 消息到 tab:', tab.id);
          const response = await browser.tabs.sendMessage(
              tab.id,
              { type: 'GET_PAGE_DATA' },
              { frameId: 0 }
            );
          console.log('[TechStackTab] 收到响应:', response);
          if (response?.success && response.data) {
            pageData = response.data;
            console.log('[TechStackTab] 页面数据获取成功, scripts:', pageData.scripts.length, 'classes:', Object.keys(pageData.classes).length);
          }
        }
      } catch (err) {
        console.error('[TechStackTab] 获取页面数据失败:', err);
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
    let cancelled = false;

    runDetection().then(() => {
      if (cancelled) return;
    });

    return () => {
      cancelled = true;
    };
  }, [runDetection, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <TechStackCard technologies={technologies} loading={loading} onRefresh={handleRefresh} />
  );
}