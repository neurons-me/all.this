// This.GUI — widgets barrel
// Re-export widgets from a single entrypoint.
import HighLighter from './HighLighter/HighLighter';
import HighLightsDrawer from './HighLighter/HighLightsDrawer';
export { HighLighter };
export type { HighLighterProps, HighLighterColor } from './HighLighter/HighLighter';
export { DEFAULT_COLORS as HIGH_LIGHTER_DEFAULT_COLORS } from './HighLighter/HighLighter';
export { HighLightsDrawer };
export type { HighLightsDrawerProps, HighLightsFilterMode } from './HighLighter/HighLightsDrawer';
// Default registry (mirrors components/molecules barrels)
const Widgets = {
  HighLighter,
  HighLightsDrawer,
};

export default Widgets;
