import * as React from "react"
import { Link } from "react-router-dom"
import { ShieldCheck, Lock, ArrowRight, UserCheck } from "lucide-react"

export default function Unauthorized() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-8 relative overflow-hidden">
      
      <div className="max-w-xl w-full text-center relative z-10">
        <div className="mb-12 relative inline-block">
          <div className="w-32 h-32 rounded-[2.5rem] bg-surface-container-low border border-surface-dim/20 flex items-center justify-center mx-auto shadow-2xl">
            <Lock className="w-16 h-16 text-primary" />
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>

        <h1 className="text-4xl lg:text-5xl font-headline font-extrabold text-primary mb-6 tracking-tighter italic uppercase leading-tight">
          Restricted Intelligence Pool
        </h1>
        <p className="text-lg text-on-surface-variant font-medium leading-relaxed mb-12 opacity-70 italic max-w-sm mx-auto">
          Your current security clearance (Identity Protocol) is insufficient to access this administrative node.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/auth" 
            className="w-full sm:w-auto px-10 py-5 signature-gradient text-white rounded-2xl font-headline font-bold text-lg shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            Switch Protocol
            <UserCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </Link>
          <Link 
            to="/" 
            className="w-full sm:w-auto px-10 py-5 bg-surface-container-low border border-surface-dim text-primary rounded-2xl font-headline font-bold text-lg hover:bg-surface-container transition-all"
          >
            Dashboard Base
          </Link>
        </div>

        <div className="mt-20 pt-12 border-t border-surface-dim/20">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.4em]">Adhoc Security Protocol • Clearances Active</p>
        </div>
      </div>
    </main>
  )
}
