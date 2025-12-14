'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import styles from './page.module.css'

interface Task {
  id: string
  content: string
}

interface Column {
  id: string
  title: string
  tasks: Task[]
}

const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: [
      { id: 'task-1', content: 'Research project requirements' },
      { id: 'task-2', content: 'Create wireframes' },
      { id: 'task-3', content: 'Set up development environment' },
    ]
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [
      { id: 'task-4', content: 'Build authentication system' },
      { id: 'task-5', content: 'Design database schema' },
    ]
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      { id: 'task-6', content: 'Project kickoff meeting' },
      { id: 'task-7', content: 'Choose tech stack' },
    ]
  }
]

export default function Home() {
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [newTaskContent, setNewTaskContent] = useState('')
  const [selectedColumn, setSelectedColumn] = useState('todo')

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result

    if (!destination) return

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId)
    const destColumn = columns.find(col => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    if (source.droppableId === destination.droppableId) {
      const newTasks = Array.from(sourceColumn.tasks)
      const [removed] = newTasks.splice(source.index, 1)
      newTasks.splice(destination.index, 0, removed)

      setColumns(columns.map(col =>
        col.id === sourceColumn.id
          ? { ...col, tasks: newTasks }
          : col
      ))
    } else {
      const sourceTasks = Array.from(sourceColumn.tasks)
      const destTasks = Array.from(destColumn.tasks)
      const [removed] = sourceTasks.splice(source.index, 1)
      destTasks.splice(destination.index, 0, removed)

      setColumns(columns.map(col => {
        if (col.id === sourceColumn.id) {
          return { ...col, tasks: sourceTasks }
        }
        if (col.id === destColumn.id) {
          return { ...col, tasks: destTasks }
        }
        return col
      }))
    }
  }

  const addTask = () => {
    if (!newTaskContent.trim()) return

    const newTask: Task = {
      id: `task-${Date.now()}`,
      content: newTaskContent
    }

    setColumns(columns.map(col =>
      col.id === selectedColumn
        ? { ...col, tasks: [...col.tasks, newTask] }
        : col
    ))

    setNewTaskContent('')
  }

  const deleteTask = (columnId: string, taskId: string) => {
    setColumns(columns.map(col =>
      col.id === columnId
        ? { ...col, tasks: col.tasks.filter(task => task.id !== taskId) }
        : col
    ))
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Kanban Board</h1>

        <div className={styles.addTaskSection}>
          <input
            type="text"
            placeholder="Enter new task..."
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            className={styles.input}
          />
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className={styles.select}
          >
            {columns.map(col => (
              <option key={col.id} value={col.id}>{col.title}</option>
            ))}
          </select>
          <button onClick={addTask} className={styles.addButton}>
            Add Task
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className={styles.board}>
            {columns.map(column => (
              <div key={column.id} className={styles.column}>
                <h2 className={styles.columnTitle}>
                  {column.title}
                  <span className={styles.taskCount}>{column.tasks.length}</span>
                </h2>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`${styles.taskList} ${
                        snapshot.isDraggingOver ? styles.draggingOver : ''
                      }`}
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${styles.task} ${
                                snapshot.isDragging ? styles.dragging : ''
                              }`}
                            >
                              <div className={styles.taskContent}>
                                {task.content}
                              </div>
                              <button
                                onClick={() => deleteTask(column.id, task.id)}
                                className={styles.deleteButton}
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </main>
  )
}
