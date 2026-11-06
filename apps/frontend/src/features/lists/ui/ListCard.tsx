'use client';

import { Card, CardHeader, CardContent, IconButton, Box, TextField, Button, Typography } from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import { useState, useEffect, useRef, useMemo } from 'react';
import { dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter';
import { TaskItem } from '@/features/tasks/ui/TaskItem';
import { useTasks } from '@/features/tasks';
import type { List, Task, UpdateListDto } from '@todo-app/shared';

interface ListCardProps {
  list: List;
  onUpdateList: (listId: string, dto: UpdateListDto) => void;
  onDeleteList: (listId: string) => void;
  onRefetch?: () => void;
  onRefetchSourceList?: (listId: string) => void;
  onRegisterTaskRefetch?: (listId: string, refetchFn: () => Promise<void>) => void;
}

export const ListCard = ({ list, onUpdateList, onDeleteList, onRefetch, onRefetchSourceList, onRegisterTaskRefetch }: ListCardProps) => {
  const { tasks, createTask, updateTask, deleteTask, toggleTask, reorderTask, resortTasks, refetch } = useTasks(list.id);

  const sortedTasks = useMemo(() => [...tasks].sort((a, b) => a.order - b.order), [tasks]);

  // Регистрируем свой refetch в глобальной карте, чтобы другие ListCard могли рефетчить этот список
  useEffect(() => {
    onRegisterTaskRefetch?.(list.id, refetch);
  }, [list.id, refetch, onRegisterTaskRefetch]);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null!);
  const tasksContainerRef = useRef<HTMLDivElement>(null);
  const currentDropTargetRef = useRef<HTMLElement | null>(null);
  const sortedTasksRef = useRef<Task[]>([]);
  const resortTasksRef = useRef(resortTasks);

  useEffect(() => {
    setTitle(list.title);
  }, [list.title]);

  // Держим ref в актуальном состоянии для замыкания drag-and-drop
  useEffect(() => {
    sortedTasksRef.current = sortedTasks;
  }, [sortedTasks]);

  useEffect(() => {
    resortTasksRef.current = resortTasks;
  }, [resortTasks]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const dropTargetCleanup = dropTargetForElements({
      element: el,
      getData: () => ({ listId: list.id }),
      onDragEnter: () => {
        setIsHovered(true);
      },
      onDragLeave: () => {
        setIsHovered(false);
      },
      onDrop: async (event) => {
        setIsHovered(false);
        const data = event.source.data;
        if ('task' in data) {
          const taskData = data.task as { listId: string; taskId: string; order: number };
          const targetElement = currentDropTargetRef.current;
          const taskItem = targetElement?.closest('[data-order]') as HTMLElement | null;
          const targetOrder = taskItem ? parseInt(taskItem.dataset.order!, 10) : null;

          // Ищем предыдущую задачу через ref (актуально внутри замыкания DnD)
          let prevOrder = 0;
          if (targetOrder !== null) {
            const currentSorted = sortedTasksRef.current;
            const targetIndex = currentSorted.findIndex(t => t.order === targetOrder);
            if (targetIndex > 0) {
              prevOrder = currentSorted[targetIndex - 1].order;
            }
          }

          // Вычисляем новый order: шаг 1000 даёт запас ~10 вставок между любыми двумя задачами
          const ORDER_GAP = 1000;
          let newOrder: number;
          if (targetOrder !== null) {
            // Вставляем между prevOrder и targetOrder
            newOrder = Math.floor((prevOrder + targetOrder) / 2);
          } else {
            // В конец списка
            newOrder = tasks.length > 0
              ? Math.max(...tasks.map(t => t.order)) + ORDER_GAP
              : ORDER_GAP;
          }          

          const sourceListId = taskData.listId;
          const crossedLists = sourceListId !== list.id;
          await reorderTask(taskData.taskId, list.id, newOrder);
          // Resort целевого списка при перемещении между списками
          if (crossedLists) {
            await resortTasksRef.current();
          }
          // Resort как fallback если order уперся в низкий диапазон
          else if (newOrder < 100) {
            await resortTasksRef.current();
          }
          await refetch();
          // Обновляем исходный список (бэкенд уже сделал resort при смене listId)
          if (crossedLists) {
            onRefetchSourceList?.(sourceListId);
            onRefetch?.();
          }
        }
      },
    });

    const monitorCleanup = monitorForElements({
      onDrag: (args) => {
        const location = args.location;
        if (location.current.dropTargets[0]) {
          currentDropTargetRef.current = location.current.dropTargets[0].element as HTMLElement;
        }
      },
    });

    return () => {
      dropTargetCleanup();
      monitorCleanup();
    };
  }, [list.id, refetch, reorderTask, resortTasks, onRefetch, onRefetchSourceList]);

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
      ref={cardRef}
      sx={{
        minWidth: 320,
        maxWidth: 370,
        height: 'fit-content',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        transition: 'all 0.2s ease',
        border: '2px solid transparent',
        ...(isHovered ? {
          borderColor: '#00BCD4',
          boxShadow: '0px 8px 24px rgba(0, 188, 212, 0.15)',
        } : {}),
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
        <Box ref={tasksContainerRef} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {sortedTasks.map((task) => (
            <TaskItem
              key={task.id}
              listId={list.id}
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
