import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Activity, Heart, LogIn, LogOut, Search, ShieldCheck, UserPlus } from "lucide-react";
import api from "./api";

const groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function Layout({ user, setUser }) {
  const nav = useNavigate();
  const logout = () => {
    localStorage.removeItem("bloodconnect_token");
    localStorage.removeItem("bloodconnect_user");
    setUser(null);
    nav("/");
  };

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-black text-rose-600">
            <Heart fill="currentColor" /> BloodConnect
          </Link>
          <div className="hidden gap-5 text-sm font-semibold md:flex">
            <Link to="/find">Find Blood</Link>
            {user && <Link to="/requests">Requests</Link>}
            {user?.role === "donor" && <Link to="/donor">Donor Dashboard</Link>}
            {user?.role === "patient" && <Link to="/become-donor">Become a Donor</Link>}
            {user?.role === "admin" && <Link to="/admin">Admin</Link>}
          </div>
          <div className="flex gap-2">
            {user ? (
              <button onClick={logout} className="rounded-xl bg-slate-900 px-4 py-2 text-white"><LogOut size={16} className="inline mr-1"/>Logout</button>
            ) : (
              <>
                <Link to="/login" className="rounded-xl px-4 py-2">Login</Link>
                <Link to="/register" className="rounded-xl bg-rose-600 px-4 py-2 text-white">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main><Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find" element={<FindBlood />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register setUser={setUser} />} />
        <Route path="/requests" element={user ? <Requests /> : <Navigate to="/login" />} />
        <Route path="/donor" element={user?.role === "donor" ? <DonorDashboard /> : <Navigate to="/login" />} />
        <Route path="/become-donor" element={user ? <BecomeDonor setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user?.role === "admin" ? <Admin /> : <Navigate to="/login" />} />
      </Routes></main>
      <footer className="mt-20 border-t bg-white py-8 text-center text-sm text-slate-500">
        BloodConnect • Educational project • Protect donor and patient privacy
      </footer>
    </div>
  );
}

function Home() {
  return (
    <section>
      <div className="bg-gradient-to-br from-rose-700 via-rose-600 to-red-500 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-24 md:grid-cols-2 md:items-center">
          <div>
            <div className="mb-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm">🩸 Community Blood Network</div>
            <h1 className="text-5xl font-black leading-tight md:text-6xl">Every donation can make a difference.</h1>
            <p className="mt-5 max-w-xl text-lg text-rose-100">Find available donors and create blood requests in one platform.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/find" className="rounded-2xl bg-white px-6 py-3 font-bold text-rose-700">Find Blood</Link>
              <Link to="/register" className="rounded-2xl border border-white/50 px-6 py-3 font-bold">Become a Donor</Link>
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 p-8 shadow-2xl backdrop-blur">
            <div className="grid grid-cols-2 gap-4">
              {groups.slice(0, 6).map(g => <div key={g} className="rounded-2xl bg-white p-5 text-center text-slate-900"><div className="text-2xl font-black text-rose-600">{g}</div><div className="mt-1 text-xs text-slate-500">Blood group</div></div>)}
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-14 md:grid-cols-3">
        <Feature icon={<Search />} title="Find Blood" text="Search available donors by blood group and city." />
        <Feature icon={<Activity />} title="Emergency Requests" text="Create urgent requests and notify matching donors." />
        <Feature icon={<ShieldCheck />} title="Secure Access" text="JWT authentication and role-based dashboards." />
      </div>
    </section>
  );
}

function Feature({ icon, title, text }) {
  return <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200"><div className="mb-4 w-fit rounded-xl bg-rose-50 p-3 text-rose-600">{icon}</div><h3 className="text-xl font-bold">{title}</h3><p className="mt-2 text-slate-500">{text}</p></div>;
}

function Card({ children }) { return <div className="panel">{children}</div>; }

function Field({ label, ...props }) {
  return <label className="block"><span className="mb-1 block text-sm font-semibold">{label}</span><input {...props} className="input-field" /></label>;
}

function Login({ setUser }) {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault(); setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("bloodconnect_token", data.token);
      localStorage.setItem("bloodconnect_user", JSON.stringify(data.user));
      setUser(data.user); nav("/");
    } catch (e) { setError(e.response?.data?.message || "Login failed"); }
  }
  return <Page title="Welcome back" subtitle="Login to your BloodConnect account."><Card><form onSubmit={submit} className="space-y-4">
    <Field label="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
    <Field label="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
    {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
    <button className="w-full rounded-xl bg-rose-600 py-3 font-bold text-white"><LogIn className="mr-2 inline" size={18}/>Login</button>
  </form></Card></Page>;
}

function Register({ setUser }) {
  const nav = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"", phone:"", city:"", role:"donor", bloodGroup:"O+", area:"", consentToContact:true });
  const [error,setError]=useState("");
  const update=(k,v)=>setForm({...form,[k]:v});
  async function submit(e) {
    e.preventDefault(); setError("");
    try {
      const {data}=await api.post("/auth/register",form);
      localStorage.setItem("bloodconnect_token",data.token);
      localStorage.setItem("bloodconnect_user",JSON.stringify(data.user));
      setUser(data.user); nav("/");
    } catch(e){setError(e.response?.data?.message||"Registration failed");}
  }
  return <Page title="Create your account" subtitle="Join the blood donation community."><Card><form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
    <Field label="Full name" value={form.name} onChange={e=>update("name",e.target.value)} required />
    <Field label="Email" type="email" value={form.email} onChange={e=>update("email",e.target.value)} required />
    <Field label="Password" type="password" value={form.password} onChange={e=>update("password",e.target.value)} minLength="6" required />
    <Field label="Phone" value={form.phone} onChange={e=>update("phone",e.target.value)} />
    <Field label="City" value={form.city} onChange={e=>update("city",e.target.value)} required />
    <label><span className="mb-1 block text-sm font-semibold">Account type</span><select className="w-full rounded-xl border p-3" value={form.role} onChange={e=>update("role",e.target.value)}><option value="donor">Donor</option><option value="patient">Patient / Requester</option></select></label>
    {form.role==="donor" && <>
      <label><span className="mb-1 block text-sm font-semibold">Blood group</span><select className="w-full rounded-xl border p-3" value={form.bloodGroup} onChange={e=>update("bloodGroup",e.target.value)}>{groups.map(g=><option key={g}>{g}</option>)}</select></label>
      <Field label="Area / locality (optional)" value={form.area} onChange={e=>update("area",e.target.value)} />
      <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={form.consentToContact} onChange={e=>update("consentToContact",e.target.checked)} /> I consent to being contacted for blood requests.</label>
    </>}
    {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 md:col-span-2">{error}</p>}
    <button className="rounded-xl bg-rose-600 py-3 font-bold text-white md:col-span-2"><UserPlus className="mr-2 inline" size={18}/>Create Account</button>
  </form></Card></Page>;
}

function FindBlood() {
  const [bloodGroup,setBloodGroup]=useState("O+"); const [city,setCity]=useState(""); const [donors,setDonors]=useState([]); const [loading,setLoading]=useState(false);
  async function search(e){e?.preventDefault();setLoading(true);try{const {data}=await api.get(`/donors/search?bloodGroup=${encodeURIComponent(bloodGroup)}&city=${encodeURIComponent(city)}`);setDonors(data);}finally{setLoading(false);}}
  return <Page title="Find Blood" subtitle="Search donors who have chosen to be available for contact."><Card><form onSubmit={search} className="grid gap-4 md:grid-cols-3">
    <label><span className="mb-1 block text-sm font-semibold">Blood group</span><select className="w-full rounded-xl border p-3" value={bloodGroup} onChange={e=>setBloodGroup(e.target.value)}>{groups.map(g=><option key={g}>{g}</option>)}</select></label>
    <Field label="City" placeholder="e.g. Bengaluru" value={city} onChange={e=>setCity(e.target.value)} required />
    <button className="mt-6 rounded-xl bg-rose-600 py-3 font-bold text-white">{loading?"Searching...":"Search Donors"}</button>
  </form></Card>
  <div className="mt-6 grid gap-4 md:grid-cols-2">{donors.map(d=><Card key={d._id}><div className="flex items-center justify-between"><div><h3 className="text-xl font-bold">{d.userId?.name || "Donor"}</h3><p className="text-slate-500">{d.city} {d.area ? `• ${d.area}` : ""}</p></div><div className="rounded-2xl bg-rose-50 px-4 py-3 text-xl font-black text-rose-600">{d.bloodGroup}</div></div><p className="mt-4 text-sm text-emerald-600">● Available for contact</p><p className="mt-2 text-sm font-semibold">Phone: {d.userId?.phone || "Not provided"}</p><p className="text-sm">Email: {d.userId?.email || "Not provided"}</p></Card>)}</div>
  {donors.length===0 && <p className="mt-8 text-center text-slate-500">Search to see matching donors.</p>}</Page>;
}

function Requests(){
  const [requests,setRequests]=useState([]); const [form,setForm]=useState({patientName:"",bloodGroup:"O+",unitsRequired:1,hospital:"",city:"",urgency:"normal",requiredDate:"",reason:""}); const [msg,setMsg]=useState("");
  const update=(k,v)=>setForm({...form,[k]:v});
  async function load(){const {data}=await api.get("/requests");setRequests(data);}
  useEffect(()=>{load()},[]);
  async function submit(e){e.preventDefault();const {data}=await api.post("/requests",form);setMsg(`Request created. Matching donors found: ${data.matchedDonors}.`);setForm({...form,patientName:"",hospital:"",reason:""});load();}
  return <Page title="Blood Requests" subtitle="Create a request and notify matching available donors."><Card><form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
    <Field label="Patient name" value={form.patientName} onChange={e=>update("patientName",e.target.value)} required />
    <label><span className="mb-1 block text-sm font-semibold">Blood group</span><select className="w-full rounded-xl border p-3" value={form.bloodGroup} onChange={e=>update("bloodGroup",e.target.value)}>{groups.map(g=><option key={g}>{g}</option>)}</select></label>
    <Field label="Units required" type="number" min="1" value={form.unitsRequired} onChange={e=>update("unitsRequired",Number(e.target.value))} required />
    <Field label="Hospital" value={form.hospital} onChange={e=>update("hospital",e.target.value)} required />
    <Field label="City" value={form.city} onChange={e=>update("city",e.target.value)} required />
    <label><span className="mb-1 block text-sm font-semibold">Urgency</span><select className="w-full rounded-xl border p-3" value={form.urgency} onChange={e=>update("urgency",e.target.value)}><option>normal</option><option>urgent</option><option>emergency</option></select></label>
    <Field label="Required date" type="date" value={form.requiredDate} onChange={e=>update("requiredDate",e.target.value)} />
    <Field label="Reason (optional)" value={form.reason} onChange={e=>update("reason",e.target.value)} />
    <button className="rounded-xl bg-rose-600 py-3 font-bold text-white md:col-span-2">Create Blood Request</button>
    {msg && <p className="rounded-xl bg-emerald-50 p-3 text-emerald-700 md:col-span-2">{msg}</p>}
  </form></Card>
  <h2 className="mt-10 text-2xl font-black">Recent Requests</h2><div className="mt-4 grid gap-4">{requests.map(r=><Card key={r._id}><div className="flex flex-wrap items-center justify-between gap-3"><div><b>{r.bloodGroup}</b> • {r.unitsRequired} unit(s) • {r.hospital}</div><span className={`rounded-full px-3 py-1 text-xs font-bold ${r.urgency==="emergency"?"bg-red-100 text-red-700":"bg-slate-100"}`}>{r.urgency}</span></div><p className="mt-2 text-sm text-slate-500">{r.city} • {r.status}</p>{r.requesterId && <p className="mt-2 text-sm">Contact: {r.requesterId.name} • {r.requesterId.phone || r.requesterId.email}</p>}</Card>)}</div></Page>;
}

function BecomeDonor({ setUser }){
  const nav = useNavigate();
  const [form,setForm]=useState({bloodGroup:"O+",city:"",area:"",consentToContact:true}); const [error,setError]=useState("");
  async function submit(e){e.preventDefault();setError("");try{const {data}=await api.post("/donors/become",form);const user={...JSON.parse(localStorage.getItem("bloodconnect_user")),role:"donor",city:data.donor.city};localStorage.setItem("bloodconnect_user",JSON.stringify(user));if(data.token)localStorage.setItem("bloodconnect_token",data.token);setUser(user);nav("/donor");}catch(e){setError(e.response?.data?.message||"Could not save donor profile");}}
  return <Page title="Become a Donor" subtitle="Your existing account can be upgraded to a donor profile more than once. Update your details whenever needed."><Card><form onSubmit={submit} className="grid gap-4 md:grid-cols-2"><label><span className="mb-1 block text-sm font-semibold">Blood group</span><select className="w-full rounded-xl border p-3" value={form.bloodGroup} onChange={e=>setForm({...form,bloodGroup:e.target.value})}>{groups.map(g=><option key={g}>{g}</option>)}</select></label><Field label="City" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} required /><Field label="Area / locality" value={form.area} onChange={e=>setForm({...form,area:e.target.value})}/><label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={form.consentToContact} onChange={e=>setForm({...form,consentToContact:e.target.checked})}/> I consent to being contacted for blood requests.</label>{error&&<p className="rounded-xl bg-red-50 p-3 text-red-600 md:col-span-2">{error}</p>}<button className="rounded-xl bg-rose-600 py-3 font-bold text-white md:col-span-2">Save Donor Profile</button></form></Card></Page>;
}

function DonorDashboard(){
  const [donor,setDonor]=useState(null); const [saved,setSaved]=useState("");
  useEffect(()=>{api.get("/donors/me").then(r=>setDonor(r.data))},[]);
  async function toggle(){const {data}=await api.patch("/donors/me",{available:!donor.available});setDonor(data);setSaved("Availability updated");}
  if(!donor)return <Page title="Donor Dashboard" subtitle="Loading..."/>;
  return <Page title={`Hello, ${donor.userId?.name || "Donor"} 👋`} subtitle="Manage your donor profile and availability."><Card><div className="grid gap-6 md:grid-cols-3"><div><p className="text-sm text-slate-500">Blood group</p><p className="text-4xl font-black text-rose-600">{donor.bloodGroup}</p></div><div><p className="text-sm text-slate-500">Location</p><p className="text-xl font-bold">{donor.city}</p></div><div><p className="text-sm text-slate-500">Status</p><p className={donor.available?"text-xl font-bold text-emerald-600":"text-xl font-bold text-slate-500"}>{donor.available?"Available":"Unavailable"}</p></div></div><button onClick={toggle} className="mt-8 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white">{donor.available?"Set Unavailable":"Set Available"}</button>{saved&&<span className="ml-3 text-sm text-emerald-600">{saved}</span>}</Card></Page>;
}

function Admin(){
  const [stats,setStats]=useState(null);
  useEffect(()=>{api.get("/admin/stats").then(r=>setStats(r.data)).catch(()=>setStats(null))},[]);
  return <Page title="Admin Dashboard" subtitle="System overview."><div className="grid gap-5 md:grid-cols-5">{stats && Object.entries(stats).map(([k,v])=><Card key={k}><p className="text-sm capitalize text-slate-500">{k}</p><p className="mt-2 text-3xl font-black">{v}</p></Card>)}</div></Page>;
}

function Page({title,subtitle,children}){return <div className="mx-auto max-w-7xl px-5 py-12"><h1 className="text-4xl font-black">{title}</h1><p className="mt-2 text-slate-500">{subtitle}</p><div className="mt-8">{children}</div></div>}

export default function App(){
  const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem("bloodconnect_user"))}catch{return null}});
  return <Layout user={user} setUser={setUser}/>;
}
