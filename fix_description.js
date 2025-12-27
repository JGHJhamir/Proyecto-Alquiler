
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wancdsnnloiqjdnnopeq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbmNkc25ubG9pcWpkbm5vcGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDMwNjUsImV4cCI6MjA4MTkxOTA2NX0.Nvv2miTfjMTFP5ch6oQD4hXyWJJMTt2i0d8efZRV05s'
const supabase = createClient(supabaseUrl, supabaseKey)

async function fixDescription() {
    const newDescription = "Camioneta 4x4 de alto rendimiento, motor 2.8 Turbo Diésel, transmisión automática, full equipo con aire acondicionado, pantalla táctil y suspensión deportiva ideal para todo terreno"

    const { data, error } = await supabase
        .from('vehicles')
        .update({ description: newDescription })
        .ilike('make', '%Toyota%')
        .ilike('model', '%Hilux%')
        .select()

    if (error) {
        console.error('Error updating:', error)
    } else {
        console.log('Updated successfully:', JSON.stringify(data, null, 2))
    }
}

fixDescription()
