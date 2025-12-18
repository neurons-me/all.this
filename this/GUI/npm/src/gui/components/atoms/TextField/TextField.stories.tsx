import TextField from "./TextField";
import { Stack } from "@/gui/components/atoms";

export default {
  title: "Atoms/Elements/TextField",
  component: TextField,
  parameters: {
    layout: "centered",
  },
};

export const Variants = () => (
  <Stack spacing={2} sx={{ width: 400 }}>
    <TextField label="Default" variant="outlined" placeholder="Type something..." />
    <TextField label="Filled" variant="filled" placeholder="Type something..." />
    <TextField label="Standard" variant="standard" placeholder="Type something..." />
    <TextField
      label="Multiline"
      variant="outlined"
      multiline
      rows={4}
      placeholder="Write a long message..."
    />
  </Stack>
);