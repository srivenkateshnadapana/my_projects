import * as React from "react"
import { Link } from "react-router-dom"
import { Compass, ArrowRight, ShieldAlert } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-8 relative overflow-hidden">

      <div className="max-w-xl w-full text-center relative z-10">
        <div className="mb-12 relative inline-block">
          <div className="w-32 h-32 rounded-[2.5rem] bg-surface-container-low border border-surface-dim/20 flex items-center justify-center mx-auto shadow-2xl relative z-10">
            <ShieldAlert className="w-16 h-16 text-primary" />
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-headline font-bold text-lg shadow-xl animate-bounce">
            ?
          </div>
        </div>

        <h1 className="text-8xl font-headline font-extrabold text-primary mb-6 tracking-tighter italic">404</h1>
        <h2 className="text-3xl font-headline font-bold text-on-surface mb-6 italic uppercase tracking-widest">Protocol Deviation</h2>
        <p className="text-lg text-on-surface-variant font-medium leading-relaxed mb-12 opacity-70 italic">
          The requested operational node does not exist in our tactical archives. Your navigational sequence has reached an unmapped sector.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/" 
            className="w-full sm:w-auto px-10 py-5 signature-gradient text-white rounded-2xl font-headline font-bold text-lg shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            Return to Base
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to="/catalog" 
            className="w-full sm:w-auto px-10 py-5 bg-surface-container-low border border-surface-dim text-primary rounded-2xl font-headline font-bold text-lg hover:bg-surface-container transition-all flex items-center justify-center gap-2"
          >
            Explore Curriculum
          </Link>
        </div>

        <div className="mt-20 pt-12 border-t border-surface-dim/20">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.4em]">Adhoc Network • Navigational Status Error</p>
        </div>
      </div>
    </main>
  )
}
