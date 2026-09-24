'use client';

import { Card, CardHeader, CardContent, IconButton, Box, TextField, Button, Typography } from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { TaskItem } from '@/features/tasks/ui/TaskItem';
import { useTasks } from '@/features/tasks';
import type { List, UpdateListDto } from '@todo-app/shared';

interface ListCardProps {
  list: List;
  onUpdateList: (listId: string, dto: UpdateListDto) => void;
  onDeleteList: (listId: string) => void;
}

export const ListCard = ({ list, onUpdateList, onDeleteList }: ListCardProps) => {
  const { tasks, createTask, updateTask, deleteTask, toggleTask } = useTasks(list.id);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    setTitle(list.title);
  }, [list.title]);

  const handleSaveTitle = () => {
    if (title.trim() && title !== list.title) {
      onUpdateList(list.id, { title: title.trim() });
    }
    setIsEditing(false);
  };

  const handleAddTask = async () => {
    if (newTaskTitle.trim()) {
      await createTask({ title: newTaskTitle.trim(), listId: list.id });
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card
      sx={{
        minWidth: 320,
        maxWidth: 370,
        height: 'fit-content',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <CardHeader
        title={
          isEditing ? (
            <TextField
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              autoFocus
              fullWidth
            />
          ) : (
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
              {list.title}
            </Typography>
          )
        }
        action={
          <Box>
            <IconButton size="small" onClick={() => setIsEditing(true)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDeleteList(list.id)}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        }
        sx={{ pb: 1.5 }}
      />

      {totalCount > 0 && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Прогресс
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {completedCount}/{totalCount}
            </Typography>
          </Box>
          <Box
            sx={{
              width: '100%',
              height: 6,
              bgcolor: '#E8ECEF',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00BCD4 0%, #00ACC1 100%)',
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={(completed) => toggleTask(task.id, completed)}
              onUpdate={(title, description) => updateTask(task.id, { title, description })}
              onDelete={() => deleteTask(task.id)}
            />
          ))}

          {isAddingTask ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
              <TextField
                size="small"
                placeholder="Название задачи"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTask();
                  if (e.key === 'Escape') setIsAddingTask(false);
                }}
                autoFocus
                fullWidth
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" onClick={handleAddTask} variant="contained" sx={{ fontWeight: 600 }}>
                  Добавить
                </Button>
                <Button size="small" onClick={() => setIsAddingTask(false)}>
                  Отмена
                </Button>
              </Box>
            </Box>
          ) : (
            <Button
              startIcon={<Add />}
              onClick={() => setIsAddingTask(true)}
              size="small"
              sx={{
                mt: 1,
                color: 'text.secondary',
                fontWeight: 500,
                justifyContent: 'flex-start',
              }}
            >
              Добавить задачу
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
