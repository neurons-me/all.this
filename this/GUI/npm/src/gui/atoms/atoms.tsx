/* 
 * This.GUI — primitives
 * Thin wrappers around MUI components to present a stable, library-owned API.
 * Internally we use MUI, but components in the design system should import from
 * "@/gui/primitives" instead of "@mui/material". This lets us swap engines later.
 * 
 * La regla estándar en tu wrapper
 *   • Si MUI lo declaró polimórfico → usa OverridableComponent en tu wrapper.
 *   • Si no lo es → usa forwardRef normal.
 *
 * Así garantizas dos cosas:
 * ✅ Tu wrapper no pierde nada de lo que MUI ofrece.
 * ✅ No te complicas agregando polimorfismo donde MUI no lo soporta.
 */

import type { SxProps, Theme } from '@mui/material/styles';
// Bars are not polymorphic so we wrap it with forwardRef
import Bar from './Bar/Bar';
export { default as Bar } from './Bar/Bar';
// Box is polymorphic so we re-export it directly
import Box, { type BoxProps } from './Box/Box';
export { default as Box } from './Box/Box';
export type { BoxProps } from './Box/Box';
// Avatar is not polymorphic so we wrap it with forwardRef
import Avatar, { type AvatarProps } from './Avatar/Avatar';
export { default as Avatar } from './Avatar/Avatar';
export type { AvatarProps } from './Avatar/Avatar';
// Button is polymorphic so we re-export it directly
import Button from './Button/Button';
export { default as Button } from './Button/Button';
export type { GuiButtonProps as ButtonProps } from './Button/Button';
// Grid is polymorphic so we re-export it directly
import Grid from './Grid/Grid';
export { default as Grid } from './Grid/Grid';
export type { GridProps } from './Grid/Grid.types';
// Collapse is not polymorphic so we wrap it with forwardRef
import Collapse, { type CollapseProps } from './Collapse/Collapse';
export { default as Collapse } from './Collapse/Collapse';
export type { CollapseProps } from './Collapse/Collapse';
// IconButton is polymorphic so we re-export it directly
import IconButton, { type IconButtonProps } from './IconButton/IconButton';
export { default as IconButton } from './IconButton/IconButton';
export type { IconButtonProps } from './IconButton/IconButton';
// Divider is not polymorphic so we wrap it with forwardRef
import Divider, { type DividerProps } from './Divider/Divider';
export { default as Divider } from './Divider/Divider';
export type { DividerProps } from './Divider/Divider';
// Drawer is not polymorphic so we wrap it with forwardRef
import Drawer, { type DrawerProps } from './Drawer/Drawer';
export { default as Drawer } from './Drawer/Drawer';
export type { DrawerProps } from './Drawer/Drawer';
// Link is polymorphic so we re-export it directly
import Link from './Link/Link';
export { default as Link } from './Link/Link';
export type { LinkProps } from './Link/Link';
// List and related are not polymorphic so we wrap them with forwardRef
import List, { type ListProps } from './List/List';
export { default as List } from './List/List';
export type { ListProps } from './List/List';
import ListItem, { type ListItemProps } from './ListItem/ListItem';
export { default as ListItem } from './ListItem/ListItem';
export type { ListItemProps } from './ListItem/ListItem';
import ListItemButton, { type ListItemButtonProps } from './ListItemButton/ListItemButton';
export { default as ListItemButton } from './ListItemButton/ListItemButton';
export type { ListItemButtonProps } from './ListItemButton/ListItemButton';
import ListItemIcon, { type ListItemIconProps } from './ListItemIcon/ListItemIcon';
export { default as ListItemIcon } from './ListItemIcon/ListItemIcon';
export type { ListItemIconProps } from './ListItemIcon/ListItemIcon';
import ListItemText, { type ListItemTextProps } from './ListItemText/ListItemText';
export { default as ListItemText } from './ListItemText/ListItemText';
export type { ListItemTextProps } from './ListItemText/ListItemText';
// Menu and related are polymorphic so we re-export them directly
import Menu, { type MenuProps } from './Menu/Menu';
export { default as Menu } from './Menu/Menu';
export type { MenuProps } from './Menu/Menu';
import MenuItem, { type MenuItemProps } from './MenuItem/MenuItem';
export { default as MenuItem } from './MenuItem/MenuItem';
export type { MenuItemProps } from './MenuItem/MenuItem';
// Paper is not polymorphic so we wrap it with forwardRef
import Paper, { type PaperProps } from './Paper/Paper';
export { default as Paper } from './Paper/Paper';
export type { PaperProps } from './Paper/Paper';
// Stack is not polymorphic so we wrap it with forwardRef
import Stack, { type StackProps } from './Stack/Stack';
export { default as Stack } from './Stack/Stack';
export type { StackProps } from './Stack/Stack';
// Switch is not polymorphic so we wrap it with forwardRef
import Switch, { type SwitchProps } from './Switch/Switch';
export { default as Switch } from './Switch/Switch';
export type { SwitchProps } from './Switch/Switch';
// Tables
import Table from './Table/Table';
export { default as Table } from './Table/Table';
export type { TableProps } from './Table/Table';
import TableBody from './Table/Body/TableBody';
export { default as TableBody } from './Table/Body/TableBody';
export type { TableBodyProps } from './Table/Body/TableBody';
import TableCell from './Table/Cell/TableCell';
export { default as TableCell } from './Table/Cell/TableCell';
export type { TableCellProps } from './Table/Cell/TableCell';
import TableHead from './Table/Head/TableHead';
export { default as TableHead } from './Table/Head/TableHead';
export type { TableHeadProps } from './Table/Head/TableHead';
import TableRow from './Table/Row/TableRow';
export { default as TableRow } from './Table/Row/TableRow';
export type { TableRowProps } from './Table/Row/TableRow';
// Toolbar is not polymorphic so we wrap it with forwardRef
import Toolbar from './Toolbar/Toolbar';
export { default as Toolbar } from './Toolbar/Toolbar';
export type { ToolbarProps } from './Toolbar/Toolbar';
// Tooltip is not polymorphic so we wrap it with forwardRef
import Tooltip from './Tooltip/Tooltip';
export { default as Tooltip } from './Tooltip/Tooltip';
export type { TooltipProps } from './Tooltip/Tooltip';
// Typography is polymorphic so we re-export it directly
import Typography, { type TypographyProps } from './Typography/Typography';
export { default as Typography } from './Typography/Typography';
export type { TypographyProps } from './Typography/Typography';
import Section from './Section/Section';
export { default as Section } from './Section/Section';
export type { SectionProps } from './Section/Section.types';
/* -------------------------------------------------------------------------------------------------
 * GuiSx — re-export of MUI’s SxProps<Theme>
 * -------------------------------------------------------------------------------------------------*/
/** Public sx type (kept for now to ease migration). */
export type GuiSx = SxProps<Theme>;
/* -------------------------------------------------------------------------------------------------
 * Namespace bundle export (optional ergonomic import)
 * -------------------------------------------------------------------------------------------------
 * Examples:
 *   import { Box } from "this.gui";   // best tree-shaking
 *   import { atoms } from "this.gui"; // grouped namespace: atoms.Box, atoms.Button, ...
 */
export const atoms = {
  Box,
  Typography,
  Link,
  Stack,
  Divider,
  Bar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Button,
  Grid,
  Tooltip,
  Switch,
  Paper,
  Avatar,
  Section,
    Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} as const;
