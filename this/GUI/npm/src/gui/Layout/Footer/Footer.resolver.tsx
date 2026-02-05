import type { RegistryEntry } from '@/Registry/types';
import Footer from './Footer';
import type { FooterElement } from './Footer.types';

type FooterSpec = {
  type: 'Footer';
  props?: {
    brandLabel?: string;
    brandLogo?: string;
    brandHref?: string;
    leftElements?: FooterElement[];
    centerElements?: FooterElement[];
    rightElements?: FooterElement[];
    position?: 'static' | 'fixed' | 'sticky';
    elevation?: number;
    className?: string;
    id?: string;
    'data-testid'?: string;
  };
};

const FooterResolver: RegistryEntry = {
  type: 'Footer',
  resolve(spec: FooterSpec) {
    const props = spec.props ?? {};
    return (
      <Footer
        brandLabel={props.brandLabel}
        brandLogo={props.brandLogo}
        brandHref={props.brandHref}
        leftElements={props.leftElements}
        centerElements={props.centerElements}
        rightElements={props.rightElements}
        position={props.position}
        elevation={props.elevation}
        className={props.className}
        id={props.id}
        data-testid={props['data-testid']}
      />
    );
  },
};

export default FooterResolver;
