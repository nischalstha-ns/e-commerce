import { supabase } from "../client";

export const addAdmin = async ({ email, name }) => {
    if (!supabase) {
        throw new Error("Supabase is not initialized. Please check your configuration.");
    }
    
    if (!email) {
        throw new Error("Email is required");
    }
    if (!name) {
        throw new Error("Name is required");
    }

    try {
        // Check if admin already exists
        const { data: existingAdmin, error: checkError } = await supabase
            .from('admins')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existingAdmin) {
            throw new Error("This email is already registered as an admin");
        }

        // Create new admin
        const { data, error } = await supabase
            .from('admins')
            .insert({
                email: email.toLowerCase(),
                name,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return { id: data.id };
    } catch (error) {
        console.error("Error adding admin:", error);
        throw error;
    }
};

export const deleteAdmin = async ({ id }) => {
    if (!supabase) {
        throw new Error("Supabase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("Admin ID is required");
    }

    try {
        const { error } = await supabase
            .from('admins')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error("Error deleting admin:", error);
        throw error;
    }
};