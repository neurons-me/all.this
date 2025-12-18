import Dialog from './Dialog';

export default {
  title: 'Molecules/Dialog/Dialog',
  component: Dialog,
};

export const Basic = () => (
  <Dialog>
    This is the basic Dialog with default padding.
  </Dialog>
);

export const WithCustomPadding = () => (
  <Dialog  sx={{ p: 4, bgcolor: 'background.default' }}>
    This Dialog has custom padding and background color.
  </Dialog>
);
