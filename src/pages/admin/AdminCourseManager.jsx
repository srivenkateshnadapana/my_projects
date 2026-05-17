import React, { useState, useEffect } from 'react'
import { useParams, Link } from "react-router-dom"
import { AdminProtectedRoute } from "../../context/AdminProtectedRoute"
import { api } from "../../services/api"
import { StorageService } from "../../services/storage"
import { Layers, Play, Plus, Edit, Trash2, ArrowLeft, HelpCircle, Loader2, X, GripVertical } from "lucide-react"
import { toast } from "sonner"

// DnD Kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { SortableModule } from "../../components/admin/SortableModule"

export default function AdminCourseManager() {
  return (
    <AdminProtectedRoute>
      <AdminCourseManagerContent />
    </AdminProtectedRoute>
  )
}

function AdminCourseManagerContent() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [moduleQuizzes, setModuleQuizzes] = useState([])
  const [finalQuiz, setFinalQuiz] = useState(null)
  const [loading, setLoading] = useState(true)

  // DnD state
  const [activeId, setActiveId] = useState(null);

  // Modals state
  const [activeModal, setActiveModal] = useState(null) // 'module', 'lesson', 'quiz'
  const [editingItem, setEditingItem] = useState(null)
  const [parentId, setParentId] = useState(null) // For module ID when adding lesson
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [moduleForm, setModuleForm] = useState({ title: '', order: 1 })
  const [lessonForm, setLessonForm] = useState({ title: '', type: 'video', videoUrl: '', duration: 10, order: 1 })
  const [quizForm, setQuizForm] = useState({ title: '', passingScore: 80 })
  const [questionForm, setQuestionForm] = useState({ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 })

  useEffect(() => {
    loadCourseData()
  }, [id])

  const loadCourseData = async () => {
    try {
      setLoading(true)
      const token = StorageService.getToken()
      
      // Fetch course & modules
      const data = await api.courses.getById(id, token)
      setCourse(data.data)

      // Fetch quizzes (to fix missing quiz bug)
      const quizData = await api.quizzes.getCourseQuizzes(id, token)
      if (quizData.success) {
        setModuleQuizzes(quizData.data.moduleQuizzes || [])
        setFinalQuiz(quizData.data.finalQuiz || null)
      }
    } catch (error) {
      toast.error('Failed to load course details')
    } finally {
      setLoading(false)
    }
  }

  // Sensors for Drag and Drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // DnD Handlers
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const activeType = active.data.current?.type;
      const overType = over.data.current?.type;

      if (activeType === 'module' && overType === 'module') {
        const oldIndex = course.modules.findIndex((m) => m.id === active.id);
        const newIndex = course.modules.findIndex((m) => m.id === over.id);

        const newModules = arrayMove(course.modules, oldIndex, newIndex);
        
        // Optimistic UI update
        setCourse(prev => ({ ...prev, modules: newModules }));

        // Prepare payload (update orders based on new index)
        const payload = newModules.map((m, index) => ({ id: m.id, order: index + 1 }));
        
        try {
          const token = StorageService.getToken()
          await api.admin.reorderModules(payload, token);
          toast.success('Modules reordered');
        } catch (error) {
          toast.error('Failed to save module order');
          loadCourseData(); // Revert on failure
        }
      }

      if (activeType === 'lesson' && overType === 'lesson') {
        const moduleId = active.data.current.moduleId;
        const moduleIndex = course.modules.findIndex(m => m.id === moduleId);
        const moduleToUpdate = course.modules[moduleIndex];

        const oldIndex = moduleToUpdate.lessons.findIndex(l => l.id === active.id);
        const newIndex = moduleToUpdate.lessons.findIndex(l => l.id === over.id);

        const newLessons = arrayMove(moduleToUpdate.lessons, oldIndex, newIndex);
        
        // Optimistic UI update
        const updatedModules = [...course.modules];
        updatedModules[moduleIndex] = { ...moduleToUpdate, lessons: newLessons };
        setCourse(prev => ({ ...prev, modules: updatedModules }));

        // Prepare payload
        const payload = newLessons.map((l, index) => ({ id: l.id, order: index + 1 }));

        try {
          const token = StorageService.getToken()
          await api.admin.reorderLessons(payload, token);
          toast.success('Lessons reordered');
        } catch (error) {
          toast.error('Failed to save lesson order');
          loadCourseData(); // Revert on failure
        }
      }
    }
  };

  // Modals Handlers
  const openModal = (type, item = null, parent = null, quizType = 'final') => {
    setActiveModal(type)
    setEditingItem(item)
    setParentId(parent)

    if (type === 'module') {
      setModuleForm(item ? { title: item.title, order: item.order } : { title: '', order: (course?.modules?.length || 0) + 1 })
    } else if (type === 'lesson') {
      // Find parent module to get next order
      const parentModule = course?.modules?.find(m => m.id === parent)
      const nextOrder = (parentModule?.lessons?.length || 0) + 1
      setLessonForm(item ? { title: item.title, type: item.type || 'video', videoUrl: item.videoUrl, duration: item.duration, order: item.order } : { title: '', type: 'video', videoUrl: '', duration: 10, order: nextOrder })
    } else if (type === 'quiz') {
      setQuizForm(item ? { title: item.title, passingScore: item.passingScore || 80, type: item.type || quizType, moduleId: item.moduleId || parent } : { title: '', passingScore: quizType === 'module' ? 0 : 80, type: quizType, moduleId: parent })
    } else if (type === 'manage_questions') {
      setQuestionForm({ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 })
    }
  }

  const closeModal = () => {
    setActiveModal(null)
    setEditingItem(null)
    setParentId(null)
    setQuestionForm({ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 })
  }

  // Submit Handlers
  const handleModuleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = StorageService.getToken()
      if (editingItem) {
        await api.admin.updateModule(editingItem.id, moduleForm, token)
        toast.success('Module updated')
      } else {
        await api.admin.createModule(id, moduleForm, token)
        toast.success('Module created')
      }
      closeModal()
      loadCourseData()
    } catch (error) {
      toast.error('Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLessonSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = StorageService.getToken()
      if (editingItem) {
        await api.admin.updateLesson(editingItem.id, lessonForm, token)
        toast.success('Lesson updated')
      } else {
        await api.admin.createLesson(parentId, lessonForm, token)
        toast.success('Lesson created')
      }
      closeModal()
      loadCourseData()
    } catch (error) {
      toast.error('Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuizSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = StorageService.getToken()
      if (editingItem) {
        await api.admin.updateQuiz(editingItem.id, { ...quizForm, passingScore: quizForm.type === 'module' ? 0 : quizForm.passingScore }, token)
        toast.success('Quiz updated')
      } else {
        await api.admin.createQuiz({ ...quizForm, courseId: id, passingScore: quizForm.type === 'module' ? 0 : quizForm.passingScore }, token)
        toast.success('Quiz created')
      }
      closeModal()
      loadCourseData()
    } catch (error) {
      toast.error('Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuestionSubmit = async (e) => {
    e.preventDefault()
    if (!editingItem) return
    if (questionForm.options.some(opt => !opt.trim())) {
      toast.error('All 4 options must be filled out.')
      return
    }
    setSubmitting(true)
    try {
      const token = StorageService.getToken()
      await api.admin.createQuestion(editingItem.id, {
        questionText: questionForm.questionText,
        options: questionForm.options,
        correctAnswer: questionForm.correctOptionIndex
      }, token)
      toast.success('Question added')
      setQuestionForm({ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 })
      
      // Update editingItem with new questions optimistic/fetch
      const updatedData = await api.courses.getById(id, token) // fetch fresh course data
      setCourse(updatedData.data)
      const quizData = await api.quizzes.getCourseQuizzes(id, token)
      if (quizData.success) {
        setModuleQuizzes(quizData.data.moduleQuizzes || [])
        setFinalQuiz(quizData.data.finalQuiz || null)
        
        // Update local editing item
        const updatedQuiz = quizData.data.moduleQuizzes?.find(q => q.id === editingItem.id) || quizData.data.finalQuiz
        if (updatedQuiz) setEditingItem(updatedQuiz)
      }
    } catch (error) {
      toast.error('Failed to add question')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return
    try {
      const token = StorageService.getToken()
      await api.admin.deleteQuestion(questionId, token)
      toast.success('Question deleted')
      
      const quizData = await api.quizzes.getCourseQuizzes(id, token)
      if (quizData.success) {
        setModuleQuizzes(quizData.data.moduleQuizzes || [])
        setFinalQuiz(quizData.data.finalQuiz || null)
        const updatedQuiz = quizData.data.moduleQuizzes?.find(q => q.id === editingItem.id) || quizData.data.finalQuiz
        if (updatedQuiz) setEditingItem(updatedQuiz)
      }
    } catch (error) {
      toast.error('Failed to delete question')
    }
  }

  const handleDelete = async (type, itemId) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return
    try {
      const token = StorageService.getToken()
      if (type === 'module') await api.admin.deleteModule(itemId, token)
      if (type === 'lesson') await api.admin.deleteLesson(itemId, token)
      if (type === 'quiz') await api.admin.deleteQuiz(itemId, token)
      toast.success(`${type} deleted`)
      loadCourseData()
    } catch (error) {
      toast.error(`Failed to delete ${type}`)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>
  if (!course) return <div className="min-h-screen bg-surface pt-24 px-8 text-center text-primary">Course not found</div>

  return (
    <main className="min-h-screen bg-surface pt-24 pb-20 px-8">
      <div className="max-w-5xl mx-auto">
        <Link to="/admin/courses" className="inline-flex items-center gap-2 text-outline hover:text-primary transition-all font-bold text-xs uppercase tracking-widest mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Assets
        </Link>
        
        <div className="mb-12">
          <h1 className="text-4xl font-headline font-bold text-primary mb-2">{course.title}</h1>
          <p className="text-on-surface-variant">Manage curriculum hierarchy, tactical nodes, and knowledge assessments using Drag & Drop.</p>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Modules Section */}
          <section className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-3">
                <Layers className="w-6 h-6" /> Modules & Lessons
              </h2>
              <button onClick={() => openModal('module')} className="px-6 py-3 signature-gradient text-white rounded-xl font-bold hover:opacity-90 flex items-center gap-2">
                <Plus className="w-5 h-5" /> Add Module
              </button>
            </div>

            <div className="space-y-6">
              <SortableContext items={course.modules?.map(m => m.id) || []} strategy={verticalListSortingStrategy}>
                {course.modules?.map((module, mIdx) => {
                  const modQuiz = moduleQuizzes.find(q => q.moduleId === module.id)
                  return (
                    <SortableModule 
                      key={module.id} 
                      module={module} 
                      modQuiz={modQuiz}
                      mIdx={mIdx} 
                      openModal={openModal} 
                      handleDelete={handleDelete} 
                    />
                  )
                })}
              </SortableContext>
              
              {(!course.modules || course.modules.length === 0) && (
                <div className="p-12 text-center border-2 border-dashed border-surface-dim/30 rounded-3xl text-secondary">
                  No modules found. Create one to get started.
                </div>
              )}
            </div>
          </section>
        </DndContext>

        {/* Quizzes Section */}
        <section>
          <div className="flex justify-between items-center mb-6 mt-12">
            <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-3">
              <HelpCircle className="w-6 h-6" /> Course Quizzes
            </h2>
            <button onClick={() => openModal('quiz', null, null, 'final')} className="px-6 py-3 bg-surface-container-low text-primary border border-primary/20 rounded-xl font-bold hover:bg-primary/10 flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add Final Quiz
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {!finalQuiz && (
                <div className="col-span-full p-12 text-center border-2 border-dashed border-surface-dim/30 rounded-3xl text-secondary">
                  No final quiz configured.
                </div>
             )}
             {finalQuiz && (
               <div className="bg-surface-container-lowest p-6 border border-surface-dim/20 rounded-3xl shadow-lg flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-primary mb-2">{finalQuiz.title}</h3>
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md inline-block">Final Quiz • Pass: {finalQuiz.passingScore}%</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openModal('manage_questions', finalQuiz)} className="p-2 text-blue-600 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 text-xs font-bold px-3">Questions ({finalQuiz.questions?.length || 0})</button>
                    <button onClick={() => openModal('quiz', finalQuiz, null, 'final')} className="p-2 text-secondary hover:text-primary"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete('quiz', finalQuiz.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
               </div>
             )}
          </div>
        </section>

        {/* Modals */}
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface-container-lowest rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center p-6 border-b border-surface-dim/20">
                <h2 className="text-xl font-headline font-bold text-primary capitalize">{editingItem ? 'Edit' : 'Add'} {activeModal}</h2>
                <button onClick={closeModal} className="p-2 bg-surface-container rounded-full text-secondary hover:text-primary"><X className="w-5 h-5" /></button>
              </div>
              
              {activeModal !== 'manage_questions' ? (
                <form onSubmit={
                  activeModal === 'module' ? handleModuleSubmit : 
                  activeModal === 'lesson' ? handleLessonSubmit : handleQuizSubmit
                } className="p-6 space-y-4">
                  
                  {/* Module Form */}
                  {activeModal === 'module' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Module Title</label>
                        <input type="text" value={moduleForm.title} onChange={e => setModuleForm({...moduleForm, title: e.target.value})} required className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-dim/20 focus:ring-2 focus:ring-primary focus:outline-none" />
                      </div>
                    </>
                  )}

                  {/* Lesson Form */}
                  {activeModal === 'lesson' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Lesson Title</label>
                        <input type="text" value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} required className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-dim/20 focus:ring-2 focus:ring-primary focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Lesson Type</label>
                        <select value={lessonForm.type} onChange={e => setLessonForm({...lessonForm, type: e.target.value})} className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-dim/20 focus:ring-2 focus:ring-primary focus:outline-none">
                          <option value="video">Video Lecture</option>
                          <option value="pdf">PDF Document</option>
                          <option value="ppt">PowerPoint Presentation</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Resource URL (Vimeo/MP4/PDF/PPT)</label>
                        <input type="url" value={lessonForm.videoUrl} onChange={e => setLessonForm({...lessonForm, videoUrl: e.target.value})} required className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-dim/20 focus:ring-2 focus:ring-primary focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Duration / Reading Time (mins)</label>
                        <input type="number" value={lessonForm.duration} onChange={e => setLessonForm({...lessonForm, duration: Number(e.target.value)})} required min="1" className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-dim/20 focus:ring-2 focus:ring-primary focus:outline-none" />
                      </div>
                    </>
                  )}

                  {/* Quiz Form */}
                  {activeModal === 'quiz' && (
                    <>
                      <div className="mb-4">
                        <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-md ${quizForm.type === 'final' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'}`}>
                          {quizForm.type} Quiz
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Quiz Title</label>
                        <input type="text" value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})} required className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-dim/20 focus:ring-2 focus:ring-primary focus:outline-none" />
                      </div>
                      {quizForm.type === 'final' && (
                        <div>
                          <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Passing Score (%)</label>
                          <input type="number" value={quizForm.passingScore} onChange={e => setQuizForm({...quizForm, passingScore: Number(e.target.value)})} required min="1" max="100" className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-dim/20 focus:ring-2 focus:ring-primary focus:outline-none" />
                        </div>
                      )}
                      {quizForm.type === 'module' && (
                        <p className="text-xs text-secondary italic">Module quizzes act as knowledge checks and have no minimum passing criteria.</p>
                      )}
                    </>
                  )}

                  <div className="pt-6 flex justify-end gap-3">
                    <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl font-bold text-secondary hover:bg-surface-container">Cancel</button>
                    <button type="submit" disabled={submitting} className="px-6 py-3 signature-gradient rounded-xl font-bold text-white flex items-center gap-2">
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Save
                    </button>
                  </div>
                </form>
              ) : (
                /* Manage Questions Modal Content */
                <div className="p-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                  <h3 className="text-lg font-bold text-primary mb-4">Questions ({editingItem?.questions?.length || 0})</h3>
                  
                  {/* Existing Questions List */}
                  <div className="space-y-4 mb-8">
                    {editingItem?.questions?.map((q, idx) => (
                      <div key={q.id} className="p-4 bg-surface-container-low border border-surface-dim/20 rounded-xl relative group">
                        <button onClick={() => handleDeleteQuestion(q.id)} className="absolute top-2 right-2 p-1 text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <p className="font-bold text-primary text-sm pr-6"><span className="text-secondary">{idx + 1}.</span> {q.questionText}</p>
                        <ul className="mt-2 space-y-1 pl-4">
                          {q.options?.map((opt, oIdx) => (
                            <li key={oIdx} className={`text-xs ${q.correctOptionIndex === oIdx ? 'text-emerald-600 font-bold' : 'text-secondary'}`}>
                              {oIdx === 0 ? 'A' : oIdx === 1 ? 'B' : oIdx === 2 ? 'C' : 'D'}. {opt}
                              {q.correctOptionIndex === oIdx && ' ✓'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {!editingItem?.questions?.length && (
                      <p className="text-sm text-secondary italic">No questions added yet.</p>
                    )}
                  </div>

                  {/* Add Question Form */}
                  <div className="bg-surface-container-lowest p-5 border border-primary/20 rounded-2xl shadow-inner">
                    <h4 className="text-sm font-bold text-primary mb-3">Add New Question</h4>
                    <form onSubmit={handleQuestionSubmit} className="space-y-3">
                      <div>
                        <input type="text" placeholder="Enter question..." value={questionForm.questionText} onChange={e => setQuestionForm({...questionForm, questionText: e.target.value})} required className="w-full px-3 py-2 bg-surface-container rounded-lg border border-surface-dim/20 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
                      </div>
                      <div className="space-y-2">
                        {questionForm.options.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              name="correctOption" 
                              checked={questionForm.correctOptionIndex === idx}
                              onChange={() => setQuestionForm({...questionForm, correctOptionIndex: idx})}
                              className="accent-emerald-500 w-4 h-4"
                            />
                            <input 
                              type="text" 
                              placeholder={`Option ${idx + 1}`} 
                              value={opt} 
                              onChange={e => {
                                const newOpts = [...questionForm.options];
                                newOpts[idx] = e.target.value;
                                setQuestionForm({...questionForm, options: newOpts});
                              }} 
                              required 
                              className={`w-full px-3 py-1.5 bg-surface-container rounded-lg border text-sm focus:outline-none ${questionForm.correctOptionIndex === idx ? 'border-emerald-500/50' : 'border-surface-dim/20'}`} 
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-secondary italic">Select the radio button next to the correct answer.</p>
                      <button type="submit" disabled={submitting} className="w-full py-2 bg-primary text-white rounded-lg text-sm font-bold mt-2 flex items-center justify-center gap-2">
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Add Question
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

