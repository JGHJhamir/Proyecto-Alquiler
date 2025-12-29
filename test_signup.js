
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wancdsnnloiqjdnnopeq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbmNkc25ubG9pcWpkbm5vcGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDMwNjUsImV4cCI6MjA4MTkxOTA2NX0.Nvv2miTfjMTFP5ch6oQD4hXyWJJMTt2i0d8efZRV05s'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSignup() {
    const email = `testuser_${Date.now()}@example.com`
    const password = 'password123'

    console.log(`Attempting signup for ${email}...`)

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Test User',
                dni: '12345678',
                document_type: 'dni',
                birth_date: '1990-01-01',
                country: 'Perú'
            }
        }
    })

    if (error) {
        console.error('Signup Error:', error)
    } else {
        console.log('Signup Success:', data)
    }
}

testSignup()
