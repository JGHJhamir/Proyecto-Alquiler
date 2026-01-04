
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client for testing logic
const mockPromo = {
    min_rental_hours: "0", // Simulate string "0" which might cause issues if not handled
    discount_type: "percentage",
    discount_value: 10
};

const mockPromoNull = {
    min_rental_hours: null, // Simulate null
};

const mockPromoEmpty = {
    min_rental_hours: "", // Simulate empty string
};

function checkPromo(promo, rentalHours) {
    const minHours = Number(promo.min_rental_hours) || 0;
    console.log(`Checking promo with min_rental_hours: ${promo.min_rental_hours} (Parsed: ${minHours}) against ${rentalHours}h rental.`);

    if (minHours > 0 && rentalHours < minHours) {
        console.log("❌ BLOCKED: Minimum hours not met.");
        return false;
    }
    console.log("✅ ALLOWED");
    return true;
}

console.log("--- Testing Fix Logic ---");
checkPromo(mockPromo, 2);      // Should be ALLOWED
checkPromo(mockPromoNull, 2);  // Should be ALLOWED
checkPromo(mockPromoEmpty, 2); // Should be ALLOWED
checkPromo({ min_rental_hours: 24 }, 2); // Should be BLOCKED
checkPromo({ min_rental_hours: "24" }, 2); // Should be BLOCKED
