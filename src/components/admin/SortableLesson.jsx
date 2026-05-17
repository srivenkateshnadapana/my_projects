import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Layers, Play, Edit, Trash2 } from 'lucide-react'

export function SortableLesson({ lesson, moduleId, lIdx, openModal, handleDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: lesson.id,
    data: { type: 'lesson', moduleId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex justify-between items-center p-4 bg-surface rounded-2xl border border-surface-dim/10 hover:border-primary/20 transition-all">
      <div className="flex items-center gap-4">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-surface-dim hover:text-secondary transition-colors">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center text-primary shrink-0">
          {lesson.type === 'pdf' || lesson.type === 'ppt' ? <Layers className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </div>
        <div>
          <p className="font-bold text-primary">{lesson.title}</p>
          <p className="text-xs text-secondary mt-1">{lesson.duration} mins • {lesson.type === 'pdf' ? 'PDF' : lesson.type === 'ppt' ? 'PPT' : 'Video'}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => openModal('lesson', lesson, moduleId)} className="text-secondary hover:text-primary"><Edit className="w-4 h-4" /></button>
        <button onClick={() => handleDelete('lesson', lesson.id)} className="text-red-500/60 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  )
}
