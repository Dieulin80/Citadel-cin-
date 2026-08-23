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
  const [playing, setPlaying] = useState(false);
  if (!film) return null;

  // Ekstrè videoId nan lyen playback la (egzanp: https://cdn/{videoId}/play_720p.mp4)
  const videoId = film.videoUrl ? film.videoUrl.split("/").slice(-2, -1)[0] : null;
  const embedUrl = videoId ? `https://iframe.mediadelivery.net/embed/732337/${videoId}?autoplay=true` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(6,6,10,0.85)" }} onClick={() => { onClose(); setPlaying(false); }}>
      <div className="w-full max-w-lg rounded-lg overflow-hidden" style={{ background: "#15151F", border: "1px solid #2A2A38" }} onClick={(e) => e.stopPropagation()}>
        {playing && embedUrl ? (
          <div className="relative w-full" style={{ aspectRatio: "16/9", background: "#000" }}>
            <iframe
              src={embedUrl}
              loading="lazy"
              style={{ border: 0, width: "100%", height: "100%" }}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
            />
            <button onClick={() => setPlaying(false)} className="absolute top-2 right-2 p-1.5 rounded-full" style={{ background: "rgba(10,10,16,0.7)", color: "#ECE8DD" }}>
              <X size={16} />
            </button>
          </div>
        ) : (
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
        )}
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
            <button
              onClick={() => embedUrl && setPlaying(true)}
              disabled={!embedUrl}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold disabled:opacity-40"
              style={{ background: "#C9A15A", color: "#0A0A10" }}
            >
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
  
