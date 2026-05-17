import * as React from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { 
  Layers, Play, CheckCircle, ChevronLeft, ChevronRight, 
  MessageCircle, Send, Loader2, Star, Download, Lock, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2, Award, HelpCircle
} from "lucide-react"
import { QuizPlayer } from "../../components/course/QuizPlayer"
import { DoubtSection } from "../../components/course/DoubtSection"
import { FeedbackModal } from "../../components/course/FeedbackModal"
import { StorageService } from "../../services/storage"
import { api } from "../../services/api"
import { ProtectedRoute } from "../../context/ProtectedRoute"
import { toast } from "sonner"
import confetti from "canvas-confetti"
import { getEmbedUrl, getVideoType } from "../../utils/videoUtils"

export default function CoursePlayer() {
  return (
    <ProtectedRoute>
      <PlayerContent />
    </ProtectedRoute>
  )
}

function PlayerContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = React.useState(null)
  const [moduleQuizzes, setModuleQuizzes] = React.useState([])
  const [finalQuiz, setFinalQuiz] = React.useState(null)
  
  // Selection states (can be a lesson or a quiz)
  const [activeItem, setActiveItem] = React.useState(null)
  const [activeType, setActiveType] = React.useState('lesson') // 'lesson' or 'quiz'

  const [loading, setLoading] = React.useState(true)
  const [progress, setProgress] = React.useState({})
  const [finalQuizPassed, setFinalQuizPassed] = React.useState(false)
  const [totalLessonsCount, setTotalLessonsCount] = React.useState(0)

  // Quiz Player States
  const [quizAnswers, setQuizAnswers] = React.useState({})
  const [submittingQuiz, setSubmittingQuiz] = React.useState(false)
  const [quizResult, setQuizResult] = React.useState(null)

  // Sidebar Tab: 'curriculum' | 'doubts'
  const [sidebarTab, setSidebarTab] = React.useState('curriculum')

  // Doubts States
  const [doubts, setDoubts] = React.useState([])
  const [doubtForm, setDoubtForm] = React.useState({ subject: '', message: '' })
  const [postingDoubt, setPostingDoubt] = React.useState(false)
  const [doubtsLoading, setDoubtsLoading] = React.useState(false)

  // Feedback Modal States
  const [showFeedbackModal, setShowFeedbackModal] = React.useState(false)
  const [feedbackForm, setFeedbackForm] = React.useState({ content: '', rating: 5 })
  const [submittingFeedback, setSubmittingFeedback] = React.useState(false)

  React.useEffect(() => {
    loadCourseData()
  }, [id])

  const loadCourseData = async () => {
    try {
      setLoading(true)
      const token = StorageService.getToken()
      
      // Load course details
      const courseData = await api.courses.getById(id, token)
      setCourse(courseData.data)
      
      let count = 0
      courseData.data?.modules?.forEach(m => {
        count += (m.lessons?.length || 0)
      })
      setTotalLessonsCount(count)

      // Load quizzes (this endpoint includes questions)
      const quizData = await api.quizzes.getCourseQuizzes(id, token)
      if (quizData.success) {
        setModuleQuizzes(quizData.data.moduleQuizzes || [])
        setFinalQuiz(quizData.data.finalQuiz || null)
      }

      // Load Progress
      const prog = await StorageService.getProgress(id)
      setProgress(prog || {})

      // Check if they passed the final quiz already
      const attemptsData = await api.quizzes.getMyAttempts(token)
      if (attemptsData.success && quizData.data.finalQuiz) {
        const hasPassedFinal = attemptsData.data.some(attempt => 
          attempt.quizId === quizData.data.finalQuiz.id && attempt.passed
        )
        setFinalQuizPassed(hasPassedFinal)
      }

      // Set initial active item
      if (courseData.data?.modules?.[0]?.lessons?.[0]) {
        handleSelectItem(courseData.data.modules[0].lessons[0], 'lesson')
      }
    } catch (error) {
      toast.error('Failed to load course materials.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectItem = (item, type) => {
    setActiveItem(item)
    setActiveType(type)
    setQuizAnswers({})
    setQuizResult(null)
  }

  const loadDoubts = async () => {
    setDoubtsLoading(true)
    try {
      const token = StorageService.getToken()
      const res = await api.tickets.getMy(token)
      if (res.success) {
        setDoubts((res.data || []).filter(t => String(t.courseId) === String(id)))
      }
    } catch { /* silent */ }
    finally { setDoubtsLoading(false) }
  }

  const handleSwitchTab = (tab) => {
    setSidebarTab(tab)
    if (tab === 'doubts' && doubts.length === 0) loadDoubts()
  }

  const handlePostDoubt = async (e) => {
    e.preventDefault()
    if (!doubtForm.subject.trim() || !doubtForm.message.trim()) return
    setPostingDoubt(true)
    try {
      const token = StorageService.getToken()
      const res = await api.tickets.create({
        subject: doubtForm.subject,
        message: doubtForm.message,
        courseId: id,
        lessonId: activeItem?.id || null
      }, token)
      if (res.success) {
        setDoubts(prev => [res.data, ...prev])
        setDoubtForm({ subject: '', message: '' })
        toast.success('Doubt posted! Our team will respond soon.')
      }
    } catch { toast.error('Failed to post doubt.') }
    finally { setPostingDoubt(false) }
  }

  const handleLessonComplete = async (lessonId) => {
    StorageService.updateProgress(id, lessonId)
    setProgress(prev => ({ ...prev, [lessonId]: 'completed' }))
    try {
      await api.progress.markComplete(lessonId, StorageService.getToken())
    } catch (error) {
      console.error('Failed to sync progress to backend')
    }
  }

  const handleQuizSubmit = async () => {
    if (!activeItem || activeType !== 'quiz') return
    
    // Validate all questions answered
    const questions = activeItem.questions || []
    if (Object.keys(quizAnswers).length < questions.length) {
      toast.error('Please answer all questions before submitting.')
      return
    }

    setSubmittingQuiz(true)
    try {
      const token = StorageService.getToken()
      const res = await api.quizzes.submitQuiz(activeItem.id, quizAnswers, token)
      
      if (res.success) {
        const result = res.data
        setQuizResult(result)
        
        if (result.passed) {
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
          toast.success(`Quiz Passed! Score: ${result.percentage}%`)
          
          // If it was the final quiz, generate certificate
          if (activeItem.type === 'final') {
            setFinalQuizPassed(true)
            toast.promise(
              api.certificates.generate(id, result.percentage, token),
              {
                loading: 'Generating your certificate...',
                success: 'Certificate Generated Successfully!',
                error: 'Failed to generate certificate.'
              }
            )
            // Show feedback modal after a short delay
            setTimeout(() => {
              setShowFeedbackModal(true)
            }, 1500)
          }
        } else {
          toast.error(`Quiz Failed. Score: ${result.percentage}%. Minimum required is ${result.passingScore}%.`)
        }
      }
    } catch (error) {
      toast.error('Failed to submit quiz.')
    } finally {
      setSubmittingQuiz(false)
    }
  }

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    if (!feedbackForm.content.trim()) {
      toast.error("Please enter your feedback.")
      return
    }

    try {
      setSubmittingFeedback(true)
      const token = StorageService.getToken()
      const res = await api.feedbacks.submit(feedbackForm, token)
      if (res.success) {
        toast.success("Feedback submitted successfully. Thank you!")
        setShowFeedbackModal(false)
      }
    } catch (err) {
      toast.error("Failed to submit feedback. Please try again.")
    } finally {
      setSubmittingFeedback(false)
    }
  }

  if (loading) return <div className="h-screen bg-primary flex items-center justify-center"><Loader2 className="animate-spin text-white w-12 h-12" /></div>

  if (!course) return (
    <div className="h-screen flex flex-col items-center justify-center bg-surface p-8 text-center">
      <h1 className="text-4xl font-headline font-bold text-primary mb-4">Course Unavailable</h1>
      <Link to="/dashboard" className="px-8 py-3 signature-gradient text-white rounded-xl font-bold">Return to Dashboard</Link>
    </div>
  )

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-surface">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-[450px] bg-surface-container-low border-r border-surface-dim/20 flex flex-col h-screen relative z-30">
        <div className="p-6 border-b border-surface-dim/20 bg-surface-container-lowest">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-outline hover:text-primary transition-all font-bold text-[10px] uppercase tracking-[0.3em] mb-4">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <h2 className="font-headline font-bold text-base text-primary truncate mb-4">{course.title}</h2>
          {/* Sidebar Tabs */}
          <div className="flex gap-1 p-1 bg-surface-container rounded-2xl">
            <button
              onClick={() => handleSwitchTab('curriculum')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${sidebarTab === 'curriculum' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-outline hover:text-primary'}`}
            >
              <Layers className="w-4 h-4" /> Curriculum
            </button>
            <button
              onClick={() => handleSwitchTab('doubts')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${sidebarTab === 'doubts' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-outline hover:text-primary'}`}
            >
              <MessageCircle className="w-4 h-4" /> Doubts {doubts.length > 0 && <span className="bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{doubts.length}</span>}
            </button>
          </div>
        </div>
        
        {sidebarTab === 'doubts' ? (
          <DoubtSection 
            doubts={doubts}
            doubtsLoading={doubtsLoading}
            activeItem={activeItem}
            doubtForm={doubtForm}
            setDoubtForm={setDoubtForm}
            handlePostDoubt={handlePostDoubt}
            postingDoubt={postingDoubt}
          />
        ) : (
        <div className="flex-grow overflow-y-auto no-scrollbar p-6 space-y-8 bg-surface-container-low/30 backdrop-blur-3xl">
          {/* Modules and Lessons */}
          {course.modules?.map((module, i) => {
            const modQuiz = moduleQuizzes.find(q => q.moduleId === module.id)
            
            return (
              <div key={module.id} className="space-y-3">
                <div className="flex items-center gap-2 px-2">
                  <span className="text-[10px] font-bold text-primary opacity-40 uppercase tracking-[0.4em]">Section {i+1} •</span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-[0.1em]">{module.title}</span>
                </div>
                <div className="space-y-2">
                  {Array.isArray(module.lessons) && module.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => handleSelectItem(lesson, 'lesson')}
                      className={`w-full text-left px-6 py-5 rounded-3xl flex items-center gap-4 transition-all group ${activeItem?.id === lesson.id && activeType === 'lesson' ? 'bg-primary text-white shadow-xl shadow-primary/20 translate-x-1' : 'bg-surface-container-lowest hover:bg-surface-container-high'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activeItem?.id === lesson.id && activeType === 'lesson' ? 'bg-on-primary' : 'bg-surface-container-high'}`}>
                        {progress[lesson.id] === 'completed' ? (
                          <CheckCircle className={`w-4 h-4 ${activeItem?.id === lesson.id && activeType === 'lesson' ? 'text-primary' : 'text-emerald-500'}`} />
                        ) : lesson.type === 'pdf' || lesson.type === 'ppt' ? (
                          <Layers className={`w-4 h-4 ${activeItem?.id === lesson.id && activeType === 'lesson' ? 'text-primary' : 'text-secondary opacity-60'}`} />
                        ) : (
                          <Play className={`w-4 h-4 ${activeItem?.id === lesson.id && activeType === 'lesson' ? 'text-primary' : 'text-secondary opacity-60'}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-bold leading-tight ${activeItem?.id === lesson.id && activeType === 'lesson' ? 'text-on-primary' : 'text-primary'}`}>{lesson.title}</p>
                        <p className={`text-[10px] uppercase font-bold tracking-widest mt-1 opacity-60 ${activeItem?.id === lesson.id && activeType === 'lesson' ? 'text-on-primary' : 'text-secondary'}`}>
                          {lesson.duration || "10"} mins • {lesson.type === 'pdf' ? 'PDF Resource' : lesson.type === 'ppt' ? 'PPT Resource' : 'Video'}
                        </p>
                      </div>
                    </button>
                  ))}
                  
                  {/* Module Quiz */}
                  {modQuiz && (
                    <button
                      onClick={() => handleSelectItem(modQuiz, 'quiz')}
                      className={`w-full text-left px-6 py-5 rounded-3xl flex items-center gap-4 transition-all group ${activeItem?.id === modQuiz.id && activeType === 'quiz' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 translate-x-1' : 'bg-blue-500/10 hover:bg-blue-500/20'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activeItem?.id === modQuiz.id && activeType === 'quiz' ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-600'}`}>
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-bold leading-tight ${activeItem?.id === modQuiz.id && activeType === 'quiz' ? 'text-white' : 'text-primary'}`}>{modQuiz.title}</p>
                        <p className={`text-[10px] uppercase font-bold tracking-widest mt-1 opacity-60 ${activeItem?.id === modQuiz.id && activeType === 'quiz' ? 'text-white' : 'text-blue-600'}`}>
                          Knowledge Check
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          
          {/* Final Quiz Section */}
          {finalQuiz && Object.keys(progress).length >= totalLessonsCount && (
            <div className="pt-8 mt-8 border-t border-surface-dim/20 space-y-3">
              <div className="flex items-center gap-2 px-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.1em]">Certification</span>
              </div>
              <p className="text-xs text-secondary px-2 mb-2">You have completed all lessons! Take the final quiz to earn your certificate.</p>
              <button
                onClick={() => !finalQuizPassed && handleSelectItem(finalQuiz, 'quiz')}
                disabled={finalQuizPassed}
                className={`w-full text-left px-6 py-5 rounded-3xl flex items-center gap-4 transition-all group ${
                  finalQuizPassed 
                  ? 'bg-emerald-500/10 opacity-70 cursor-not-allowed' 
                  : activeItem?.id === finalQuiz.id && activeType === 'quiz' 
                    ? 'signature-gradient text-white shadow-xl translate-x-1' 
                    : 'bg-surface-container-lowest border border-primary/20 hover:border-primary/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  finalQuizPassed ? 'bg-emerald-500/20 text-emerald-600' : activeItem?.id === finalQuiz.id && activeType === 'quiz' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                }`}>
                  {finalQuizPassed ? <Lock className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-bold leading-tight ${
                    finalQuizPassed ? 'text-emerald-700' : activeItem?.id === finalQuiz.id && activeType === 'quiz' ? 'text-white' : 'text-primary'
                  }`}>{finalQuiz.title}</p>
                  <p className={`text-[10px] uppercase font-bold tracking-widest mt-1 ${
                    finalQuizPassed ? 'text-emerald-600' : activeItem?.id === finalQuiz.id && activeType === 'quiz' ? 'text-white/70' : 'text-secondary'
                  }`}>
                    {finalQuizPassed ? 'Passed & Locked' : `Final Quiz • Pass: ${finalQuiz.passingScore}%`}
                  </p>
                </div>
              </button>
              {finalQuizPassed && (
                <div className="px-2 mt-4 text-center">
                  <Link to="/certificates" className="text-xs font-bold text-primary underline hover:text-secondary">View Your Certificate</Link>
                </div>
              )}
            </div>
          )}
        </div>
        )} {/* end sidebarTab conditional */}
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden bg-surface-container-lowest">
        {!activeItem ? (
           <div className="flex-grow flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center text-primary/20 mb-8 border border-surface-dim/20">
              <Play className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-headline font-bold text-primary italic">Select a Lesson</h3>
            <p className="text-outline text-lg font-medium mt-4 max-w-sm">Choose a lesson or quiz from the sidebar to begin.</p>
          </div>
        ) : activeType === 'lesson' ? (
          // LESSON PLAYER
          <div className="flex-grow flex flex-col p-8 lg:p-12 overflow-y-auto no-scrollbar">
            <div className="w-full max-w-6xl mx-auto flex flex-col h-full">
              <div className="relative aspect-video bg-primary rounded-[3rem] overflow-hidden shadow-2xl group flex items-center justify-center border-8 border-surface-container-low">
                {activeItem.type === 'pdf' || activeItem.type === 'ppt' ? (
                  <div className="absolute inset-0 w-full h-full bg-surface-container-lowest flex flex-col items-center justify-center text-center p-8">
                    <Layers className="w-20 h-20 text-primary mb-6" />
                    <h3 className="text-2xl font-headline font-bold text-primary mb-2">Resource: {activeItem.title}</h3>
                    <p className="text-secondary mb-8">{activeItem.type === 'pdf' ? 'PDF Document' : 'PowerPoint Presentation'}</p>
                    <a href={activeItem.resourceUrl || activeItem.videoUrl} target="_blank" rel="noreferrer" className="px-8 py-4 signature-gradient text-white rounded-xl font-bold flex items-center gap-2 hover:opacity-90 shadow-lg">
                      <Layers className="w-5 h-5" /> Download Resource
                    </a>
                  </div>
                ) : activeItem.videoUrl ? (
                  getVideoType(activeItem.videoUrl) === 'mp4' ? (
                    <video src={activeItem.videoUrl} className="absolute inset-0 w-full h-full object-cover bg-black" controls autoPlay />
                  ) : (
                    <iframe
                      key={activeItem.id}
                      src={getEmbedUrl(activeItem.videoUrl)}
                      className="absolute inset-0 w-full h-full bg-black"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  )
                ) : (
                  <>
                    <img src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=2560&q=100"} className="absolute inset-0 w-full h-full object-cover opacity-60 blur-[2px] scale-105" alt="Video Static" />
                    <div className="relative z-10 w-24 h-24 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white cursor-pointer">
                      <Play className="w-10 h-10 fill-current" />
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-surface-container-lowest p-10 rounded-[3rem] border border-surface-dim/20 shadow-xl shadow-primary/5">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary shadow-inner">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-headline font-bold text-primary leading-tight mb-1">{activeItem.title}</h4>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Duration: {activeItem.duration} mins</p>
                  </div>
                </div>
                <button
                  onClick={() => handleLessonComplete(activeItem.id)}
                  className={`flex items-center gap-3 px-12 py-5 rounded-3xl font-headline font-bold text-lg transition-all active:scale-[0.98] ${progress[activeItem.id] === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'signature-gradient text-white shadow-xl hover:opacity-90 shadow-primary/20'}`}
                >
                  {progress[activeItem.id] === 'completed' ? <><CheckCircle className="w-6 h-6" /> COMPLETED</> : <><CheckCircle className="w-6 h-6" /> MARK COMPLETE</>}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // QUIZ INTERFACE
          <div className="flex-grow flex flex-col p-8 lg:p-12 overflow-y-auto no-scrollbar">
             <div className="w-full max-w-4xl mx-auto">
                <div className="bg-surface-container-lowest border border-surface-dim/20 rounded-[3rem] p-10 md:p-16 shadow-2xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${activeItem.type === 'final' ? 'signature-gradient' : 'bg-blue-500'}`}>
                      {activeItem.type === 'final' ? <Award className="w-8 h-8" /> : <HelpCircle className="w-8 h-8" />}
                    </div>
                    <div>
                      <h2 className="text-3xl font-headline font-bold text-primary mb-1">{activeItem.title}</h2>
                      <p className="text-sm font-bold text-secondary uppercase tracking-widest">
                        {activeItem.type === 'final' ? `Final Certification • Pass Criteria: ${activeItem.passingScore}%` : 'Module Knowledge Check • No Pass Criteria'}
                      </p>
                    </div>
                  </div>

                  <QuizPlayer 
                    activeItem={activeItem}
                    quizAnswers={quizAnswers}
                    setQuizAnswers={setQuizAnswers}
                    quizResult={quizResult}
                    setQuizResult={setQuizResult}
                    submittingQuiz={submittingQuiz}
                    handleQuizSubmit={handleQuizSubmit}
                  />
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Feedback Modal */}
      <FeedbackModal 
        show={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        feedbackForm={feedbackForm}
        setFeedbackForm={setFeedbackForm}
        handleFeedbackSubmit={handleFeedbackSubmit}
        submittingFeedback={submittingFeedback}
      />
    </div>
  )
}
