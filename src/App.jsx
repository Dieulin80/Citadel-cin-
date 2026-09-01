import React, { useState, useRef, useMemo, useEffect } from "react";
import * as tus from "tus-js-client";
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
    coming_soon: "K AP VINI", interested: "Enterese", interested_count: "moun enterese",
    my_list: "Ma Lis", add_list: "Ajoute nan Lis mwen", remove_list: "Retire nan Lis mwen",
    continue_watching: "Kontinye Gade", top10: "Top 10 Semèn nan", similar: "Fim Similè",
    rate_this: "Bay yon nòt", your_rating: "Nòt ou", release_label: "Sòti",
    f_release: "Dat Sòti (opsyonèl — pou 'K ap Vini')", search_expand: "Chèche",
    offline_download: "Telechaje pou Gade Offline", offline_ready: "Disponib Offline ✓", offline_downloading: "K ap telechaje pou offline...",
    nav_offline: "Videyo Offline", no_offline: "Ou poko telechaje okenn videyo pou gade san entènèt.",
    f_series_title: "Tit Seri a", f_season: "Sezon #", f_episode: "Episòd #", episodes_label: "Episòd",
    manage_films: "Jere Fim", change_poster: "Chanje Poster", poster_updated: "Poster mete ajou!",
    stats_title: "ESTATISTIK SIT LA", total_views: "Total vizit paj", unique_visitors: "Moun diferan ki vizite",
    top_films_views: "Fim ki pi gade yo", refresh: "Rafrechi",
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
    coming_soon: "BIENTÔT DISPONIBLE", interested: "Intéressé(e)", interested_count: "personnes intéressées",
    my_list: "Ma Liste", add_list: "Ajouter à Ma Liste", remove_list: "Retirer de Ma Liste",
    continue_watching: "Continuer à regarder", top10: "Top 10 de la semaine", similar: "Films similaires",
    rate_this: "Donner une note", your_rating: "Votre note", release_label: "Sortie",
    f_release: "Date de sortie (optionnel — pour 'Bientôt disponible')", search_expand: "Rechercher",
    offline_download: "Télécharger pour regarder hors-ligne", offline_ready: "Disponible hors-ligne ✓", offline_downloading: "Téléchargement hors-ligne en cours...",
    nav_offline: "Vidéos hors-ligne", no_offline: "Vous n'avez encore téléchargé aucune vidéo hors-ligne.",
    f_series_title: "Titre de la série", f_season: "Saison n°", f_episode: "Épisode n°", episodes_label: "Épisodes",
    manage_films: "Gérer les Films", change_poster: "Changer l'affiche", poster_updated: "Affiche mise à jour !",
    stats_title: "STATISTIQUES DU SITE", total_views: "Total de vues", unique_visitors: "Visiteurs uniques",
    top_films_views: "Films les plus regardés", refresh: "Actualiser",
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
    coming_soon: "COMING SOON", interested: "Interested", interested_count: "people interested",
    my_list: "My List", add_list: "Add to My List", remove_list: "Remove from My List",
    continue_watching: "Continue Watching", top10: "Top 10 This Week", similar: "Similar Films",
    rate_this: "Rate this", your_rating: "Your rating", release_label: "Release",
    f_release: "Release date (optional — for 'Coming Soon')", search_expand: "Search",
    offline_download: "Download to Watch Offline", offline_ready: "Available Offline ✓", offline_downloading: "Downloading for offline...",
    nav_offline: "Offline Videos", no_offline: "You haven't downloaded any videos for offline viewing yet.",
    f_series_title: "Series Title", f_season: "Season #", f_episode: "Episode #", episodes_label: "Episodes",
    manage_films: "Manage Films", change_poster: "Change Poster", poster_updated: "Poster updated!",
    stats_title: "SITE STATISTICS", total_views: "Total page views", unique_visitors: "Unique visitors",
    top_films_views: "Most watched films", refresh: "Refresh",
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
    releaseDate: row.release_date || null,
    seriesTitle: row.series_title || null,
    seasonNumber: row.season_number || null,
    episodeNumber: row.episode_number || null,
    reactionCount: row.reaction_count || 0,
    ratingSum: row.rating_sum || 0,
    ratingCount: row.rating_count || 0,
    viewCount: row.view_count || 0,
    title: { ht: row.title_ht, fr: row.title_fr, en: row.title_en },
    desc: { ht: row.desc_ht, fr: row.desc_fr, en: row.desc_en },
  };
}

function isUpcoming(film) {
  if (!film.releaseDate) return false;
  return new Date(film.releaseDate) > new Date();
}

// ---- "Ma Liste" ak "Kontinye Gade" — estoke lokalman sou telefòn/navigatè a ----
function getLocalList(key) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function setLocalList(key, list) {
  try { localStorage.setItem(key, JSON.stringify(list)); } catch {}
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

function StarRating({ film, size = 16, onRate }) {
  const [hover, setHover] = useState(0);
  const avg = film.ratingCount > 0 ? film.ratingSum / film.ratingCount : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onRate && onRate(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            style={{ color: (hover || Math.round(avg)) >= n ? "#C9A15A" : "#3A3A45", lineHeight: 0 }}
          >
            ★
          </button>
        ))}
      </div>
      {film.ratingCount > 0 && <span className="text-[11px]" style={{ color: "#8C8A96" }}>{avg.toFixed(1)} ({film.ratingCount})</span>}
    </div>
  );
}

function MyListButton({ filmId, myList, setMyList }) {
  const inList = myList.includes(filmId);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        const next = inList ? myList.filter((id) => id !== filmId) : [...myList, filmId];
        setMyList(next);
        setLocalList("hf_my_list", next);
      }}
      className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-sm z-10"
      style={{ background: "rgba(10,10,16,0.7)", color: inList ? "#C9A15A" : "#ECE8DD" }}
    >
      {inList ? "✓" : "+"}
    </button>
  );
}

function ComingSoonCard({ film, lang, t }) {
  const [reacted, setReacted] = useState(() => getLocalList("hf_reacted").includes(film.id));
  const [count, setCount] = useState(film.reactionCount);

  async function handleReact() {
    if (reacted) return;
    setReacted(true);
    setCount((c) => c + 1);
    const list = getLocalList("hf_reacted");
    setLocalList("hf_reacted", [...list, film.id]);
    await supabase.rpc("increment_film_counter", { p_film_id: film.id, p_field: "reaction_count", p_amount: 1 });
  }

  const dateLabel = film.releaseDate ? new Date(film.releaseDate).toLocaleDateString(lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "fr-HT") : "";

  return (
    <div className="shrink-0 w-[160px] rounded-md overflow-hidden" style={{ background: "#15151F" }}>
      <div
        className="aspect-[2/3] w-full"
        style={
          film.posterUrl
            ? { backgroundImage: `linear-gradient(to top, rgba(10,10,16,0.9), rgba(10,10,16,0.1)), url(${film.posterUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: `linear-gradient(160deg, ${film.color}, #0A0A10)` }
        }
      />
      <div className="p-2.5">
        <p className="text-sm leading-tight truncate" style={{ color: "#ECE8DD", fontFamily: "'Work Sans', sans-serif", fontWeight: 600 }}>{film.title[lang]}</p>
        <p className="text-[11px] mt-0.5" style={{ color: "#C9A15A" }}>{t.release_label}: {dateLabel}</p>
        <button
          onClick={handleReact}
          disabled={reacted}
          className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold disabled:opacity-70"
          style={{ background: reacted ? "#1D1D29" : "#C9A15A", color: reacted ? "#C9A15A" : "#0A0A10", border: reacted ? "1px solid #C9A15A" : "none" }}
        >
          🔥 {reacted ? t.interested : t.interested}
        </button>
        <p className="text-[10px] mt-1 text-center" style={{ color: "#8C8A96" }}>{count} {t.interested_count}</p>
      </div>
    </div>
  );
}

function ComingSoonRow({ films, lang, t }) {
  const upcoming = films.filter(isUpcoming).sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
  if (upcoming.length === 0) return null;
  return (
    <div className="py-3">
      <h2 className="px-5 sm:px-10 mb-2 text-sm font-semibold" style={{ color: "#ECE8DD", fontFamily: "'Work Sans', sans-serif" }}>{t.coming_soon}</h2>
      <div className="flex gap-3 px-5 sm:px-10 overflow-x-auto pb-2">
        {upcoming.map((f) => <ComingSoonCard key={f.id} film={f} lang={lang} t={t} />)}
      </div>
    </div>
  );
}

function FilmCard({ film, lang, t, onOpen, myList, setMyList }) {
  const avg = film.ratingCount > 0 ? (film.ratingSum / film.ratingCount).toFixed(1) : null;
  return (
    <button
      onClick={() => onOpen(film)}
      className="group relative text-left rounded-md overflow-hidden shrink-0 w-[140px] sm:w-[160px] focus:outline-none"
      style={{ backgroundColor: "#15151F" }}
    >
      {myList && setMyList && <MyListButton filmId={film.id} myList={myList} setMyList={setMyList} />}
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
      {avg && (
        <div className="absolute bottom-[52px] left-2 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ background: "rgba(10,10,16,0.7)", color: "#C9A15A" }}>
          ★ {avg}
        </div>
      )}
      <div className="p-2">
        <p className="text-sm leading-tight truncate" style={{ color: "#ECE8DD", fontFamily: "'Work Sans', sans-serif", fontWeight: 600 }}>
          {film.title[lang]}
        </p>
      </div>
    </button>
  );
}

function Row({ genreKey, films, lang, t, onOpen, myList, setMyList }) {
  const list = films.filter((f) => f.genreKey === genreKey);
  if (list.length === 0) return null;
  return (
    <div className="py-3 scroll-mt-24" id={`genre-row-${genreKey}`}>
      <h2 className="px-5 sm:px-10 mb-2 text-sm font-semibold" style={{ color: "#ECE8DD", fontFamily: "'Work Sans', sans-serif" }}>
        {t.genre[genreKey]}
      </h2>
      <div className="flex gap-3 px-5 sm:px-10 overflow-x-auto pb-2">
        {list.map((f) => <FilmCard key={f.id} film={f} lang={lang} t={t} onOpen={onOpen} myList={myList} setMyList={setMyList} />)}
      </div>
    </div>
  );
}

function SimpleRow({ title, list, lang, t, onOpen, myList, setMyList }) {
  if (list.length === 0) return null;
  return (
    <div className="py-3">
      <h2 className="px-5 sm:px-10 mb-2 text-sm font-semibold" style={{ color: "#ECE8DD", fontFamily: "'Work Sans', sans-serif" }}>{title}</h2>
      <div className="flex gap-3 px-5 sm:px-10 overflow-x-auto pb-2">
        {list.map((f) => <FilmCard key={f.id} film={f} lang={lang} t={t} onOpen={onOpen} myList={myList} setMyList={setMyList} />)}
      </div>
    </div>
  );
}

function DetailModal({ film, lang, t, onClose, allFilms, myList, setMyList, onOpen }) {
  const [playing, setPlaying] = useState(false);
  const [myRating, setMyRating] = useState(() => getLocalList("hf_rated").find((r) => r.id === film?.id)?.stars || 0);
  const [offlineStatus, setOfflineStatus] = useState("idle"); // idle | downloading | ready
  const [downloadProgress, setDownloadProgress] = useState(0);
  const viewedRef = useRef(null);

  useEffect(() => {
    if (film && getLocalList("hf_offline").includes(film.id)) setOfflineStatus("ready");
    else setOfflineStatus("idle");
  }, [film]);

  async function findWorkingVideoUrl() {
    // film.videoUrl gen fòm: https://{cdn}/{videoId}/play_720p.mp4
    const match = film.videoUrl.match(/^(https:\/\/[^/]+\/[^/]+\/)play_\d+p\.mp4$/);
    if (!match) return film.videoUrl;
    const base = match[1];
    const resolutions = ["1080p", "720p", "480p", "360p", "240p"];
    for (const res of resolutions) {
      const candidate = `${base}play_${res}.mp4`;
      try {
        const head = await fetch(candidate, { method: "HEAD" });
        if (head.ok) return candidate;
      } catch {
        // kontinye eseye pwochen rezolisyon an
      }
    }
    return film.videoUrl;
  }

  async function handleOfflineDownload() {
    if (!film.videoUrl) return;
    setOfflineStatus("downloading");
    setDownloadProgress(0);
    try {
      const workingUrl = await findWorkingVideoUrl();
      const res = await fetch(workingUrl);
      if (!res.ok || !res.body) throw new Error("Echèk telechajman");

      const contentLength = res.headers.get("Content-Length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      const reader = res.body.getReader();
      const chunks = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total) setDownloadProgress(Math.round((received / total) * 100));
      }

      const blob = new Blob(chunks);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${film.title[lang].replace(/[^a-z0-9]/gi, "_")}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      const list = getLocalList("hf_offline");
      setLocalList("hf_offline", [...new Set([...list, film.id])]);
      setOfflineStatus("ready");
    } catch {
      setOfflineStatus("idle");
      window.open(film.videoUrl, "_blank");
    }
  }

  useEffect(() => {
    if (film && viewedRef.current !== film.id) {
      viewedRef.current = film.id;
      supabase.rpc("increment_film_counter", { p_film_id: film.id, p_field: "view_count", p_amount: 1 });
      const list = getLocalList("hf_recent").filter((id) => id !== film.id);
      setLocalList("hf_recent", [film.id, ...list].slice(0, 12));
    }
  }, [film]);

  if (!film) return null;

  // Ekstrè videoId nan lyen playback la (egzanp: https://cdn/{videoId}/play_720p.mp4)
  const videoId = film.videoUrl ? film.videoUrl.split("/").slice(-2, -1)[0] : null;
  const embedUrl = videoId ? `https://iframe.mediadelivery.net/embed/732337/${videoId}?autoplay=true` : null;

  async function handleRate(stars) {
    const already = getLocalList("hf_rated");
    if (already.find((r) => r.id === film.id)) return;
    setMyRating(stars);
    setLocalList("hf_rated", [...already, { id: film.id, stars }]);
    await supabase.rpc("add_film_rating", { p_film_id: film.id, p_stars: stars });
  }

  const isSeries = film.genreKey === "serie" && film.seriesTitle;
  const episodes = isSeries
    ? (allFilms || [])
        .filter((f) => f.seriesTitle === film.seriesTitle && f.status === "approved")
        .sort((a, b) => (a.seasonNumber || 0) - (b.seasonNumber || 0) || (a.episodeNumber || 0) - (b.episodeNumber || 0))
    : [];
  const similar = isSeries ? [] : (allFilms || []).filter((f) => f.genreKey === film.genreKey && f.id !== film.id && f.status === "approved" && !isUpcoming(f)).slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: "rgba(6,6,10,0.85)" }} onClick={() => { onClose(); setPlaying(false); }}>
      <div className="w-full max-w-lg rounded-lg overflow-hidden my-8" style={{ background: "#15151F", border: "1px solid #2A2A38" }} onClick={(e) => e.stopPropagation()}>
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
            {myList && setMyList && <MyListButton filmId={film.id} myList={myList} setMyList={setMyList} />}
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

          <div className="mt-3">
            <p className="text-[11px] mb-1" style={{ color: "#8C8A96" }}>{myRating ? t.your_rating : t.rate_this}</p>
            <StarRating film={film} onRate={myRating ? undefined : handleRate} />
          </div>

          <div className="flex gap-2 mt-4">
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
            <div className="mt-2">
              <button
                onClick={handleOfflineDownload}
                disabled={offlineStatus !== "idle"}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-sm disabled:opacity-90"
                style={{ border: "1px solid #2A2A38", color: offlineStatus === "ready" ? "#7BB88A" : "#C9A15A" }}
              >
                {offlineStatus === "ready" ? t.offline_ready : offlineStatus === "downloading" ? `${t.offline_downloading} ${downloadProgress}%` : t.offline_download}
              </button>
              {offlineStatus === "downloading" && (
                <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: "#1D1D29" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${downloadProgress}%`, background: "#C9A15A" }} />
                </div>
              )}
            </div>
          )}
        </div>

        {episodes.length > 0 && (
          <div className="pb-5">
            <h4 className="px-5 mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "#8C8A96" }}>{t.episodes_label}</h4>
            <div className="px-5 space-y-1.5 max-h-56 overflow-y-auto">
              {episodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => onOpen(ep)}
                  className="flex items-center justify-between w-full text-left px-3 py-2 rounded-md text-sm"
                  style={{ background: ep.id === film.id ? "#1D1D29" : "transparent", color: ep.id === film.id ? "#C9A15A" : "#ECE8DD", border: "1px solid #2A2A38" }}
                >
                  <span>S{ep.seasonNumber || "?"}E{ep.episodeNumber || "?"} — {ep.title[lang]}</span>
                  {ep.id === film.id && <Play size={13} />}
                </button>
              ))}
            </div>
          </div>
        )}
        {similar.length > 0 && (
          <div className="pb-5">
            <h4 className="px-5 mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "#8C8A96" }}>{t.similar}</h4>
            <div className="flex gap-3 px-5 overflow-x-auto pb-1">
              {similar.map((f) => <FilmCard key={f.id} film={f} lang={lang} t={t} onOpen={onOpen} myList={myList} setMyList={setMyList} />)}
            </div>
          </div>
        )}
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

function UploadForm({ lang, t, isStaff, onQueueUpload, existingSeries }) {
  const [form, setForm] = useState({ title: "", year: "", duration: "", genreKey: "drama", desc: "", name: "", releaseDate: "", seriesTitle: "", seasonNumber: "", episodeNumber: "" });
  const [seriesMode, setSeriesMode] = useState("new"); // "new" | an existing series title
  const [videoFiles, setVideoFiles] = useState([]); // toujou yon lis, menm pou yon sèl fim
  const [posterFile, setPosterFile] = useState(null);
  const [error, setError] = useState("");
  const [justQueued, setJustQueued] = useState(false);
  const isSerie = form.genreKey === "serie";
  const canSubmit = form.title && form.year && videoFiles.length > 0;

  function naturalSort(a, b) {
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
  }

  function handleFile(e) {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      const ordered = isSerie ? [...files].sort(naturalSort) : files;
      setVideoFiles(isSerie ? ordered : [ordered[0]]);
    }
  }
  function handlePoster(e) { const f = e.target.files?.[0]; if (f) setPosterFile(f); }

  function handleSubmit(e) {
    e.preventDefault();
    if (videoFiles.length === 0) { setError(t.err_file); return; }
    setError("");
    // Kòmanse telechajman an "an background" — pa tann li fini
    onQueueUpload({ ...form, isStaff, isSerie }, videoFiles, posterFile);
    reset();
    setJustQueued(true);
    setTimeout(() => setJustQueued(false), 4000);
  }

  function reset() {
    if (seriesMode !== "new" && existingSeries && existingSeries[seriesMode]) {
      const seasons = existingSeries[seriesMode];
      const lastSeason = Math.max(...Object.keys(seasons).map(Number));
      const nextEpisode = (seasons[lastSeason] || 0) + 1;
      setForm({ title: seriesMode, year: "", duration: "", genreKey: "serie", desc: "", name: "", releaseDate: "", seriesTitle: seriesMode, seasonNumber: String(lastSeason), episodeNumber: String(nextEpisode) });
    } else {
      setForm({ title: "", year: "", duration: "", genreKey: "drama", desc: "", name: "", releaseDate: "", seriesTitle: "", seasonNumber: "", episodeNumber: "" });
    }
    setVideoFiles([]); setPosterFile(null); setError("");
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h2 style={{ fontFamily: "'Anton', sans-serif", color: "#ECE8DD", fontSize: "1.7rem", letterSpacing: "0.02em" }}>
        {isStaff ? t.up_title : t.com_title}
      </h2>
      <p className="text-sm mt-1 mb-6" style={{ color: "#8C8A96", fontFamily: "'Work Sans', sans-serif" }}>
        {isStaff ? t.up_sub : t.com_sub}
      </p>

      {justQueued && (
        <div className="rounded-md p-4 mb-4 flex items-center gap-2" style={{ background: "#1E3028", border: "1px solid #2E4A38" }}>
          <Check size={16} style={{ color: "#7BB88A" }} />
          <p className="text-sm" style={{ color: "#ECE8DD" }}>Telechajman kòmanse an background — swiv pwogrè a nan ti bare anba ekran an. Ou ka poste yon lòt videyo kounye a.</p>
        </div>
      )}
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
          {form.genreKey === "serie" && (
            <>
              {Object.keys(existingSeries || {}).length > 0 && (
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#8C8A96" }}>Seri</label>
                  <select
                    value={seriesMode}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSeriesMode(val);
                      if (val === "new") {
                        setForm({ ...form, seriesTitle: "", seasonNumber: "", episodeNumber: "" });
                      } else {
                        const seasons = existingSeries[val];
                        const lastSeason = Math.max(...Object.keys(seasons).map(Number));
                        const nextEpisode = (seasons[lastSeason] || 0) + 1;
                        setForm({ ...form, title: val, seriesTitle: val, seasonNumber: String(lastSeason), episodeNumber: String(nextEpisode) });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-md text-sm outline-none"
                    style={{ background: "#1D1D29", border: "1px solid #2A2A38", color: "#ECE8DD" }}
                  >
                    <option value="new">— Nouvo Seri —</option>
                    {Object.keys(existingSeries).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs mb-1" style={{ color: "#8C8A96" }}>{t.f_series_title}</label>
                <input value={form.seriesTitle} disabled={seriesMode !== "new"} onChange={(e) => setForm({ ...form, seriesTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-md text-sm outline-none disabled:opacity-60" style={{ background: "#1D1D29", border: "1px solid #2A2A38", color: "#ECE8DD" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#8C8A96" }}>{t.f_season}</label>
                  <input type="number" min="1" value={form.seasonNumber} onChange={(e) => setForm({ ...form, seasonNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: "#1D1D29", border: "1px solid #2A2A38", color: "#ECE8DD" }} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#8C8A96" }}>{t.f_episode}</label>
                  <input type="number" min="1" value={form.episodeNumber} onChange={(e) => setForm({ ...form, episodeNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: "#1D1D29", border: "1px solid #2A2A38", color: "#ECE8DD" }} />
                </div>
              </div>
              {seriesMode !== "new" && (
                <p className="text-[11px]" style={{ color: "#8C8A96" }}>Sezon ak nimewo episòd yo ranpli otomatikman ak pwochen episòd ki disponib — ou ka toujou chanje yo manyèlman.</p>
              )}
            </>
          )}
          <div>
            <label className="block text-xs mb-1" style={{ color: "#8C8A96" }}>{t.f_release}</label>
            <input type="date" value={form.releaseDate} onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
              className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ background: "#1D1D29", border: "1px solid #2A2A38", color: "#ECE8DD" }} />
          </div>
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
              {videoFiles.length > 0
                ? (isSerie ? `${videoFiles.length} fichye chwazi (Episòd ${form.episodeNumber || 1} → ${(parseInt(form.episodeNumber, 10) || 1) + videoFiles.length - 1})` : videoFiles[0].name)
                : t.f_video_ph}
              <input type="file" accept="video/*" multiple={isSerie} className="hidden" onChange={handleFile} />
            </label>
            {isSerie && <p className="text-[11px] mt-1" style={{ color: "#8C8A96" }}>Chwazi plizyè fichye an menm tan pou yo vin episòd youn apre lòt, kòmanse ak nimewo "{t.f_episode}" anwo a. Yo klase otomatikman selon non fichye a — verifye lòd la anba a.</p>}
            {isSerie && videoFiles.length > 1 && (
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {videoFiles.map((f, idx) => (
                  <div key={f.name + idx} className="flex items-center justify-between px-2.5 py-1.5 rounded text-xs" style={{ background: "#1D1D29", color: "#ECE8DD" }}>
                    <span className="truncate pr-2">Ep {(parseInt(form.episodeNumber, 10) || 1) + idx} — {f.name}</span>
                    <span className="flex gap-1 shrink-0">
                      <button type="button" onClick={() => {
                        if (idx === 0) return;
                        const arr = [...videoFiles];
                        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                        setVideoFiles(arr);
                      }} style={{ color: "#8C8A96" }}>↑</button>
                      <button type="button" onClick={() => {
                        if (idx === videoFiles.length - 1) return;
                        const arr = [...videoFiles];
                        [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
                        setVideoFiles(arr);
                      }} style={{ color: "#8C8A96" }}>↓</button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {error && <p className="text-sm" style={{ color: "#D98080" }}>{error}</p>}
          <button type="submit" disabled={!canSubmit} className="w-full py-2.5 rounded-md text-sm font-semibold disabled:opacity-40" style={{ background: "#C9A15A", color: "#0A0A10" }}>
            {isStaff ? t.submit : t.submit_com}
          </button>
      </form>
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

function ManageFilmRow({ film, lang, t, onUpdatePoster }) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [rowError, setRowError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setDone(false);
    setRowError("");
    const result = await onUpdatePoster(film.id, file);
    setSaving(false);
    if (result && result.ok) {
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } else {
      setRowError((result && result.error) || "Echèk telechajman");
    }
  }

  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-md" style={{ background: "#15151F", border: "1px solid #2A2A38" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-14 rounded shrink-0"
            style={
              film.posterUrl
                ? { backgroundImage: `url(${film.posterUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                : { background: film.color }
            }
          />
          <div>
            <p style={{ color: "#ECE8DD", fontWeight: 600 }}>{film.title[lang]}</p>
            <p className="text-xs" style={{ color: "#8C8A96" }}>{t.genre[film.genreKey]} · {film.year} · {film.status}</p>
          </div>
        </div>
        <label className="px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer shrink-0" style={{ background: done ? "#1E3028" : "#C9A15A", color: done ? "#7BB88A" : "#0A0A10" }}>
          {saving ? "..." : done ? t.poster_updated : t.change_poster}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={saving} />
        </label>
      </div>
      {rowError && <p className="text-xs" style={{ color: "#D98080" }}>{rowError}</p>}
    </div>
  );
}

function ManageFilmsView({ t, lang, films, onUpdatePoster }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h2 style={{ fontFamily: "'Anton', sans-serif", color: "#ECE8DD", fontSize: "1.5rem", letterSpacing: "0.02em" }}>{t.manage_films}</h2>
      <div className="mt-5 space-y-3">
        {films.map((f) => <ManageFilmRow key={f.id} film={f} lang={lang} t={t} onUpdatePoster={onUpdatePoster} />)}
      </div>
    </div>
  );
}

function StatsView({ t, lang, films, siteStats, onRefresh }) {
  const topFilms = [...films]
    .filter((f) => f.status === "approved")
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 10);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <h2 style={{ fontFamily: "'Anton', sans-serif", color: "#ECE8DD", fontSize: "1.5rem", letterSpacing: "0.02em" }}>{t.stats_title}</h2>
        <button onClick={onRefresh} className="text-xs px-3 py-1.5 rounded-md" style={{ border: "1px solid #2A2A38", color: "#C9A15A" }}>{t.refresh}</button>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="p-4 rounded-md" style={{ background: "#15151F", border: "1px solid #2A2A38" }}>
          <p className="text-2xl" style={{ color: "#C9A15A", fontFamily: "'Anton', sans-serif" }}>{siteStats.total_views ?? 0}</p>
          <p className="text-xs mt-1" style={{ color: "#8C8A96" }}>{t.total_views}</p>
        </div>
        <div className="p-4 rounded-md" style={{ background: "#15151F", border: "1px solid #2A2A38" }}>
          <p className="text-2xl" style={{ color: "#C9A15A", fontFamily: "'Anton', sans-serif" }}>{siteStats.unique_visitors ?? 0}</p>
          <p className="text-xs mt-1" style={{ color: "#8C8A96" }}>{t.unique_visitors}</p>
        </div>
      </div>

      <h3 className="text-sm font-semibold mt-8 mb-3" style={{ color: "#ECE8DD" }}>{t.top_films_views}</h3>
      <div className="space-y-2">
        {topFilms.map((f, i) => (
          <div key={f.id} className="flex items-center justify-between p-2.5 rounded-md" style={{ background: "#15151F", border: "1px solid #2A2A38" }}>
            <span className="text-sm" style={{ color: "#ECE8DD" }}>{i + 1}. {f.title[lang]}</span>
            <span className="text-xs" style={{ color: "#C9A15A" }}>{f.viewCount} vi</span>
          </div>
        ))}
        {topFilms.length === 0 && <p className="text-sm" style={{ color: "#8C8A96" }}>{t.empty}</p>}
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
  const [myList, setMyList] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]); // {id, label, progress, statusText: 'uploading'|'done'|'error', error}
  const [siteStats, setSiteStats] = useState({ total_views: 0, unique_visitors: 0 });

  useEffect(() => {
    setMyList(getLocalList("hf_my_list"));
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setStaffUser(data.user || null));
    supabase.from("films").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (!error && data && data.length > 0) setFilms(data.map(dbRowToFilm));
    });
    supabase.from("site_settings").select("*").eq("id", 1).single().then(({ data }) => {
      if (data) setSettings(data);
    });
    supabase.from("site_stats").select("*").eq("id", 1).single().then(({ data }) => {
      if (data) setSiteStats(data);
    });

    // Konte vizit la (chak paj chaje) ak vizitè inik (yon fwa pa aparèy)
    supabase.rpc("increment_site_view");
    if (!localStorage.getItem("hf_visited")) {
      localStorage.setItem("hf_visited", "1");
      supabase.rpc("increment_unique_visitor");
    }
  }, []);

  // Rafrechi done yo chak fwa staff louvri Estatistik oswa Jere Fim, pou nimewo yo toujou aktyèl
  useEffect(() => {
    if (view === "stats" || view === "manage" || view === "pending") {
      supabase.from("films").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
        if (!error && data) setFilms(data.map(dbRowToFilm));
      });
      supabase.from("site_stats").select("*").eq("id", 1).single().then(({ data }) => {
        if (data) setSiteStats(data);
      });
    }
  }, [view]);

  async function insertFilm(newFilm, status) {
    let poster_url = null;
    let posterUploadError = null;
    if (newFilm.posterFile) {
      const path = `posters/${Date.now()}-${newFilm.posterFile.name}`;
      const { error: upErr } = await supabase.storage.from("site-assets").upload(path, newFilm.posterFile, { upsert: true });
      if (!upErr) {
        poster_url = supabase.storage.from("site-assets").getPublicUrl(path).data.publicUrl;
      } else {
        posterUploadError = upErr.message || String(upErr);
      }
    }
    const { data, error } = await supabase.from("films").insert({
      title_ht: newFilm.title.ht, title_fr: newFilm.title.fr, title_en: newFilm.title.en,
      desc_ht: newFilm.desc.ht, desc_fr: newFilm.desc.fr, desc_en: newFilm.desc.en,
      genre_key: newFilm.genreKey, year: parseInt(newFilm.year, 10) || null, duration: newFilm.duration,
      status, submitted_name: newFilm.submittedName || null, created_by: staffUser?.id || null,
      poster_url, video_url: newFilm.videoUrl || null, release_date: newFilm.releaseDate || null,
      series_title: newFilm.seriesTitle || null, season_number: newFilm.seasonNumber || null, episode_number: newFilm.episodeNumber || null,
    }).select();
    if (error) {
      return { ok: false, error: error.message || String(error) };
    }
    if (data && data[0]) setFilms((prev) => [dbRowToFilm(data[0]), ...prev]);
    return { ok: true, posterWarning: posterUploadError };
  }

  function updateQueueItem(id, patch) {
    setUploadQueue((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  async function uploadSingleFile(queueId, file, title) {
    const createRes = await fetch(
      "https://hsbifpngubxfkmypkjxn.supabase.co/functions/v1/clever-api",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) }
    );
    const created = await createRes.json();
    if (!createRes.ok) throw new Error(created.error || "Echèk kreyasyon videyo");

    await new Promise((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint: "https://video.bunnycdn.com/tusupload",
        retryDelays: [0, 2000, 5000, 10000, 20000, 30000, 60000],
        chunkSize: 5 * 1024 * 1024,
        headers: {
          AuthorizationSignature: created.signature,
          AuthorizationExpire: String(created.expirationTime),
          VideoId: created.videoId,
          LibraryId: String(created.libraryId),
        },
        metadata: { filetype: file.type, title },
        onError: (err) => reject(err),
        onProgress: (sent, total) => updateQueueItem(queueId, { progress: Math.round((sent / total) * 100) }),
        onSuccess: () => resolve(),
      });
      upload.findPreviousUploads().then((prev) => {
        if (prev.length) upload.resumeFromPreviousUpload(prev[0]);
        upload.start();
      });
    });

    return created.playbackUrl;
  }

  async function queueUpload(formSnapshot, videoFiles, posterFile) {
    const { isStaff, isSerie } = formSnapshot;
    const startEpisode = parseInt(formSnapshot.episodeNumber, 10) || 1;

    for (let i = 0; i < videoFiles.length; i++) {
      const queueId = `${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`;
      const episodeNum = isSerie ? startEpisode + i : null;
      const epTitle = isSerie ? `${formSnapshot.title} S${formSnapshot.seasonNumber || "1"}E${episodeNum}` : formSnapshot.title;
      const label = isSerie ? `${formSnapshot.title} — Ep ${episodeNum}` : formSnapshot.title;

      setUploadQueue((prev) => [...prev, { id: queueId, label, progress: 0, statusText: "uploading", error: null }]);

      try {
        const playbackUrl = await uploadSingleFile(queueId, videoFiles[i], epTitle);
        const insertResult = await insertFilm(
          {
            genreKey: formSnapshot.genreKey, year: formSnapshot.year, duration: formSnapshot.duration || "—",
            title: { ht: formSnapshot.title, fr: formSnapshot.title, en: formSnapshot.title },
            desc: {
              ht: formSnapshot.desc || "Pa gen deskripsyon.",
              fr: formSnapshot.desc || "Pas de description.",
              en: formSnapshot.desc || "No description.",
            },
            submittedName: formSnapshot.name,
            posterFile: i === 0 ? posterFile : null,
            videoUrl: playbackUrl,
            releaseDate: formSnapshot.releaseDate || null,
            seriesTitle: isSerie ? formSnapshot.seriesTitle || formSnapshot.title : null,
            seasonNumber: isSerie ? parseInt(formSnapshot.seasonNumber, 10) || null : null,
            episodeNumber: episodeNum,
          },
          isStaff ? "approved" : "pending"
        );

        if (insertResult && insertResult.ok === false) throw new Error(insertResult.error);

        updateQueueItem(queueId, { statusText: "done", progress: 100 });
        setTimeout(() => setUploadQueue((prev) => prev.filter((q) => q.id !== queueId)), 5000);
      } catch (err) {
        updateQueueItem(queueId, { statusText: "error", error: String(err.message || err) });
      }
    }
  }

  async function handleApprove(id) {
    const { error } = await supabase.from("films").update({ status: "approved" }).eq("id", id);
    if (!error) setFilms((prev) => prev.map((f) => (f.id === id ? { ...f, status: "approved" } : f)));
  }

  async function handleUpdatePoster(filmId, file) {
    const path = `posters/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("site-assets").upload(path, file, { upsert: true });
    if (upErr) return { ok: false, error: upErr.message || String(upErr) };
    const poster_url = supabase.storage.from("site-assets").getPublicUrl(path).data.publicUrl;
    const { error } = await supabase.from("films").update({ poster_url }).eq("id", filmId);
    if (error) return { ok: false, error: error.message || String(error) };
    setFilms((prev) => prev.map((f) => (f.id === filmId ? { ...f, posterUrl: poster_url } : f)));
    return { ok: true };
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
  const approvedAll = films.filter((f) => f.status === "approved");
  const approvedFilms = approvedAll.filter((f) => !isUpcoming(f));
  const featured = approvedFilms.find((f) => f.featured) || approvedFilms[0];

  const continueWatching = useMemo(() => {
    const ids = getLocalList("hf_recent");
    return ids.map((id) => approvedFilms.find((f) => f.id === id)).filter(Boolean);
  }, [approvedFilms, openFilm]);

  const top10 = useMemo(() => {
    return [...approvedFilms].sort((a, b) => b.viewCount - a.viewCount).slice(0, 10);
  }, [approvedFilms]);

  const myListFilms = useMemo(() => {
    return myList.map((id) => approvedFilms.find((f) => f.id === id)).filter(Boolean);
  }, [approvedFilms, myList]);

  const offlineFilms = useMemo(() => {
    const ids = getLocalList("hf_offline");
    return ids.map((id) => approvedFilms.find((f) => f.id === id)).filter(Boolean);
  }, [approvedFilms, openFilm]);

  const existingSeries = useMemo(() => {
    const map = {};
    films.filter((f) => f.genreKey === "serie" && f.seriesTitle).forEach((f) => {
      if (!map[f.seriesTitle]) map[f.seriesTitle] = {};
      const s = f.seasonNumber || 1;
      const ep = f.episodeNumber || 0;
      map[f.seriesTitle][s] = Math.max(map[f.seriesTitle][s] || 0, ep);
    });
    return map; // { "Tit Seri": { 1: 10, 2: 3 } }
  }, [films]);

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

        <div className="hidden sm:flex items-center flex-1 max-w-xs px-3 py-1.5 rounded-full transition-all focus-within:ring-1" style={{ background: "#15151F", border: "1px solid #2A2A38" }}>
          <Search size={14} style={{ color: "#C9A15A" }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search_ph}
            className="bg-transparent outline-none ml-2 text-sm w-full" style={{ color: "#ECE8DD" }} />
          {query && (
            <button onClick={() => setQuery("")} style={{ color: "#8C8A96" }}><X size={14} /></button>
          )}
        </div>

        <button onClick={() => setSearchOpen((o) => !o)} className="sm:hidden p-2 rounded-full" style={{ border: "1px solid #2A2A38", color: "#C9A15A" }}>
          <Search size={16} />
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => setView("offline")} className="hidden sm:flex px-3 py-1.5 rounded-md text-sm items-center gap-1.5"
            style={{ color: view === "offline" ? "#0A0A10" : "#ECE8DD", background: view === "offline" ? "#C9A15A" : "transparent" }}>
            ⬇ {t.nav_offline}
          </button>

          <button onClick={() => setView("mylist")} className="hidden sm:flex px-3 py-1.5 rounded-md text-sm items-center gap-1.5"
            style={{ color: view === "mylist" ? "#0A0A10" : "#ECE8DD", background: view === "mylist" ? "#C9A15A" : "transparent" }}>
            ✓ {t.my_list}
          </button>

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
                    <button onClick={() => { setView("manage"); setStaffOpen(false); }} className="block w-full text-left px-3.5 py-2 text-sm whitespace-nowrap" style={{ color: "#ECE8DD" }}>{t.manage_films}</button>
                    <button onClick={() => { setView("stats"); setStaffOpen(false); }} className="block w-full text-left px-3.5 py-2 text-sm whitespace-nowrap" style={{ color: "#ECE8DD" }}>{t.stats_title}</button>
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

      {searchOpen && (
        <div className="sm:hidden flex items-center gap-2 px-5 py-2.5" style={{ background: "#0A0A10", borderBottom: "1px solid #2A2A38" }}>
          <div className="flex items-center flex-1 px-3 py-2 rounded-full" style={{ background: "#15151F", border: "1px solid #2A2A38" }}>
            <Search size={14} style={{ color: "#C9A15A" }} />
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search_ph}
              className="bg-transparent outline-none ml-2 text-sm w-full" style={{ color: "#ECE8DD" }} />
          </div>
          <button onClick={() => { setSearchOpen(false); setQuery(""); }} style={{ color: "#8C8A96" }}><X size={18} /></button>
        </div>
      )}

      {(view === "catalog") && <GenreNav t={t} onSelect={scrollToGenre} />}

      {view === "upload" ? (
        staffUser ? <UploadForm lang={lang} t={t} isStaff={true} onQueueUpload={queueUpload} existingSeries={existingSeries} /> : <LoginGate lang={lang} onLoggedIn={setStaffUser} />
      ) : view === "community" ? (
        <UploadForm lang={lang} t={t} isStaff={false} onQueueUpload={queueUpload} existingSeries={existingSeries} />
      ) : view === "settings" && staffUser ? (
        <SettingsView t={t} settings={settings} onSave={handleSaveSettings} />
      ) : view === "pending" && staffUser ? (
        <PendingView t={t} lang={lang} films={films} onApprove={handleApprove} />
      ) : view === "manage" && staffUser ? (
        <ManageFilmsView t={t} lang={lang} films={films} onUpdatePoster={handleUpdatePoster} />
      ) : view === "stats" && staffUser ? (
        <StatsView t={t} lang={lang} films={films} siteStats={siteStats} onRefresh={() => {
          supabase.from("films").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
            if (!error && data) setFilms(data.map(dbRowToFilm));
          });
          supabase.from("site_stats").select("*").eq("id", 1).single().then(({ data }) => {
            if (data) setSiteStats(data);
          });
        }} />
      ) : view === "mylist" ? (
        <div className="px-5 sm:px-10 py-10">
          <h2 style={{ fontFamily: "'Anton', sans-serif", color: "#ECE8DD", fontSize: "1.5rem", letterSpacing: "0.02em" }}>{t.my_list}</h2>
          <div className="flex flex-wrap gap-4 mt-5">
            {myListFilms.map((f) => <FilmCard key={f.id} film={f} lang={lang} t={t} onOpen={setOpenFilm} myList={myList} setMyList={setMyList} />)}
            {myListFilms.length === 0 && <p className="text-sm" style={{ color: "#8C8A96" }}>{t.empty}</p>}
          </div>
        </div>
      ) : view === "offline" ? (
        <div className="px-5 sm:px-10 py-10">
          <h2 style={{ fontFamily: "'Anton', sans-serif", color: "#ECE8DD", fontSize: "1.5rem", letterSpacing: "0.02em" }}>{t.nav_offline}</h2>
          <div className="flex flex-wrap gap-4 mt-5">
            {offlineFilms.map((f) => <FilmCard key={f.id} film={f} lang={lang} t={t} onOpen={setOpenFilm} myList={myList} setMyList={setMyList} />)}
            {offlineFilms.length === 0 && <p className="text-sm" style={{ color: "#8C8A96" }}>{t.no_offline}</p>}
          </div>
        </div>
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
              {searchResults.map((f) => <FilmCard key={f.id} film={f} lang={lang} t={t} onOpen={setOpenFilm} myList={myList} setMyList={setMyList} />)}
              {searchResults.length === 0 && <p className="text-sm py-10" style={{ color: "#8C8A96" }}>{t.empty}</p>}
            </div>
          ) : (
            <div className="py-4 pb-16">
              <ComingSoonRow films={approvedAll} lang={lang} t={t} />
              <SimpleRow title={t.continue_watching} list={continueWatching} lang={lang} t={t} onOpen={setOpenFilm} myList={myList} setMyList={setMyList} />
              <SimpleRow title={t.top10} list={top10} lang={lang} t={t} onOpen={setOpenFilm} myList={myList} setMyList={setMyList} />
              {GENRE_KEYS.map((g) => <Row key={g} genreKey={g} films={approvedFilms} lang={lang} t={t} onOpen={setOpenFilm} myList={myList} setMyList={setMyList} />)}
            </div>
          )}
        </>
      )}

      <DetailModal film={openFilm} lang={lang} t={t} onClose={() => setOpenFilm(null)} allFilms={films} myList={myList} setMyList={setMyList} onOpen={setOpenFilm} />

      {uploadQueue.length > 0 && (
        <div className="fixed bottom-3 right-3 left-3 sm:left-auto sm:w-80 z-50 space-y-2">
          {uploadQueue.map((q) => (
            <div key={q.id} className="rounded-md p-3 shadow-lg" style={{ background: "#15151F", border: "1px solid #2A2A38" }}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs truncate pr-2" style={{ color: "#ECE8DD", fontWeight: 600 }}>{q.label}</p>
                {q.statusText === "done" && <Check size={14} style={{ color: "#7BB88A" }} />}
              </div>
              {q.statusText === "error" ? (
                <p className="text-[11px]" style={{ color: "#D98080" }}>{q.error}</p>
              ) : (
                <>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1D1D29" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${q.progress}%`, background: q.statusText === "done" ? "#7BB88A" : "#C9A15A" }} />
                  </div>
                  <p className="text-[10px] mt-1" style={{ color: "#8C8A96" }}>{q.statusText === "done" ? "Fini!" : `${q.progress}%`}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
