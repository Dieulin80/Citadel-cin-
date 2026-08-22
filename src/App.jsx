import React, { useState, useRef, useMemo, useEffect } from "react";
import { Play, Info, Search, UploadCloud, Film, X, Check, Clock, CalendarDays, Globe, LogOut, MessageCircle, Image as ImageIcon, ShieldCheck } from "lucide-react";
import { supabase } from "./supabaseClient";

// ---- Design tokens ----
// bg-void: #0A0A10 | surface: #15151F | surface-2: #1D1D29
// gold accent: #C9A15A | text-primary: #ECE8DD | text-dim: #8C8A96 | border: #2A2A38

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Anton&family=Work+Sans:wght@400;500;600&display=swap');
@keyframes hf-marquee-scroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
.hf-marquee-track { display: inline-block; white-space: nowrap; animation: hf-marquee-scroll 60s linear infinite; }`;

const LANGS = [
  { code: "fr", label: "Français" },
  { code: "ht", label: "Kreyòl" },
  { code: "en", label: "English" },
];

const GENRE_KEYS = ["haitian", "drama", "action", "comedy", "documentary", "romance", "serie", "animation", "horror", "music", "thriller", "fantasy", "astrology"];
const WHATSAPP = [
  { name: "Don Hyper", number: "50932399183" },
  { name: "Alibaba", number: "50941728389" },
];
const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/ICUvvhUOPEvEFgSXGFJZs5?s=cl&p=a&ilr=0";

const T = {
  ht: {
    nav_catalog: "Katalòg", nav_community: "Voye Videyo", nav_staff: "Staff", nav_settings: "Paramèt",
    search_ph: "Chèche yon vidyo...", featured: "Anvedèt", watch: "Gade Kounye a", details: "Detay",
    genre: { haitian: "Vidyo Ayisyen", drama: "Dram", action: "Aksyon", comedy: "Komedi", documentary: "Dokimantè", romance: "Woman", serie: "Seri", animation: "Fim Animasyon (Timoun)", horror: "Fim Laterè", music: "Videyo Mizik", thriller: "Sispans", fantasy: "Fantasy", astrology: "Astwoloji" },
    empty: "Pa gen vidyo ki matche rechèch la.",
    join_group: "Antre nan Gwoup WhatsApp",
    up_title: "AJOUTE YON VIDYO (STAFF)", up_sub: "Fim sa a ap parèt piblikman touswit.",
    com_title: "VOYE YON VIDYO", com_sub: "Videyo w soumèt la ap tann apwobasyon staff anvan l parèt sou sit la.",
    f_title: "Tit", f_year: "Ane", f_duration: "Dire", f_genre: "Kategori", f_desc: "Deskripsyon", f_name: "Non ou (opsyonèl)",
    f_desc_ph: "Yon rezime kout...", f_video: "Fichye videyo", f_video_ph: "Klike pou chwazi fichye a",
    f_poster: "Imaj Fim nan (Poster)", f_poster_ph: "Klike pou chwazi yon imaj", download: "Telechaje Videyo",
    uploading: "K ap poste...", submit: "Ajoute Vidyo", submit_com: "Voye pou Apwobasyon", err_file: "Chwazi yon fichye videyo anvan ou soumèt.",
    done_title: "Vidyo a ajoute nan katalòg la", done_title_com: "Mèsi! Videyo w la ap tann apwobasyon staff",
    add_another: "Ajoute yon lòt vidyo", contact: "Kontakte Nou", login_staff: "Koneksyon Staff",
    settings_title: "PARAMÈT SIT LA", logo_label: "Logo Sit la", bg_label: "Imaj Fon (Background)", save: "Anrejistre",
    pending_title: "FIM K AP TANN APWOBASYON", approve: "Apwouve", no_pending: "Pa gen fim k ap tann apwobasyon.",
  },
  fr: {
    nav_catalog: "Catalogue", nav_community: "Envoyer une vidéo", nav_staff: "Staff", nav_settings: "Paramètres",
    search_ph: "Rechercher une vidéo...", featured: "À la une", watch: "Regarder", details: "Détails",
    genre: { haitian: "Vidéos Haïtiennes", drama: "Drame", action: "Action", comedy: "Comédie", documentary: "Documentaire", romance: "Romance", serie: "Séries", animation: "Films d'Animation", horror: "Films d'Horreur", music: "Clips Musicaux", thriller: "Thriller", fantasy: "Fantasy", astrology: "Astrologie" },
    empty: "Aucune vidéo ne correspond à la recherche.",
    join_group: "Rejoindre le Groupe WhatsApp",
    up_title: "AJOUTER UNE VIDÉO (STAFF)", up_sub: "Cette vidéo apparaîtra publiquement immédiatement.",
    com_title: "ENVOYER UNE VIDÉO", com_sub: "Votre vidéo sera visible après validation par notre équipe.",
    f_title: "Titre", f_year: "Année", f_duration: "Durée", f_genre: "Catégorie", f_desc: "Description", f_name: "Votre nom (optionnel)",
    f_desc_ph: "Un résumé court...", f_video: "Fichier vidéo", f_video_ph: "Cliquez pour choisir un fichier",
    f_poster: "Image du film (Affiche)", f_poster_ph: "Cliquez pour choisir une image", download: "Télécharger la vidéo",
    uploading: "Publication en cours...", submit: "Ajouter la vidéo", submit_com: "Envoyer pour validation", err_file: "Choisissez un fichier vidéo avant de soumettre.",
    done_title: "Vidéo ajoutée au catalogue", done_title_com: "Merci ! Votre vidéo est en attente de validation",
    add_another: "Ajouter une autre vidéo", contact: "Nous contacter", login_staff: "Connexion Staff",
    settings_title: "PARAMÈTRES DU SITE", logo_label: "Logo du site", bg_label: "Image de fond", save: "Enregistrer",
    pending_title: "VIDÉOS EN ATTENTE", approve: "Approuver", no_pending: "Aucune vidéo en attente.",
  },
  en: {
    nav_catalog: "Catalog", nav_community: "Submit a video", nav_staff: "Staff", nav_settings: "Settings",
    search_ph: "Search a video...", featured: "Featured", watch: "Watch Now", details: "Details",
    genre: { haitian: "Haitian Videos", drama: "Drama", action: "Action", comedy: "Comedy", documentary: "Documentary", romance: "Romance", serie: "Series", animation: "Animated Films", horror: "Horror Movies", music: "Music Videos", thriller: "Thriller", fantasy: "Fantasy", astrology: "Astrology" },
    empty: "No videos match your search.",
    join_group: "Join WhatsApp Group",
    up_title: "ADD A VIDEO (STAFF)", up_sub: "This video will appear publicly right away.",
    com_title: "SUBMIT A VIDEO", com_sub: "Your video will be visible after staff approval.",
    f_title: "Title", f_year: "Year", f_duration: "Duration", f_genre: "Category", f_desc: "Description", f_name: "Your name (optional)",
    f_desc_ph: "A short summary...", f_video: "Video file", f_video_ph: "Click to choose a file",
    f_poster: "Film Poster Image", f_poster_ph: "Click to choose an image", download: "Download Video",
    uploading: "Uploading...", submit: "Add Video", submit_com: "Submit for approval", err_file: "Choose a video file before submitting.",
    done_title: "Video added to the catalog", done_title_com: "Thanks! Your video is pending approval",
    add_another: "Add another video", contact: "Contact Us", login_staff: "Staff Login",
    settings_title: "SITE SETTINGS", logo_label: "Site Logo", bg_label: "Background Image", save: "Save",
    pending_title: "PENDING VIDEOS", approve: "Approve", no_pending: "No pending videos.",
  },
};

const SEED_FILMS = [
  { id: 1, genreKey: "drama", year: 2024, duration: "1h42", featured: true, status: "approved", color: "#3B2A24",
    title: { ht: "Lakou San Fwontyè", fr: "La Cour Sans Frontière", en: "The Yard Without Borders" },
    desc: { ht: "Yon fanmi nan Ouanaminthe k ap goumen pou kenbe tè zansèt yo.", fr: "Une famille à Ouanaminthe se bat pour garder sa terre ancestrale.", en: "A family in Ouanaminthe fights to keep their ancestral land." } },
  { id: 2, genreKey: "haitian", year: 2023, duration: "58m", status: "approved", color: "#22303A",
    title: { ht: "Rakonte Nou", fr: "Raconte-Nous", en: "Tell Us" },
    desc: { ht: "Vwa granmoun ki rakonte istwa vil la.", fr: "Des voix d'aînés racontent l'histoire de la ville.", en: "Elders' voices recount the city's story." } },
  { id: 3, genreKey: "romance", year: 2024, duration: "1h15", status: "approved", color: "#3A2438",
    title: { ht: "Solèy Leve Sou Nou", fr: "Le Soleil Se Lève Sur Nous", en: "The Sun Rises On Us" },
    desc: { ht: "De timoun ki grandi ansanm rekonekte apre ane separasyon.", fr: "Deux enfants qui ont grandi ensemble se retrouvent.", en: "Two childhood friends reconnect after years apart." } },
  { id: 4, genreKey: "action", year: 2022, duration: "1h33", status: "approved", color: "#2A1E1E",
    title: { ht: "Kous Kont Lè", fr: "Course Contre la Montre", en: "Race Against Time" },
    desc: { ht: "Yon mesaje k ap kouri pou l delivre yon pake.", fr: "Un messager court livrer un colis avant une échéance.", en: "A courier races to deliver a package." } },
  { id: 5, genreKey: "comedy", year: 2023, duration: "47m", status: "approved", color: "#1E3028",
    title: { ht: "Ti Rezo", fr: "Petit Réseau", en: "Little Network" },
    desc: { ht: "Yon gwoup zanmi k ap monte premye biznis dijital yo.", fr: "Un groupe d'amis lance leur première entreprise numérique.", en: "Friends launch their first digital business." } },
  { id: 6, genreKey: "haitian", year: 2021, duration: "1h05", status: "approved", color: "#2A2A1E",
    title: { ht: "Fondasyon", fr: "Fondation", en: "Foundation" },
    desc: { ht: "Yon rega sou moun k ap rebati apre yon katastwòf.", fr: "Des personnes qui reconstruisent après une catastrophe.", en: "People rebuilding after a disaster." } },
];

function dbRowToFilm(row) {
  return {
    id: row.id, genreKey: row.genre_key, year: row.year, duration: row.duration,
    color: "#2A2A1E", featured: row.featured, status: row.status,
    posterUrl: row.poster_url || null, videoUrl: row.video_url || null,
    title: { ht: row.title_ht, fr: row.title_fr, en: row.title_en },
    desc: { ht: row.desc_ht, fr: row.desc_fr, en: row.desc_en },
  };
}

function WhatsAppButton({ t }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm"
        style={{ color: "#ECE8DD", border: "1px solid #2A2A38" }}
      >
        <MessageCircle size={14} style={{ color: "#25D366" }} />
        <span className="hidden sm:inline">{t.contact}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 rounded-md overflow-hidden z-50" style={{ background: "#15151F", border: "1px solid #2A2A38" }}>
          <a
            href={WHATSAPP_GROUP_LINK}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3.5 py-2.5 text-sm whitespace-nowrap"
            style={{ color: "#C9A15A", borderBottom: "1px solid #2A2A38", fontWeight: 600 }}
          >
            <MessageCircle size={14} style={{ color: "#25D366" }} /> {t.join_group}
          </a>
          {WHATSAPP.map((w) => (
            <a
              key={w.number}
              href={`https://wa.me/${w.number}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3.5 py-2.5 text-sm whitespace-nowrap"
              style={{ color: "#ECE8DD" }}
            >
              <MessageCircle size={14} style={{ color: "#25D366" }} /> {w.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function Ticker() {
  return (
    <div className="overflow-hidden py-1" style={{ background: "#0A0A10", borderBottom: "1px solid #2A2A38" }}>
      <div className="hf-marquee-track text-[11px] tracking-wide" style={{ color: "#C9A15A", fontFamily: "'Work Sans', sans-serif" }}>
        Don Hyper &amp; Alibaba &nbsp;&nbsp;•&nbsp;&nbsp; Don Hyper &amp; Alibaba &nbsp;&nbsp;•&nbsp;&nbsp; Don Hyper &amp; Alibaba &nbsp;&nbsp;•&nbsp;&nbsp; Don Hyper &amp; Alibaba
      </div>
    </div>
  );
}

function GenreNav({ t, onSelect }) {
  return (
    <div className="sticky top-[52px] z-30 flex gap-2 overflow-x-auto px-5 sm:px-10 py-2.5" style={{ background: "rgba(10,10,16,0.96)", backdropFilter: "blur(6px)", borderBottom: "1px solid #2A2A38" }}>
      {GENRE_KEYS.map((g) => (
        <button
          key={g}
          onClick={() => onSelect(g)}
          className="shrink-0 px-3 py-1.5 rounded-full text-xs whitespace-nowrap"
          style={{ background: "#15151F", border: "1px solid #2A2A38", color: "#ECE8DD" }}
        >
          {t.genre[g]}
        </button>
      ))}
    </div>
  );
}

function FilmCard({ film, lang, t, onOpen }) {
  return (
    <button
      onClick={() => onOpen(film)}
      className="group relative text-left rounded-md overflow-hidden shrink-0 w-[140px] sm:w-[160px] focus:outline-none"
      style={{ backgroundColor: "#15151F" }}
    >
      <div
        className="aspect-[2/3] w-full flex items-end p-3 transition-transform duration-300 group-hover:scale-[1.05]"
        style={
          film.posterUrl
            ? { backgroundImage: `linear-gradient(to top, rgba(10,10,16,0.85), rgba(10,10,16,0)), url(${film.posterUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: `linear-gradient(160deg, ${film.color}, #0A0A10)` }
        }
      >
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-full">
          <div className="flex items-center gap-1 text-[11px]" style={{ color: "#C9A15A" }}>
            <Clock size={12} /> {film.duration}
          </div>
        </div>
      </div>
      <div className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(10,10,16,0.7)", color: "#8C8A96" }}>
        {film.year}
      </div>
      <div className="p-2">
        <p className="text-sm leading-tight truncate" style={{ color: "#ECE8DD", fontFamily: "'Work Sans', sans-serif", fontWeight: 600 }}>
          {film.title[lang]}
        </p>
      </div>
    </button>
  );
}

function Row({ genreKey, films, lang, t, onOpen }) {
  const list = films.filter((f) => f.genreKey === genreKey);
  if (list.length === 0) return null;
  return (
    <div className="py-3 scroll-mt-24" id={`genre-row-${genreKey}`}>
      <h2 className="px-5 sm:px-10 mb-2 text-sm font-semibold" style={{ color: "#ECE8DD", fontFamily: "'Work Sans', sans-serif" }}>
        {t.genre[genreKey]}
      </h2>
      <div className="flex gap-3 px-5 sm:px-10 overflow-x-auto pb-2">
        {list.map((f) => <FilmCard key={f.id} film={f} lang={lang} t={t} onOpen={onOpen} />)}
      </div>
    </div>
  );
}

function DetailModal({ film, lang, t, onClose }) {
  if (!film) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(6,6,10,0.85)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg overflow-hidden" style={{ background: "#15151F", border: "1px solid #2A2A38" }} onClick={(e) => e.stopPropagation()}>
        <div
          className="h-40 relative"
          style={
            film.posterUrl
              ? { backgroundImage: `linear-gradient(to top, #15151F, rgba(21,21,31,0.1)), url(${film.posterUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: `linear-gradient(160deg, ${film.color}, #0A0A10)` }
          }
        >
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full" style={{ background: "rgba(10,10,16,0.6)", color: "#ECE8DD" }}>
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          <h3 style={{ fontFamily: "'Anton', sans-serif", color: "#ECE8DD", fontSize: "1.5rem", letterSpacing: "0.02em" }}>
            {film.title[lang].toUpperCase()}
          </h3>
          <div className="flex items-center gap-3 mt-1.5 text-[12px]" style={{ color: "#8C8A96" }}>
            <span className="flex items-center gap-1"><CalendarDays size={12} /> {film.year}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {film.duration}</span>
            <span style={{ color: "#C9A15A" }}>{t.genre[film.genreKey]}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "#B8B5C0", fontFamily: "'Work Sans', sans-serif" }}>{film.desc[lang]}</p>
          <div className="flex gap-2 mt-5">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold" style={{ background: "#C9A15A", color: "#0A0A10" }}>
              <Play size={15} fill="#0A0A10" /> {t.watch}
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm" style={{ border: "1px solid #2A2A38", color: "#ECE8DD" }}>
              <Info size={15} /> {t.details}
            </button>
          </div>
          {film.videoUrl && (
            <a
              href={film.videoUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 mt-2 py-2.5 rounded-md text-sm"
              style={{ border: "1px solid #2A2A38", color: "#C9A15A" }}
            >
              <UploadCloud size={15} style={{ transform: "rotate(180deg)" }} /> {t.download}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function LoginGate({ lang, onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const copy = {
    ht: { title: "KONEKSYON STAFF", email: "Imel", pass: "Modpas", btn: "Konekte", err: "Imel oswa modpas pa kòrèk." },
    fr: { title: "CONNEXION STAFF", email: "E-mail", pass: "Mot de passe", btn: "Se connecter", err: "E-mail ou mot de passe incorrect." },
    en: { title: "STAFF LOGIN", email: "Email", pass: "Password", btn: "Log in", err: "Incorrect email or password." },
  }[lang];

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) { setError(copy.err); return; }
    onLoggedIn(data.user);
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h2 style={{ fontFamily: "'Anton', sans-serif", color: "#ECE8DD", fontSize: "1.5rem", letterSpacing: "0.02em" }}>{copy.title}</h2>
      <form onSubmit={handleSubmit} className="space-y-3 mt-5">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={copy.email}
          className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: "#1D1D29", border: "1px solid #2A2A38", color: "#ECE8DD" }} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={copy.pass}
          className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: "#1D1D29", border: "1px solid #2A2A38", color: "#ECE8DD" }} />
        {error && <p className="text-sm" style={{ color: "#D98080" }}>{error}</p>}
        <button type="submit" disabled={loading} className="w-full py-2.5 rounded-md text-sm font-semibold disabled:opacity-40" style={{ background: "#C9A15A", color: "#0A0A10" }}>
          {loading ? "..." : copy.btn}
        </button>
      </form>
    </div>
  );
}

function UploadForm({ lang, t, isStaff, onSubmitFilm }) {
  const [form, setForm] = useState({ title: "", year: "", duration: "", genreKey: "drama", desc: "", name: "" });
  const [videoFile, setVideoFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle");
  const canSubmit = form.title && form.year && videoFile && status === "idle";

  function handleFile(e) { const f = e.target.files?.[0]; if (f) setVideoFile(f); }
  function handlePoster(e) { const f = e.target.files?.[0]; if (f) setPosterFile(f); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!videoFile) { setError(t.err_file); return; }
    setError(""); setStatus("uploading"); setProgress(15);

    try {
      const fd = new FormData();
      fd.append("file", videoFile);
      fd.append("title", form.title);

      const res = await fetch(
        "https://wepevdfxxihcqwmektnt.supabase.co/functions/v1/upload-video",
        { method: "POST", body: fd }
      );
      setProgress(80);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload echwe");

      setProgress(100);
      setStatus("done");
      onSubmitFilm({
        genreKey: form.genreKey, year: form.year, duration: form.duration || "—",
        title: { ht: form.title, fr: form.title, en: form.title },
        desc: { ht: form.desc || "Pa gen deskripsyon.", fr: form.desc || "Pas de description.", en: form.desc || "No description." },
        submittedName: form.name,
        posterFile,
        videoUrl: result.playbackUrl,
      });
    } catch (err) {
      setStatus("idle");
      setProgress(0);
      setError(String(err.message || err));
    }
  }

  function reset() {
    setForm({ title: "", year: "", duration: "", genreKey: "drama", desc: "", name: "" });
    setVideoFile(null); setPosterFile(null); setStatus("idle"); setProgress(0);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h2 style={{ fontFamily: "'Anton', sans-serif", color: "#ECE8DD", fontSize: "1.7rem", letterSpacing: "0.02em" }}>
        {isStaff ? t.up_title : t.com_title}
      </h2>
      <p className="text-sm mt-1 mb-6" style={{ color: "#8C8A96", fontFamily: "'Work Sans', sans-serif" }}>
        {isStaff ? t.up_sub : t.com_sub}
      </p>

      {status === "done" ? (
        <div className="rounded-md p-6 text-center" style={{ background: "#15151F", border: "1px solid #2A2A38" }}>
          <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-3" style={{ background: "#1E3028" }}>
            <Check size={20} style={{ color: "#7BB88A" }} />
          </div>
          <p style={{ color: "#ECE8DD", fontFamily: "'Work Sans', sans-serif", fontWeight: 600 }}>
            {isStaff ? t.done_title : t.done_title_com}
          </p>
          <p className="text-sm mt-1" style={{ color: "#8C8A96" }}>{form.title}</p>
          <button onClick={reset} className="mt-4 text-sm px-4 py-2 rounded-md" style={{ border: "1px solid #2A2A38", color: "#ECE8DD" }}>{t.add_another}</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: "#8C8A96" }}>{t.f_title}</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: "#1D1D29", border: "1px solid #2A2A38", color: "#ECE8DD" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: "#8C8A96" }}>{t.f_year}</label>
              <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2026"
                className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: "#1D1D29", border: "1px solid #2A2A38", color: "#ECE8DD" }} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "#8C8A96" }}>{t.f_duration}</label>
              <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="1h20"
                className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: "#1D1D29", border: "1px solid #2A2A38", color: "#ECE8DD" }} />
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: "#8C8A96" }}>{t.f_genre}</label>
            <select value={form.genreKey} onChange={(e) => setForm({ ...form, genreKey: e.target.value })}
              className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: "#1D1D29", border: "1px solid #2A2A38", color: "#ECE8DD" }}>
              {GENRE_KEYS.map((g) => <option key={g} value={g}>{t.genre[g]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: "#8C8A96" }}>{t.f_desc}</label>
            <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} rows={3} placeholder={t.f_desc_ph}
              className="w-full px-3 py-2 rounded-md text-sm outline-none resize-none" style={{ background: "#1D1D29", border: "1px solid #2A2A38", color: "#ECE8DD" }} />
          </div>
          {!isStaff && (
            <div>
              <label className="block text-xs mb-1" style={{ color: "#8C8A96" }}>{t.f_name}</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: "#1D1D29", border: "1px solid #2A2A38", color: "#ECE8DD" }} />
            </div>
          )}
          <div>
            <label className="block text-xs mb-1" style={{ color: "#8C8A96" }}>{t.f_poster}</label>
            <label className="flex flex-col items-center justify-center gap-2 py-6 rounded-md text-sm cursor-pointer" style={{ border: "1.5px dashed #2A2A38", color: "#8C8A96" }}>
              <ImageIcon size={20} style={{ color: "#C9A15A" }} />
              {posterFile ? posterFile.name : t.f_poster_ph}
              <input type="file" accept="image/*" className="hidden" onChange={handlePoster} />
            </label>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: "#8C8A96" }}>{t.f_video}</label>
            <label className="flex flex-col items-center justify-center gap-2 py-6 rounded-md text-sm cursor-pointer" style={{ border: "1.5px dashed #2A2A38", color: "#8C8A96" }}>
              <UploadCloud size={20} style={{ color: "#C9A15A" }} />
              {videoFile ? videoFile.name : t.f_video_ph}
              <input type="file" accept="video/*" className="hidden" onChange={handleFile} />
            </label>
          </div>
          {status === "uploading" && (
            <div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1D1D29" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "#C9A15A" }} />
              </div>
              <p className="text-[11px] mt-1" style={{ color: "#8C8A96" }}>{t.uploading} {Math.round(progress)}%</p>
            </div>
          )}
          {error && <p className="text-sm" style={{ color: "#D98080" }}>{error}</p>}
          <button type="submit" disabled={!canSubmit && status !== "uploading"} className="w-full py-2.5 rounded-md text-sm font-semibold disabled:opacity-40" style={{ background: "#C9A15A", color: "#0A0A10" }}>
            {status === "uploading" ? t.uploading : (isStaff ? t.submit : t.submit_com)}
          </button>
        </form>
      )}
    </div>
  );
}

function SettingsView({ t, settings, onSave }) {
  const [logoFile, setLogoFile] = useState(null);
  const [bgFile, setBgFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({ logoFile, bgFile });
    setSaving(false);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h2 style={{ fontFamily: "'Anton', sans-serif", color: "#ECE8DD", fontSize: "1.5rem", letterSpacing: "0.02em" }}>{t.settings_title}</h2>
      <div className="mt-6 space-y-5">
        <div>
          <label className="block text-xs mb-1" style={{ color: "#8C8A96" }}>{t.logo_label}</label>
          {settings.logo_url && <img src={settings.logo_url} alt="logo" className="h-10 mb-2 rounded" />}
          <label className="flex items-center gap-2 py-3 px-3 rounded-md text-sm cursor-pointer" style={{ border: "1.5px dashed #2A2A38", color: "#8C8A96" }}>
            <ImageIcon size={16} style={{ color: "#C9A15A" }} />
            {logoFile ? logoFile.name : "Chwazi imaj logo"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
          </label>
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: "#8C8A96" }}>{t.bg_label}</label>
          {settings.background_url && <img src={settings.background_url} alt="bg" className="h-20 w-full object-cover mb-2 rounded" />}
          <label className="flex items-center gap-2 py-3 px-3 rounded-md text-sm cursor-pointer" style={{ border: "1.5px dashed #2A2A38", color: "#8C8A96" }}>
            <ImageIcon size={16} style={{ color: "#C9A15A" }} />
            {bgFile ? bgFile.name : "Chwazi imaj fon"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setBgFile(e.target.files?.[0] || null)} />
          </label>
        </div>
        <button onClick={handleSave} disabled={saving} className="w-full py-2.5 rounded-md text-sm font-semibold disabled:opacity-40" style={{ background: "#C9A15A", color: "#0A0A10" }}>
          {saving ? "..." : t.save}
        </button>
      </div>
    </div>
  );
}

function PendingView({ t, lang, films, onApprove }) {
  const pending = films.filter((f) => f.status === "pending");
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h2 style={{ fontFamily: "'Anton', sans-serif", color: "#ECE8DD", fontSize: "1.5rem", letterSpacing: "0.02em" }}>{t.pending_title}</h2>
      <div className="mt-5 space-y-3">
        {pending.length === 0 && <p className="text-sm" style={{ color: "#8C8A96" }}>{t.no_pending}</p>}
        {pending.map((f) => (
          <div key={f.id} className="flex items-center justify-between p-3 rounded-md" style={{ background: "#15151F", border: "1px solid #2A2A38" }}>
            <div>
              <p style={{ color: "#ECE8DD", fontWeight: 600 }}>{f.title[lang]}</p>
              <p className="text-xs" style={{ color: "#8C8A96" }}>{t.genre[f.genreKey]} · {f.year}</p>
            </div>
            <button onClick={() => onApprove(f.id)} className="px-3 py-1.5 rounded-md text-xs font-semibold" style={{ background: "#C9A15A", color: "#0A0A10" }}>
              {t.approve}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HyperFilms() {
  const [view, setView] = useState("catalog");
  const [lang, setLang] = useState("fr");
  const [langOpen, setLangOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [films, setFilms] = useState(SEED_FILMS);
  const [openFilm, setOpenFilm] = useState(null);
  const [staffUser, setStaffUser] = useState(null);
  const [settings, setSettings] = useState({ logo_url: "", background_url: "" });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setStaffUser(data.user || null));
    supabase.from("films").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (!error && data && data.length > 0) setFilms(data.map(dbRowToFilm));
    });
    supabase.from("site_settings").select("*").eq("id", 1).single().then(({ data }) => {
      if (data) setSettings(data);
    });
  }, []);

  async function insertFilm(newFilm, status) {
    let poster_url = null;
    if (newFilm.posterFile) {
      const path = `posters/${Date.now()}-${newFilm.posterFile.name}`;
      const { error: upErr } = await supabase.storage.from("site-assets").upload(path, newFilm.posterFile, { upsert: true });
      if (!upErr) poster_url = supabase.storage.from("site-assets").getPublicUrl(path).data.publicUrl;
    }
    const { data, error } = await supabase.from("films").insert({
      title_ht: newFilm.title.ht, title_fr: newFilm.title.fr, title_en: newFilm.title.en,
      desc_ht: newFilm.desc.ht, desc_fr: newFilm.desc.fr, desc_en: newFilm.desc.en,
      genre_key: newFilm.genreKey, year: parseInt(newFilm.year, 10) || null, duration: newFilm.duration,
      status, submitted_name: newFilm.submittedName || null, created_by: staffUser?.id || null,
      poster_url, video_url: newFilm.videoUrl || null,
    }).select();
    if (!error && data && data[0]) setFilms((prev) => [dbRowToFilm(data[0]), ...prev]);
  }

  async function handleApprove(id) {
    const { error } = await supabase.from("films").update({ status: "approved" }).eq("id", id);
    if (!error) setFilms((prev) => prev.map((f) => (f.id === id ? { ...f, status: "approved" } : f)));
  }

  async function handleSaveSettings({ logoFile, bgFile }) {
    const updates = {};
    if (logoFile) {
      const path = `logo-${Date.now()}-${logoFile.name}`;
      const { error } = await supabase.storage.from("site-assets").upload(path, logoFile, { upsert: true });
      if (!error) updates.logo_url = supabase.storage.from("site-assets").getPublicUrl(path).data.publicUrl;
    }
    if (bgFile) {
      const path = `bg-${Date.now()}-${bgFile.name}`;
      const { error } = await supabase.storage.from("site-assets").upload(path, bgFile, { upsert: true });
      if (!error) updates.background_url = supabase.storage.from("site-assets").getPublicUrl(path).data.publicUrl;
    }
    if (Object.keys(updates).length > 0) {
      await supabase.from("site_settings").update(updates).eq("id", 1);
      setSettings((prev) => ({ ...prev, ...updates }));
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setStaffUser(null);
    setView("catalog");
  }

  function scrollToGenre(genreKey) {
    setView("catalog");
    setQuery("");
    setTimeout(() => {
      document.getElementById(`genre-row-${genreKey}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  const t = T[lang];
  const approvedFilms = films.filter((f) => f.status === "approved");
  const featured = approvedFilms.find((f) => f.featured) || approvedFilms[0];

  const searchResults = useMemo(() => {
    if (!query) return null;
    return approvedFilms.filter((f) => f.title[lang].toLowerCase().includes(query.toLowerCase()));
  }, [approvedFilms, query, lang]);

  return (
    <div className="min-h-screen" style={{ background: "#0A0A10" }}>
      <style>{FONT_IMPORT}</style>

      {/* Ticker */}
      <Ticker />

      {/* Nav */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-5 py-3 gap-3" style={{ background: "rgba(10,10,16,0.92)", backdropFilter: "blur(6px)", borderBottom: "1px solid #2A2A38" }}>
        <button onClick={() => setView("catalog")} className="flex items-center gap-2 shrink-0">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt="logo" className="h-7" />
          ) : (
            <>
              <Film size={18} style={{ color: "#C9A15A" }} />
              <span style={{ fontFamily: "'Anton', sans-serif", color: "#ECE8DD", letterSpacing: "0.04em", fontSize: "1.1rem" }}>CITADEL CINÉ</span>
            </>
          )}
        </button>

        <div className="hidden sm:flex items-center flex-1 max-w-xs px-3 py-1.5 rounded-md" style={{ background: "#15151F", border: "1px solid #2A2A38" }}>
          <Search size={14} style={{ color: "#8C8A96" }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search_ph}
            className="bg-transparent outline-none ml-2 text-sm w-full" style={{ color: "#ECE8DD" }} />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => setView("community")} className="hidden sm:flex px-3 py-1.5 rounded-md text-sm items-center gap-1.5"
            style={{ color: view === "community" ? "#0A0A10" : "#ECE8DD", background: view === "community" ? "#C9A15A" : "transparent" }}>
            <UploadCloud size={14} /> {t.nav_community}
          </button>

          <WhatsAppButton t={t} />

          <div className="relative">
            <button onClick={() => setLangOpen((o) => !o)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm" style={{ color: "#ECE8DD", border: "1px solid #2A2A38" }}>
              <Globe size={14} style={{ color: "#C9A15A" }} />
              <span className="hidden sm:inline">{LANGS.find((l) => l.code === lang).label}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-1 rounded-md overflow-hidden z-50" style={{ background: "#15151F", border: "1px solid #2A2A38" }}>
                {LANGS.map((l) => (
                  <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }} className="block w-full text-left px-3.5 py-2 text-sm whitespace-nowrap" style={{ color: l.code === lang ? "#C9A15A" : "#ECE8DD" }}>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => setStaffOpen((o) => !o)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm" style={{ color: "#ECE8DD", border: "1px solid #2A2A38" }}>
              <ShieldCheck size={14} style={{ color: "#C9A15A" }} />
            </button>
            {staffOpen && (
              <div className="absolute right-0 mt-1 rounded-md overflow-hidden z-50" style={{ background: "#15151F", border: "1px solid #2A2A38" }}>
                {staffUser ? (
                  <>
                    <button onClick={() => { setView("upload"); setStaffOpen(false); }} className="block w-full text-left px-3.5 py-2 text-sm whitespace-nowrap" style={{ color: "#ECE8DD" }}>{t.nav_staff}: {t.submit}</button>
                    <button onClick={() => { setView("pending"); setStaffOpen(false); }} className="block w-full text-left px-3.5 py-2 text-sm whitespace-nowrap" style={{ color: "#ECE8DD" }}>{t.pending_title}</button>
                    <button onClick={() => { setView("settings"); setStaffOpen(false); }} className="block w-full text-left px-3.5 py-2 text-sm whitespace-nowrap" style={{ color: "#ECE8DD" }}>{t.nav_settings}</button>
                    <button onClick={handleLogout} className="flex items-center gap-1.5 w-full text-left px-3.5 py-2 text-sm whitespace-nowrap" style={{ color: "#8C8A96" }}><LogOut size={13} /> Logout</button>
                  </>
                ) : (
                  <button onClick={() => { setView("upload"); setStaffOpen(false); }} className="block w-full text-left px-3.5 py-2 text-sm whitespace-nowrap" style={{ color: "#ECE8DD" }}>{t.login_staff}</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {(view === "catalog") && <GenreNav t={t} onSelect={scrollToGenre} />}

      {view === "upload" ? (
        staffUser ? <UploadForm lang={lang} t={t} isStaff={true} onSubmitFilm={(f) => insertFilm(f, "approved")} /> : <LoginGate lang={lang} onLoggedIn={setStaffUser} />
      ) : view === "community" ? (
        <UploadForm lang={lang} t={t} isStaff={false} onSubmitFilm={(f) => insertFilm(f, "pending")} />
      ) : view === "settings" && staffUser ? (
        <SettingsView t={t} settings={settings} onSave={handleSaveSettings} />
      ) : view === "pending" && staffUser ? (
        <PendingView t={t} lang={lang} films={films} onApprove={handleApprove} />
      ) : (
        <>
          {/* Hero */}
          {featured && (
            <div className="relative flex items-end px-6 sm:px-10 py-16 sm:py-28"
              style={{
                background: settings.background_url
                  ? `linear-gradient(to top, #0A0A10 5%, rgba(10,10,16,0.5) 60%, rgba(10,10,16,0.2)), url(${settings.background_url}) center/cover`
                  : featured.posterUrl
                  ? `linear-gradient(to top, #0A0A10 5%, rgba(10,10,16,0.5) 60%, rgba(10,10,16,0.2)), url(${featured.posterUrl}) center/cover`
                  : `linear-gradient(120deg, ${featured.color}, #0A0A10 75%)`,
                borderBottom: "1px solid #2A2A38",
              }}>
              <div className="max-w-lg">
                <span className="text-[11px] tracking-widest uppercase" style={{ color: "#C9A15A" }}>{t.featured}</span>
                <h1 className="mt-2" style={{ fontFamily: "'Anton', sans-serif", color: "#ECE8DD", fontSize: "clamp(1.8rem, 5vw, 3rem)", lineHeight: 1.05 }}>
                  {featured.title[lang].toUpperCase()}
                </h1>
                <p className="mt-3 text-sm leading-relaxed max-w-md" style={{ color: "#B8B5C0", fontFamily: "'Work Sans', sans-serif" }}>{featured.desc[lang]}</p>
                <div className="flex gap-2 mt-5">
                  <button onClick={() => setOpenFilm(featured)} className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold" style={{ background: "#C9A15A", color: "#0A0A10" }}>
                    <Play size={15} fill="#0A0A10" /> {t.watch}
                  </button>
                </div>
              </div>
            </div>
          )}

          {searchResults ? (
            <div className="px-5 sm:px-10 py-6 flex flex-wrap gap-4">
              {searchResults.map((f) => <FilmCard key={f.id} film={f} lang={lang} t={t} onOpen={setOpenFilm} />)}
              {searchResults.length === 0 && <p className="text-sm py-10" style={{ color: "#8C8A96" }}>{t.empty}</p>}
            </div>
          ) : (
            <div className="py-4 pb-16">
              {GENRE_KEYS.map((g) => <Row key={g} genreKey={g} films={approvedFilms} lang={lang} t={t} onOpen={setOpenFilm} />)}
            </div>
          )}
        </>
      )}

      <DetailModal film={openFilm} lang={lang} t={t} onClose={() => setOpenFilm(null)} />
    </div>
  );
}
