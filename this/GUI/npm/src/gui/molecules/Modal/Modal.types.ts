/**
 * ModalBoxProps
 * Declarative prop types for the ModalBox component.
 * Supports basic modal behavior and 3D positioning.
 */
export interface ModalProps {
  /** Controls whether the modal is open or closed */
  open: boolean;
  /** Optional title to display in the modal header */
  title?: string;
  /** Handler to call when the modal should close */
  onClose?: () => void;
  /** Modal width (e.g., '400px', '60%', etc.) */
  width?: string | number;
  /** Modal height (e.g., 'auto', '80vh', etc.) */
  height?: string | number;
  /** Applies a background blur effect when true */
  blurBackground?: boolean;
  /** Optional 3D position vector for experimental modal placement */
  xyz?: [number, number, number];
  /** Additional className for styling */
  className?: string;
  /** Optional ID for targeting and registry mapping */
  id?: string;
  /** Optional test ID for automated testing */
  ['data-testid']?: string;
  /** Modal content */
  children?: React.ReactNode;
}