'use client';

import { Box, Checkbox, Typography, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useState, useRef, useEffect } from 'react';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter';
import type { Task } from '@todo-app/shared';

interface TaskItemProps {
  task: Task;
  listId: string;
  onToggle: (completed: boolean) => void;
  onUpdate: (title: string, description?: string) => void;
  onDelete: () => void;
}

export const TaskItem = ({ task, listId, onToggle, onUpdate, onDelete }: TaskItemProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [isDragging, setIsDragging] = useState(false);

  const ref = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const cleanup = draggable({
      element: el,
      getInitialData: () => ({
        task: {
          listId,
          taskId: task.id,
          order: task.order,
        },
      }),
      onDragStart: () => {        
        setIsDragging(true);
      },
      onDrop: () => {
        setIsDragging(false);
      },
    });

    return cleanup;
  }, [listId, task.id, task.order]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const cleanup = dropTargetForElements({
      element: el,
      getData: () => ({ order: task.order }),
      onDragEnter: () => {},
      onDragLeave: () => {},
      onDrop: () => {},
    });

    return cleanup;
  }, [task.order]);

  const handleSave = () => {
    if (title.trim()) {
      onUpdate(title.trim(), description.trim() || undefined);
      setEditDialogOpen(false);
    }
  };

  return (
    <>
      <Box
        ref={ref}
        data-order={task.order}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          borderRadius: 2,
          bgcolor: '#FAFBFC',
          border: '1px solid',
          borderColor: '#E8ECEF',
          transition: 'all 0.2s ease',
          opacity: isDragging ? 0.5 : 1,
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
          '&:hover': {
            bgcolor: '#F5F7F9',
            borderColor: '#D4DCE4',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <Checkbox
          checked={task.completed}
          onChange={(e) => onToggle(e.target.checked)}
          size="small"
          sx={{
            color: '#D4DCE4',
            '&.Mui-checked': {
              color: '#00BCD4',
            },
          }}
        />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              textDecoration: task.completed ? 'line-through' : 'none',
              color: task.completed ? 'text.secondary' : 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: 500,
              fontSize: '0.9375rem',
            }}
          >
            {task.title}
          </Typography>
          {task.description && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'text.secondary',
                mt: 0.5,
                fontSize: '0.8125rem',
              }}
            >
              {task.description}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={() => setEditDialogOpen(true)} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
          <Edit fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={onDelete} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
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
