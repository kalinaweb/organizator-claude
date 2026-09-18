'use client';

import { Box, Checkbox, Typography, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useState } from 'react';
import type { Task } from '@todo-app/shared';

interface TaskItemProps {
  task: Task;
  onToggle: (completed: boolean) => void;
  onUpdate: (title: string, description?: string) => void;
  onDelete: () => void;
}

export const TaskItem = ({ task, onToggle, onUpdate, onDelete }: TaskItemProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');

  const handleSave = () => {
    if (title.trim()) {
      onUpdate(title.trim(), description.trim() || undefined);
      setEditDialogOpen(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1,
          borderRadius: 1,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <Checkbox
          checked={task.completed}
          onChange={(e) => onToggle(e.target.checked)}
          size="small"
        />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              textDecoration: task.completed ? 'line-through' : 'none',
              color: task.completed ? 'text.secondary' : 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {task.title}
          </Typography>
          {task.description && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {task.description}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={() => setEditDialogOpen(true)}>
          <Edit fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={onDelete}>
          <Delete fontSize="small" />
        </IconButton>
      </Box>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать задачу</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setEditDialogOpen(false);
            }}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
