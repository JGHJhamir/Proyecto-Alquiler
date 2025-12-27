
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wancdsnnloiqjdnnopeq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbmNkc25ubG9pcWpkbm5vcGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDMwNjUsImV4cCI6MjA4MTkxOTA2NX0.Nvv2miTfjMTFP5ch6oQD4hXyWJJMTt2i0d8efZRV05s'
const supabase = createClient(supabaseUrl, supabaseKey)

async function debugVehicle() {
    const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id, description')
        .ilike('make', '%Toyota%')

    vehicles.forEach(v => {
        console.log(`ID: ${v.id}`)
        console.log(`DESC: ${v.description ? v.description.substring(0, 50) + '...' : 'NULL'}`)
    })
}

debugVehicle()
