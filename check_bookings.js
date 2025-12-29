import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fqkzqxnfqvqauzfhfvxc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxa3pxeG5mcXZxYXV6ZmhmdnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5OTU2NDQsImV4cCI6MjA1MDU3MTY0NH0.nNLPEBqxgvTIRGVTqXBEZJnJdKRxJhKnEVRBwXhSVjc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBookings() {
    console.log('🔍 Verificando reservas...\n');

    // 1. Check current user
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 Usuario actual:', user?.email || 'No autenticado');

    // 2. Check profile
    if (user) {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        console.log('📋 Perfil:', profile);
        if (profileError) console.error('❌ Error perfil:', profileError);
    }

    // 3. Check bookings with profiles
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
            *,
            vehicles ( make, model, image_url, year ),
            profiles ( full_name, email, phone, dni )
        `)
        .order('created_at', { ascending: false });

    console.log('\n📊 Reservas encontradas:', bookings?.length || 0);

    if (error) {
        console.error('❌ Error al obtener reservas:', error);
    } else {
        console.log('✅ Reservas:', bookings);

        // Check if profiles are being loaded
        bookings?.forEach((b, i) => {
            console.log(`\nReserva ${i + 1}:`, {
                id: b.id.slice(0, 8),
                vehicle: `${b.vehicles?.make} ${b.vehicles?.model}`,
                profile: b.profiles,
                user_id: b.user_id
            });
        });
    }

    // 4. Check RLS policies
    console.log('\n🔒 Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase
        .rpc('get_policies', { table_name: 'bookings' })
        .catch(() => ({ data: null, error: 'RPC not available' }));

    if (policies) {
        console.log('Políticas:', policies);
    }
}

checkBookings().catch(console.error);
