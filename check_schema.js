
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wancdsnnloiqjdnnopeq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbmNkc25ubG9pcWpkbm5vcGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDMwNjUsImV4cCI6MjA4MTkxOTA2NX0.Nvv2miTfjMTFP5ch6oQD4hXyWJJMTt2i0d8efZRV05s'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTable() {
    console.log('Checking for promotions table...')
    const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .limit(1)

    if (error) {
        console.log('Error Code:', error.code)
        // code 42P01 is undefined_table
        if (error.code === '42P01' || error.message.includes('relation "promotions" does not exist')) {
            console.log('STATUS: MISSING')
        } else {
            console.log('STATUS: ERROR ' + error.message)
        }
    } else {
        console.log('STATUS: EXISTS')
    }
}

checkTable()
