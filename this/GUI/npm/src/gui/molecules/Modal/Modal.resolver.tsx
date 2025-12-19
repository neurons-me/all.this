import type { RegistryEntry } from '@/gui/registry/types';
import { ensureNodeId } from '@/gui/utils/nodeID';
import Modal from './Modal';
import type { ModalProps } from './Modal.types';

/**
 * ModalBoxResolver
 * - Declaratively maps a JSON-friendly spec to <ModalBox /> props.
 * - Supports declarative 3D position via xyz prop.
 * - Keeps it registry-compatible for GUI schema systems.
 */
const ModalResolver: RegistryEntry = {
  type: 'ModalBox',
  resolve(spec: any) {
    const p: ModalProps = spec.props ?? {};
    const rootProps: any = {
      open: p.open ?? false,
      title: p.title ?? '',
      onClose: p.onClose ?? (() => {}),
      width: p.width ?? 'auto',
      height: p.height ?? 'auto',
      blurBackground: p.blurBackground ?? true,
      xyz: p.xyz,
      id: ensureNodeId('modalbox', p.id),
      className: p.className,
      'data-testid': p['data-testid'],
    };

    return (
      <Modal {...rootProps}>
        {p.children}
      </Modal>
    );
  },
};

export default ModalResolver;