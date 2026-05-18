import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://moazfduqhsegbfviyztf.supabase.co';
const supabaseAnonKey = 'sb_publishable_rPmM7W6LpuRfB4I5aglijw_5WzkggBe';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
