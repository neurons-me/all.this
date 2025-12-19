import MuiDialogContent, { DialogContentProps as MuiDialogContentProps } from '@mui/material/DialogContent';
export type DialogProps = MuiDialogContentProps;
export default function DialogContent(props: DialogProps) {
  return <MuiDialogContent {...props} sx={{ p: 2, bgcolor: 'background.paper', ...props.sx }} />;
}
