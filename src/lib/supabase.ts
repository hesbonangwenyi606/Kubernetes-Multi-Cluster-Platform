import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://sgnrpkrghpruhildzfsw.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjM5N2U1NWM2LTRmYmMtNGFjYS05OWZiLWIyODk3YTU5MTFkMiJ9.eyJwcm9qZWN0SWQiOiJzZ25ycGtyZ2hwcnVoaWxkemZzdyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzgzMjQ0MjkwLCJleHAiOjIwOTg2MDQyOTAsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.tG3_x3NoTmIHSFOCu0eJlQsCUl8Jco6PcW52fXo88TE';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };