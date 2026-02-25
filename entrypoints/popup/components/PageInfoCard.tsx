import { KeyValueCard } from './KeyValueCard';
import type { PageInfo } from '@/utils/page-info';

interface Props {
  pageInfo: PageInfo | null;
  loading?: boolean;
}

export function PageInfoCard({ pageInfo, loading }: Props) {
  if (loading && !pageInfo) {
    return (
      <KeyValueCard
        title="基础信息"
        data={[
          { label: '标题', value: '...' },
          { label: '来源', value: '...' },
          { label: 'Content-Type', value: '...' },
          { label: '字符编码', value: '...' },
          { label: 'HTML 长度', value: '...' },
        ]}
        loading={true}
      />
    );
  }

  if (!pageInfo) return null;

  return (
    <KeyValueCard
      title="基础信息"
      data={[
        { label: '标题', value: pageInfo.title || '(无标题)' },
        { label: '来源', value: pageInfo.referrer || '(无)' },
        { label: 'Content-Type', value: pageInfo.contentType || '(无)' },
        { label: '字符编码', value: pageInfo.charset || '(无)' },
        { label: 'HTML 长度', value: `${pageInfo.html.length} 字符` },
      ]}
      loading={loading}
    />
  );
}
