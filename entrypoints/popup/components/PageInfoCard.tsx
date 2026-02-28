import { useTranslation } from 'react-i18next';
import { KeyValueCard } from './KeyValueCard';
import type { PageInfo } from '@/utils/page-info';

interface Props {
  pageInfo: PageInfo | null;
  loading?: boolean;
}

export function PageInfoCard({ pageInfo, loading }: Props) {
  const { t } = useTranslation();

  if (loading && !pageInfo) {
    return (
      <KeyValueCard
        title={t('pageInfo.title')}
        data={[
          { label: t('pageInfo.title_label'), value: '...' },
          { label: 'URL', value: '...' },
          { label: 'Content-Type', value: '...' },
          { label: t('pageInfo.charset') || 'Charset', value: '...' },
        ]}
        loading={true}
      />
    );
  }

  if (!pageInfo) return null;

  return (
    <KeyValueCard
      title={t('pageInfo.title')}
      data={[
        { label: t('pageInfo.title_label'), value: pageInfo.title || `(${t('pageInfo.notFound')})` },
        { label: 'URL', value: pageInfo.url || `(${t('pageInfo.notFound')})` },
        { label: 'Content-Type', value: pageInfo.contentType || `(${t('pageInfo.notFound')})` },
        { label: t('pageInfo.charset') || 'Charset', value: pageInfo.charset || `(${t('pageInfo.notFound')})` },
      ]}
      loading={loading}
    />
  );
}
