import { supabase } from "../database/supabase.js";

export async function fetchContractors() {
  const { data, error } = await supabase.from("Contractor").select("*");
  if (error) {
    console.error("Error fetching contractors:", error);
  }

  return data;
}
