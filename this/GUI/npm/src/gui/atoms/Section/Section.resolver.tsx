import Section from './Section';
import type { SectionProps } from './Section.types';

export const SectionResolver = {
  type: 'Section',
  component: Section,
  resolve: (props: SectionProps) => <Section {...props} />,
};

export default SectionResolver;