import { supabase } from "../database/supabase.js";

// helper func
const ok = (data, error, action) => {
  if (error) {
    throw new Error(`${action} failed: ${error.message}`);
  }
  return data;
};

// SELECT: fetch all properties
export async function getProperties() {
  const { data, error } = await supabase
    .from("Property")
    .select("*")
    .order("property_id", { ascending: true });

  if (error) {
    throw new Error(`Fetch failed: ${error.message}`);
  }

  return data;
}

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

// Upload immediately after selection
export async function uploadPropertyImage(file) {
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = fileName;

  const { error } = await supabase.storage
    .from("property-images")
    .upload(filePath, file);

  if (error) throw error;

  const { data: publicData } = supabase.storage
    .from("property-images")
    .getPublicUrl(filePath);

  return { publicUrl: publicData.publicUrl, filePath };
}

// Remove uploaded files if user cancels
export async function deletePropertyImages(filePaths) {
  if (!filePaths || filePaths.length === 0) return;
  const { error } = await supabase.storage
    .from("property-images")
    .remove(filePaths);
  if (error) throw error;
}
