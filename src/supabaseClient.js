// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hsbifpngubxfkmypkjxn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_88P3M5z86-tvAfD4WYpy9g_5zEyZzYM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
