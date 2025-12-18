import React from 'react';
import { IconButton, Switch } from '@/gui/components/atoms';
import Icon from '@/gui/Theme/Icon/Icon';
import { useThemeContext } from '@/gui/Theme';
import { Typography, Box } from '@/gui/components/atoms';
import type { ThemeModeToggleProps } from './ThemeModeToggle.types';

const ThemeModeToggle: React.FC<ThemeModeToggleProps> = ({
  variant = 'minimal',
  show = 'icons',
  switchSize = 'medium',
  iconSize = 'medium',
  sx,
  iconSx,
  switchSx,
  labelSx,
  id,
  className,
  ['data-testid']: dataTestId,
}) => {
  const { mode, toggleMode } = useThemeContext();
  const isLight = mode === 'light';
  const labelText = isLight ? 'Light' : 'Dark';
  const iconFontSize = {
    small: '1rem',
    medium: '1.5rem',
    large: '2rem',
  }[iconSize];

  const handleToggle = () => {
    toggleMode();
  };
  if (variant === 'switchMinimal' || variant === 'switchWithLabel') {
    return (
      <Box
        id={id}
        display="flex"
        alignItems="center"
        sx={sx ? ([{ cursor: 'pointer' }, sx] as any) : ({ cursor: 'pointer' } as any)}
        className={className}
        data-testid={dataTestId}
      >
        {/* Always show icons for both switch variants */}
        <Icon
          name="light_mode"
          iconColor={isLight ? 'primary' : 'disabled'}
          fontSize={iconFontSize}
        />
        <Switch
          checked={!isLight}
          onChange={handleToggle}
          color="primary"
          size={switchSize}
          inputProps={{ 'aria-label': 'toggle theme mode' }}
          sx={switchSx}
        />
        <Icon
          name="dark_mode"
          iconColor={!isLight ? 'primary' : 'disabled'}
          fontSize={iconFontSize}
        />
        {variant === 'switchWithLabel' && (
          <Typography
            sx={
              labelSx
                ? ([{ ml: 1 }, labelSx] as any)
                : ({ ml: 1 } as any)
            }
          >
            {labelText}
          </Typography>
        )}
      </Box>
    );
  }

  // variant === 'minimal'
  return (
    <IconButton id={id} onClick={handleToggle} color="inherit" aria-label="toggle theme mode" size={iconSize} className={className} data-testid={dataTestId} sx={sx}>
      {show !== 'label' &&
        (isLight ? (
          <Icon name="light_mode" iconColor="primary" fontSize={iconFontSize} />
        ) : (
          <Icon name="dark_mode" iconColor="primary" fontSize={iconFontSize} />
        ))}
      {(show === 'label' || show === 'both') && (
        <Typography
          sx={
            labelSx
              ? ([{ ml: show === 'both' ? 1 : 0 }, labelSx] as any)
              : ({ ml: show === 'both' ? 1 : 0 } as any)
          }
        >
          {labelText}
        </Typography>
      )}
    </IconButton>
  );
};

export default ThemeModeToggle;
