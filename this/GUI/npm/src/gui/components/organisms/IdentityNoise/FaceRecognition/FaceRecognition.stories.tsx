/**
 * This.GUI — FaceRecognition (organism)
 *
 * What it is
 * - A camera + face-landmarks UI that can run in two modes:
 *   1) `variant="modal"` : renders inside a `Modal` (default)
 *   2) `variant="inline"`: renders a square camera surface that can live inside any layout
 *
 * Core ideas
 * - The component uses `react-webcam` for camera capture.
 * - When `showLandmarks` is enabled, it attempts to lazy-load MediaPipe Tasks Vision (`@mediapipe/tasks-vision`).
 *   - If the model fails to load, it falls back to a lightweight placeholder landmark set.
 * - The overlay and HUD are mirrored by default (`mirrorPreview=true`) so the mesh matches a mirrored selfie preview.
 *
 * Verification (Option A)
 * - When landmarks are available, the component extracts a stable `FaceTemplate` (a number[]).
 * - It does this by collecting a short burst of templates, then computing a per-dimension median.
 * - Once stable, it can automatically call `verifyUrl` (default: `/api/face/verify`) when `autoVerify=true`.
 *
 * Externally-driven status (Triad-friendly)
 * - Parent apps can drive the HUD badge via:
 *   - `verifyHttpStatus` and `verifyMessage` (to show 404, ERR, etc.)
 *   - `verifyPayload` (to trigger verification using a parent-provided template)
 * - This lets a parent (like Triad) show a badge even if verification happens elsewhere.
 *
 * Events / callbacks
 * - `onCapture(imageDataUrl)` is used in Capture mode (when `showLandmarks=false`).
 * - `onTemplate(template)` emits the latest stable template (or null when clearing).
 * - `onVerify(result)` emits verification JSON from `verifyUrl`.
 * - `onStatus({ httpStatus, message, busy })` emits status as verification progresses.
 *
 * Browser notes
 * - Storybook will request camera permission when these stories render.
 * - Some browsers (Safari) may not support `navigator.permissions` for camera; the component handles that.
 */
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import FaceRecognition from './FaceRecognition';

const meta: Meta<typeof FaceRecognition> = {
  title: 'Identity Noise/FaceRecognition',
  component: FaceRecognition,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: 16, minHeight: 520, display: 'grid', placeItems: 'center', backgroundColor: '#f5f5f5' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# FaceRecognition

## Overview

FaceRecognition is a versatile camera and face landmarks organism designed for React applications. It supports two distinct modes:

- \`modal\`: Renders inside a modal dialog, suitable for workflows requiring user focus.
- \`inline\`: Renders a square camera surface that can be embedded anywhere in your layout.

## Features

- Uses \`react-webcam\` for camera capture.
- Lazy-loads MediaPipe Tasks Vision for face landmark detection when \`showLandmarks\` is enabled.
- Falls back to a lightweight placeholder landmark set if the model fails to load.
- Mirrored preview and overlays by default for a natural selfie experience.
- Extracts stable face templates for verification workflows.
- Supports automatic verification via a configurable API endpoint.
- Allows external status control for integration with parent applications like Triad.

## Key Props

- \`variant\` (\"modal\" | \"inline\"): Determines rendering mode.
- \`showLandmarks\` (boolean): Enables face landmark detection and mesh overlay.
- \`autoVerify\` (boolean): Automatically triggers verification when a stable template is extracted.
- \`verifyUrl\` (string): URL endpoint for face verification requests.
- \`mirrorPreview\` (boolean): Mirrors the camera preview and overlays.
- \`meshStep\` (number): Controls the detail level of the face mesh (1-6).
- \`verifyHttpStatus\` (number): External HTTP status to drive the HUD badge.
- \`verifyMessage\` (string): External message to display in the HUD badge.
- \`verifyPayload\` (any): External template payload to trigger verification.

## Basic usage (React)

\`\`\`jsx
<FaceRecognition
  open={true}
  variant="modal"
  showLandmarks={true}
  autoVerify={true}
  verifyUrl="/api/face/verify"
  onCapture={(imageDataUrl) => { /* handle capture */ }}
  onTemplate={(template) => { /* handle template */ }}
  onVerify={(result) => { /* handle verification result */ }}
  onStatus={({ httpStatus, message, busy }) => { /* handle status updates */ }}
/>
\`\`\`

## Triad / external status usage

Parent applications can control the HUD badge externally by setting \`verifyHttpStatus\` and \`verifyMessage\` props, allowing verification state to be displayed even if performed outside this component.

## Notes

- Storybook will request camera permission when these stories render.
- Some browsers (e.g., Safari) may not support \`navigator.permissions\` for camera; the component handles this gracefully.
        `,
      },
    },
  },
  args: {
    open: true,
    title: 'Face Scan',
    variant: 'modal',
    showLandmarks: false,
    autoVerify: true,
    includeBlendshapes: false,
    meshStep: 1,
    mirrorPreview: true,
  },
  argTypes: {
    open: { control: 'boolean', description: 'Controls whether the modal or inline camera surface is open/visible.' },
    title: { control: 'text', description: 'Title text shown in the modal header.' },
    variant: {
      control: { type: 'radio' },
      options: ['modal', 'inline'],
      description: 'Determines the rendering mode: "modal" for dialog or "inline" for embedded camera surface.',
    },
    showLandmarks: {
      control: 'boolean',
      description: 'Enables face landmark detection, mesh overlay, and template extraction.',
    },
    verifyUrl: {
      control: 'text',
      description: 'URL endpoint used for face verification requests when autoVerify is enabled.',
    },
    autoVerify: {
      control: 'boolean',
      description: 'Automatically triggers verification when a stable template is available.',
    },
    includeBlendshapes: {
      control: 'boolean',
      description: 'Includes blendshape coefficients in the extracted face template data.',
    },
    showMeshConnections: {
      control: 'boolean',
      description: 'Shows connections between face landmarks in the mesh overlay.',
    },
    meshStep: {
      control: { type: 'number', min: 1, max: 6, step: 1 },
      description: 'Controls the detail level of the face mesh; lower values show more points.',
    },
    mirrorPreview: {
      control: 'boolean',
      description: 'Mirrors the camera preview and overlays to match a selfie view.',
    },
    verifyPayload: {
      control: false,
      description: 'External face template payload to trigger verification externally.',
    },
    verifyHttpStatus: {
      control: { type: 'number' },
      description: 'Externally-driven HTTP status code to display HUD badge accordingly.',
    },
    verifyMessage: {
      control: 'text',
      description: 'Externally-driven message to display in the HUD badge.',
    },
    onClose: { action: 'onClose', description: 'Callback fired when the modal or camera surface is closed.' },
    onCapture: { action: 'onCapture', description: 'Callback fired with captured image data URL in capture mode.' },
    onVerify: { action: 'onVerify', description: 'Callback fired with verification result JSON.' },
    onTemplate: { action: 'onTemplate', description: 'Callback fired with the latest stable face template.' },
    onStatus: { action: 'onStatus', description: 'Callback fired with verification status updates.' },
  },
};

export default meta;

type Story = StoryObj<typeof FaceRecognition>;

export const Playground: Story = {
  name: 'Playground',
  render: (args) => {
    if (args.variant === 'inline') {
      return (
        <div style={{ width: 360, border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
          <FaceRecognition {...args} />
        </div>
      );
    }
    return <FaceRecognition {...args} />;
  },
};

export const ModalCapture: Story = {
  name: 'Modal / Capture',
  args: {
    variant: 'modal',
    showLandmarks: false,
    open: true,
  },
  render: (args) => <FaceRecognition {...args} />,
  parameters: {
    docs: { description: { story: 'Capture-only mode. Uses react-webcam screenshot (jpeg) and calls onCapture(imageDataUrl). Landmarks are OFF.' } },
  },
};

export const ModalLandmarksVerify: Story = {
  name: 'Modal / Landmarks + Verify',
  args: {
    variant: 'modal',
    showLandmarks: true,
    autoVerify: true,
    open: true,
  },
  render: (args) => <FaceRecognition {...args} />,
  parameters: {
    docs: { description: { story: 'Landmarks ON. Loads MediaPipe, draws mesh, extracts a stable template, and can auto-verify via verifyUrl.' } },
  },
};

export const InlineLandmarks: Story = {
  name: 'Inline / Landmarks HUD',
  args: {
    variant: 'inline',
    showLandmarks: true,
    open: true,
  },
  render: (args) => (
    <div style={{ width: 360, border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
      <FaceRecognition {...args} />
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: { description: { story: 'Inline surface intended for embedding in layouts. Shows the live mesh overlay + HUD badge when status is available.' } },
  },
};

export const InlineNoLandmarks: Story = {
  name: 'Inline / Camera Only',
  args: {
    variant: 'inline',
    showLandmarks: false,
    open: true,
  },
  render: (args) => (
    <div style={{ width: 360, border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
      <FaceRecognition {...args} />
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: { description: { story: 'Inline camera surface without landmarks. Useful for simple preview / capture flows.' } },
  },
};

export const ExternalStatusBadge404: Story = {
  name: 'External Status / 404',
  args: {
    variant: 'inline',
    showLandmarks: true,
    verifyHttpStatus: 404,
    verifyMessage: '404 (Face Not Found)',
    open: true,
  },
  render: (args) => (
    <div style={{ width: 360, border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
      <FaceRecognition {...args} />
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: { description: { story: 'Demonstrates externally-driven HUD badge (404). Parent can set verifyHttpStatus/verifyMessage without relying on internal fetch.' } },
  },
};

export const ExternalStatusBadgeMatch: Story = {
  name: 'External Status / Match',
  args: {
    variant: 'inline',
    showLandmarks: true,
    verifyHttpStatus: 200,
    verifyMessage: 'Match',
    verifyPayload: undefined,
    open: true,
  },
  render: (args) => (
    <div style={{ width: 360, border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
      <FaceRecognition {...args} />
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: { description: { story: 'Demonstrates externally-driven HUD badge (200/Match). Useful when verification happens in a parent module.' } },
  },
};

export const Closed: Story = {
  name: 'Closed',
  args: {
    open: false,
  },
  render: (args) => <FaceRecognition {...args} />,
  parameters: {
    docs: { description: { story: 'Closed state. In modal variant, nothing is shown when open=false.' } },
  },
};
