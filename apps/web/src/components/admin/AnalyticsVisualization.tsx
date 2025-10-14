// React import not needed with new JSX transform
import AnalyticsVisualizationImpl from '../../../components/admin/AnalyticsVisualization';

export interface AnalyticsVisualizationProps {
  data: Record<string, unknown>;
  isLoading?: boolean;
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'pdf' | 'json') => void;
}

const AnalyticsVisualization = AnalyticsVisualizationImpl as unknown as (props: AnalyticsVisualizationProps) => JSX.Element;

export default AnalyticsVisualization;
