
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wancdsnnloiqjdnnopeq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbmNkc25ubG9pcWpkbm5vcGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDMwNjUsImV4cCI6MjA4MTkxOTA2NX0.Nvv2miTfjMTFP5ch6oQD4hXyWJJMTt2i0d8efZRV05s'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumns() {
    console.log('Checking profiles columns...')
    // Try to select the new columns. If they don't exist, this should error.
    const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .limit(1)

    if (error) {
        console.log('Error:', error.message)
    } else {
        console.log('Columns exist. Data:', data)
    }
}

checkColumns()
