import supabase from "../database/supabase.js";

const ok = (data, error, action) => {
  if (error) {
    throw new Error(`${action} failed: ${error.message}`);
  }
  return data;
};

// INSERT: create a property
export async function insertProperty(payload) {
  const { data, error } = await supabase
    .from("Property")
    .insert(payload)
    .select("*")
    .single();
  return ok(data, error, "Insert");
}

// UPDATE: patch fields by id
export async function updateProperty(id, patch) {
  const { data, error } = await supabase
    .from("Property")
    .update(patch)
    .eq("property_id", id)
    .select("*")
    .single();
  return ok(data, error, "Update");
}

// DELETE: remove by id
export async function deleteProperty(id) {
  const { data, error } = await supabase
    .from("Property")
    .delete()
    .eq("property_id", id)
    .select("*")
    .single();
  return ok(data, error, "Delete");
}
