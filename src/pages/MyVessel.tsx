import { useState, useEffect } from "react";
import { ArrowLeft, Anchor, ShieldCheck, Ship, Save, Flag, Navigation2, FileText, PhoneCall, RadioTower } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { motion } from "framer-motion";

export interface VesselData {
  ownerName: string;
  shipName: string;
  registrationNumber: string;
  vesselType: string;
  callSign: string;
  crewCapacity: string;
  length: string;
  primaryContact: string;
  emergencyContact: string;
}

const defaultData: VesselData = {
  ownerName: "Captain Rajan",
  shipName: "Ocean Link I",
  registrationNumber: "IND-KA-04-1029",
  vesselType: "Trawler",
  callSign: "VTX-82",
  crewCapacity: "8",
  length: "14",
  primaryContact: "+91 9876543210",
  emergencyContact: "+91 9123456780",
};

const MyVessel = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [data, setData] = useState<VesselData>(defaultData);

  useEffect(() => {
    const saved = localStorage.getItem("mitra_vessel_data");
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("mitra_vessel_data", JSON.stringify(data));
    toast.success("Vessel profile secured offline.");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col gap-6 pb-40 selection:bg-teal-500/10 min-h-screen bg-slate-950">
      {/* ── HEADER ── */}
      <div className="bg-slate-900 border-b border-white/10 p-8 pt-10 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-64 h-64 bg-teal-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <button onClick={() => navigate(-1)} className="p-3.5 glass-dark rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white active:scale-95">
            <ArrowLeft size={20} />
          </button>
          
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-3.5 bg-teal-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 active:scale-95 transition-all">
             <Save size={14} strokeWidth={3} /> Save Identity
          </button>
        </div>

        <div className="flex items-center gap-5 relative z-10">
           <div className="w-20 h-20 bg-teal-500/10 border border-teal-500/20 rounded-3xl flex items-center justify-center text-teal-400 shadow-inner">
              <Ship size={36} strokeWidth={1.5} />
           </div>
           <div>
              <h1 className="text-3xl font-black text-white tracking-tighter leading-none">{data.shipName || "New Vessel"}</h1>
              <div className="flex items-center gap-2 mt-2">
                 <ShieldCheck size={14} className="text-emerald-400" />
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">Registered Offline Profile</p>
              </div>
           </div>
        </div>
      </div>

      <div className="px-5 space-y-6">
         {/* Identity Section */}
         <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-dark rounded-[2.5rem] border border-white/5 p-6 shadow-xl space-y-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
               <FileText size={14} className="text-teal-400" /> Core Identity
            </h3>
            
            <div className="space-y-4">
               <Field label="Vessel Name">
                 <input name="shipName" value={data.shipName} onChange={handleChange} className="input-vessel" placeholder="Enter vessel name" />
               </Field>
               
               <Field label="Captain / Owner Name">
                 <input name="ownerName" value={data.ownerName} onChange={handleChange} className="input-vessel" placeholder="e.g. Captain Rajan" />
               </Field>
               
               <Field label="Registration Number (State)">
                 <input name="registrationNumber" value={data.registrationNumber} onChange={handleChange} className="input-vessel uppercase" placeholder="e.g. IND-KA-04-1029" />
               </Field>
            </div>
         </motion.div>

         {/* Technical Specs */}
         <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-dark rounded-[2.5rem] border border-white/5 p-6 shadow-xl space-y-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
               <Navigation2 size={14} className="text-blue-400" /> Maritime Specs
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
               <Field label="Vessel Type">
                 <input name="vesselType" value={data.vesselType} onChange={handleChange} className="input-vessel" placeholder="e.g. Trawler" />
               </Field>
               <Field label="Call Sign (VHF)">
                 <input name="callSign" value={data.callSign} onChange={handleChange} className="input-vessel uppercase" placeholder="e.g. VTX-82" />
               </Field>
               <Field label="Crew Capacity">
                 <div className="relative">
                   <input name="crewCapacity" value={data.crewCapacity} onChange={handleChange} type="number" className="input-vessel pr-10" />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 text-[10px] font-black">PAX</span>
                 </div>
               </Field>
               <Field label="Length Overall">
                 <div className="relative">
                   <input name="length" value={data.length} onChange={handleChange} type="number" className="input-vessel pr-10" />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 text-[10px] font-black">M</span>
                 </div>
               </Field>
            </div>
         </motion.div>

         {/* Emergency Contacts */}
         <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-dark rounded-[2.5rem] border border-red-500/10 p-6 shadow-xl space-y-6 bg-red-500/5">
            <h3 className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] flex items-center gap-2">
               <RadioTower size={14} className="text-red-500" /> Emergency Comms
            </h3>
            <p className="text-[9px] text-slate-400 font-bold leading-relaxed -mt-3">These numbers are automatically pulled by the Mitra SOS mesh logic during an emergency distress broadcast.</p>
            
            <div className="space-y-4">
               <Field label="Primary Contact (Sat/VHF Linked)">
                 <div className="relative">
                   <input name="primaryContact" value={data.primaryContact} onChange={handleChange} type="tel" className="input-vessel pl-10" />
                   <PhoneCall size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                 </div>
               </Field>
               <Field label="Shore Emergency Contact (Family/Base)">
                 <div className="relative">
                   <input name="emergencyContact" value={data.emergencyContact} onChange={handleChange} type="tel" className="input-vessel pl-10 border-red-500/20 focus:border-red-500/50" />
                   <PhoneCall size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/50" />
                 </div>
               </Field>
            </div>
         </motion.div>
      </div>

      <style>{`
        .input-vessel {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border-radius: 1rem;
          padding: 1rem 1.25rem;
          color: white;
          font-weight: 700;
          font-size: 0.95rem;
          outline: none;
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.2s;
        }
        .input-vessel:focus {
          border-color: rgba(20,184,166,0.5);
          background: rgba(255,255,255,0.06);
        }
        .input-vessel::placeholder {
          color: rgb(71, 85, 105);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-2">{label}</label>
    {children}
  </div>
);

export default MyVessel;
