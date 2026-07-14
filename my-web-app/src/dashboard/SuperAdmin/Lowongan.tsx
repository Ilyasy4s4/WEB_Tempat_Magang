import { useState, type FormEvent } from "react";
import { Info, Briefcase } from "lucide-react";

export default function Lowongan() {
  const [jobTitle, setJobTitle] = useState("");
  const [division, setDivision] = useState("");
  const [workMode, setWorkMode] = useState<"Remote" | "On-site" | "Hybrid">("Remote");
  const [minSalary, setMinSalary] = useState("2.000.000");
  const [maxSalary, setMaxSalary] = useState("3.500.000");
  const [deadline, setDeadline] = useState("");

  const handlePublish = (e: FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) {
      alert("Harap isi Judul Pekerjaan.");
      return;
    }
    if (!division) {
      alert("Harap pilih Departemen / Divisi.");
      return;
    }
    if (!deadline) {
      alert("Harap pilih Batas Akhir Pendaftaran.");
      return;
    }

    alert(`Lowongan "${jobTitle}" berhasil diterbitkan! \nMode Kerja: ${workMode} \nRentang Honor: Rp ${minSalary} - Rp ${maxSalary}`);
    // Clear form
    setJobTitle("");
    setDivision("");
    setWorkMode("Remote");
    setDeadline("");
  };

  const handleCancel = () => {
    if (confirm("Apakah Anda yakin ingin membatalkan semua perubahan?")) {
      setJobTitle("");
      setDivision("");
      setWorkMode("Remote");
      setDeadline("");
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans w-full text-slate-700 select-none">
      
      {/* 1. HEADER SECTION */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Tambah Lowongan Magang
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Buat kesempatan magang baru bagi calon kandidat potensial.
        </p>
      </div>

      {/* 2. FORM CONTAINER */}
      <form onSubmit={handlePublish} className="w-full max-w-4xl bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs flex flex-col">
        
        {/* FORM CONTENT */}
        <div className="p-6 sm:p-8 flex flex-col gap-8">
          
          {/* SECTION 1: INFORMASI DASAR */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase flex items-center gap-1.5 border-b border-slate-50 pb-2">
              <Info size={14} className="text-blue-500" />
              Informasi Dasar
            </h3>

            {/* Inputs Row 1: Title & Division */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Judul Pekerjaan</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="contoh: Magang UI/UX Designer"
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Departemen / Divisi</label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700 cursor-pointer"
                >
                  <option value="">Pilih Divisi</option>
                  <option value="Technology & Architecture">Technology & Architecture</option>
                  <option value="Digital Product Division">Digital Product Division</option>
                  <option value="Marketing & Brand">Marketing & Brand</option>
                  <option value="Data Science & Analytics">Data Science & Analytics</option>
                  <option value="Finance & Accounting">Finance & Accounting</option>
                </select>
              </div>
            </div>

            {/* Inputs Row 2: Type & Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Tipe Pekerjaan</label>
                <input
                  type="text"
                  value="Magang (Internship)"
                  readOnly
                  className="bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-400 outline-none select-none cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Mode Kerja</label>
                <div className="flex gap-2">
                  {(["Remote", "On-site", "Hybrid"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setWorkMode(mode)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition select-none cursor-pointer border ${
                        workMode === mode
                          ? "bg-blue-50/80 text-blue-600 border-blue-200"
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: HONOR */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase flex items-center gap-1.5 border-b border-slate-50 pb-2">
              <Briefcase size={14} className="text-blue-500" />
              Honor
            </h3>

            {/* Inputs Row 1: Salary Ranges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Rentang Gaji (Minimum/bln)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    placeholder="2.000.000"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Rentang Gaji (Maksimum/bln)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(e.target.value)}
                    placeholder="3.500.000"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Inputs Row 2: Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Batas Akhir Pendaftaran</label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition text-slate-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER ACTION BUTTONS BAR */}
        <div className="bg-slate-50/50 border-t border-slate-100 px-8 py-5 flex items-center justify-end gap-4 select-none">
          <button
            type="button"
            onClick={handleCancel}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 transition cursor-pointer select-none bg-transparent border-none py-2 px-4"
          >
            Batalkan Perubahan
          </button>
          
          <button
            type="submit"
            className="bg-[#0252c7] hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition cursor-pointer active:scale-[0.98] select-none border-none shadow-xs"
          >
            Terbitkan Lowongan Sekarang
          </button>
        </div>

      </form>

    </div>
  );
}
