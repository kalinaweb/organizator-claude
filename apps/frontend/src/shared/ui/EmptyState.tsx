import { Box, Typography, Button } from '@mui/material';
import { Add } from '@mui/icons-material';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState = ({ title, description, actionLabel, onAction, icon }: EmptyStateProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        p: 4,
        textAlign: 'center',
      }}
    >
      {icon && <Box sx={{ mb: 2, opacity: 0.5 }}>{icon}</Box>}
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAction}
          sx={{ mt: 2 }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};
