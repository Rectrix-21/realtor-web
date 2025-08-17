import { supabase } from "../database/supabase.js";

// helper func
const ok = (data, error, action) => {
  if (error) {
    throw new Error(`${action} failed: ${error.message}`);
  }
  return data;
};

// Fetch a property by id
export async function getPropertyById(id) {
  const { data, error } = await supabase
    .from("Property")
    .select("*")
    .eq("property_id", id)
    .single();

  return ok(data, error, "Fetch by ID");
}

// SELECT: fetch all properties
export async function getProperties() {
  const { data, error } = await supabase
    .from("Property")
    .select("*")
    .order("property_id", { ascending: true });

  return ok(data, error, "Fetch all properties");
}

// INSERT: create a property
export async function insertProperty(payload) {
  // Force buyer_id to null if not provided
  if (!payload.buyer_id) {
    payload.buyer_id = null;
  }

  console.log("Inserting property with payload:", payload);
  const { data, error } = await supabase
    .from("Property")
    .insert(payload)
    .select("*")
    .single();

  return ok(data, error, "Insert");
}

// UPDATE: patch fields by id
export async function updateProperty(id, patch) {
  console.log("Updating property with id:", id, "and patch:", patch);
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
