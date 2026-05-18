import { useState, useEffect, useCallback } from 'react';
import { TechStackCard } from '../components/TechStackCard';
import { loadRules } from '@/utils/tech-stack/rule-loader';
import { detectPageTechnologies } from '@/utils/tech-stack/page-detector';
import { detectFromHeaders } from '@/utils/tech-stack/header-detector';
import { mergeTechnologyRecords } from '@/utils/tech-stack/merge';
import { getResponseHeaders } from '@/utils/headers';
import type { RuleConfig, TechnologyRecord, PageDetectionInput } from '@/utils/tech-stack/types';

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
      const rules = await loadRules() as RuleConfig;

      // Run page detection and header detection in parallel
      const [pageResult, headerRecords] = await Promise.all([
        detectPageTechnologies({
          url: tabUrl,
          frontendFrameworks: rules.frontendFrameworks,
          uiFrameworks: rules.uiFrameworks,
          buildRuntime: rules.buildRuntime,
          cdnProviders: rules.cdnProviders,
          backendHints: rules.backendHints,
          languages: rules.languages,
        } as PageDetectionInput),
        getResponseHeaders(tabUrl).catch(() => null),
      ]);

      // Detect from headers
      const headerTechs = headerRecords
        ? detectFromHeaders(headerRecords, tabUrl, {
            serverProducts: rules.serverProducts as any[],
            poweredByProducts: rules.poweredByProducts as any[],
            headerPatterns: rules.headerPatterns as any[],
            cdnProviders: rules.cdnProviders as any[],
            languages: rules.languages as any[],
            websitePrograms: rules.websitePrograms as any[],
            interestingHeaders: (rules.interestingHeaders as string[]) || [],
          })
        : [];

      // Merge all results
      const merged = mergeTechnologyRecords([
        ...(pageResult.technologies || []),
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