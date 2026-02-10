import { KeyValueCard } from './KeyValueCard';
import type { PageInfo } from '@/utils/page-info';

interface Props {
  pageInfo: PageInfo;
}

export function PageInfoCard({ pageInfo }: Props) {
  return (
    <KeyValueCard
      title="基础信息"
      icon="◆"
      variant="grid"
      data={[
        { label: '标题', value: pageInfo.title || '(无标题)' },
        { label: '来源', value: pageInfo.referrer || '(无)' },
        { label: 'Content-Type', value: pageInfo.contentType || '(无)' },
        { label: '字符编码', value: pageInfo.charset || '(无)' },
        { label: 'HTML 长度', value: `${pageInfo.html.length} 字符` },
      ]}
    />
  );
}
