import React from "react";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, HelpCircle, Edit, Trash2 } from "lucide-react";
import { SortableLesson } from "./SortableLesson";
import { AdminManagerContext } from "../../pages/admin/AdminCourseManager";

export function SortableModule({ module, modQuiz, mIdx }) {
  const { openModal, handleDelete } = React.useContext(AdminManagerContext);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: module.id,
    data: { type: "module" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-surface-container-lowest border border-surface-dim/20 rounded-3xl overflow-hidden shadow-lg mb-6"
    >
      <div className="bg-surface-container-low p-6 flex justify-between items-center border-b border-surface-dim/20 group">
        <div className="flex items-center gap-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 text-surface-dim hover:text-secondary transition-colors"
          >
            <GripVertical className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
              Module {mIdx + 1}
            </p>
            <h3 className="text-xl font-headline font-bold text-primary">
              {module.title}
            </h3>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openModal("lesson", null, module.id)}
            className="p-2 text-primary bg-primary/10 rounded-lg hover:bg-primary/20"
            title="Add Lesson"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => openModal("quiz", modQuiz, module.id, "module")}
            className="p-2 text-success bg-success/10 rounded-lg hover:bg-success/20"
            title={modQuiz ? "Edit Module Quiz" : "Add Module Quiz"}
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => openModal("module", module)}
            className="p-2 text-secondary hover:text-primary"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDelete("module", module.id)}
            className="p-2 text-error hover:bg-error/10 rounded-lg"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {module.lessons?.length === 0 && (
          <p className="text-secondary text-sm italic pl-10">
            No lessons in this module.
          </p>
        )}

        <SortableContext
          items={module.lessons?.map((l) => l.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {module.lessons?.map((lesson, lIdx) => (
            <SortableLesson
              key={lesson.id}
              lesson={lesson}
              moduleId={module.id}
              lIdx={lIdx}
            />
          ))}
        </SortableContext>

        {modQuiz && (
          <div className="flex justify-between items-center p-4 bg-surface-container-low rounded-2xl border border-surface-dim/20">
            <div className="flex items-center gap-4 pl-10">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-on-primary-container">
                  {modQuiz.title}
                </p>
                <p className="text-xs text-primary mt-1">Knowledge Check</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => openModal("manage_questions", modQuiz)}
                className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg hover:bg-primary/20"
              >
                Questions ({modQuiz.questions?.length || 0})
              </button>
              <button
                onClick={() => openModal("quiz", modQuiz, module.id, "module")}
                className="text-secondary hover:text-primary"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete("quiz", modQuiz.id)}
                className="text-error/60 hover:text-error"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
