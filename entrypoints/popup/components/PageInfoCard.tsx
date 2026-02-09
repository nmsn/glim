import { DataCard } from './KeyValueCard';
import type { PageInfo } from '@/utils/page-info';

interface Props {
  pageInfo: PageInfo;
}

export function PageInfoCard({ pageInfo }: Props) {
  return (
    <DataCard
      title="页面信息"
      icon="📄"
      data={[
        { label: '标题', value: pageInfo.title || '(无标题)', icon: '📑' },
        { label: '来源', value: pageInfo.referrer || '(无)', icon: '🔗' },
        { label: 'Content-Type', value: pageInfo.contentType || '(无)', icon: '📝' },
        { label: '字符编码', value: pageInfo.charset || '(无)', icon: '🔤' },
        { label: 'HTML 长度', value: `${pageInfo.html.length} 字符`, icon: '📏' },
      ]}
    />
  );
}
