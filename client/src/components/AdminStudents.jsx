import React, { useState, useEffect } from 'react';
import api from '../utils/api'; // <--- CHANGED from ../../utils/api to ../utils/api
import { motion } from 'framer-motion';
import { 
  Search, Filter, Download, Trash2, Eye, Mail 
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Filter States ---
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [batch, setBatch] = useState('All');

  // --- Fetch Data ---
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (department !== 'All') params.append('department', department);
      if (batch !== 'All') params.append('batch', batch);

      const res = await api.get(`/auth/students?${params.toString()}`);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, department, batch]);

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await api.delete(`/auth/reject/${id}`);
      toast.success("Student removed");
      setStudents(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      
      {/* --- FILTER BAR --- */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
        
        {/* Search */}
        <div className="relative w-full md:w-96 group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
          <div className="relative flex items-center bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5">
            <Search className="text-slate-500 mr-3" size={18} />
            <input 
              type="text" 
              placeholder="Search Name, Roll No..." 
              className="bg-transparent border-none outline-none text-slate-200 placeholder-slate-600 w-full text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Dropdowns */}
        <div className="flex gap-3 w-full md:w-auto overflow-x-auto">
          <select 
            className="bg-slate-950 text-slate-300 border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:border-cyan-500/50 outline-none cursor-pointer"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="AIDS">AI & DS</option>
          </select>

          <select 
            className="bg-slate-950 text-slate-300 border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:border-cyan-500/50 outline-none cursor-pointer"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
          >
            <option value="All">All Batches</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl text-sm font-semibold hover:bg-cyan-500/20 transition-all">
            <Download size={16} /> <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 text-slate-400 border-b border-white/5 text-xs uppercase tracking-wider">
                <th className="p-5 font-semibold">Student Profile</th>
                <th className="p-5 font-semibold">Department</th>
                <th className="p-5 font-semibold">Batch</th>
                <th className="p-5 font-semibold">Roll No</th>
                <th className="p-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-500">Loading...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-500">No students found.</td></tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-200 font-medium">{student.name}</p>
                          <p className="text-slate-500 text-xs flex items-center gap-1">
                             <Mail size={10} /> {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium">
                        {student.department}
                      </span>
                    </td>
                    <td className="p-5 text-slate-400 font-mono">{student.batch}</td>
                    <td className="p-5 text-slate-300 font-mono">{student.rollNumber || '-'}</td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-cyan-400 transition-colors" title="View Profile">
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(student._id)}
                          className="p-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-400 transition-colors" 
                          title="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminStudents;