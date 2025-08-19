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
  const { data, error } = await supabase.from("Property").select("*");

  console.log("getProperties result:", { data: data?.length, error });
  if (data && data.length > 0) {
    console.log("Sample property:", data[0]);
    console.log(
      "All basement_type values in existing data:",
      data
        .map((p) => p.basement_type)
        .filter((value, index, self) => self.indexOf(value) === index)
    );
  }

  return ok(data, error, "Fetch all properties");
} // INSERT: create a property
export async function insertProperty(payload) {
  // Handle UUID fields - convert empty strings to null
  if (!payload.buyer_id || payload.buyer_id.trim() === "") {
    payload.buyer_id = null;
  }

  // Handle basement_type - must provide a valid non-null value
  if (!payload.basement_type || payload.basement_type.trim() === "") {
    // Use one of the allowed values: 'c', 'w', 'f', 'p'
    payload.basement_type = "c"; // Default to 'c' (likely crawl space or concrete)
  }

  // Handle text fields - convert empty strings to appropriate values
  if (!payload.property_kind || payload.property_kind.trim() === "") {
    payload.property_kind = "H"; // Default single character (House)
  } else if (payload.property_kind.length !== 1) {
    // If user provides more than 1 character, take first letter and capitalize
    payload.property_kind = payload.property_kind.charAt(0).toUpperCase();
  }
  if (!payload.description || payload.description.trim() === "") {
    payload.description = null;
  }

  // Handle status field - provide default value if missing or null
  if (
    payload.status === null ||
    payload.status === undefined ||
    payload.status === ""
  ) {
    payload.status = 1; // Default status code (1 = active)
  }

  // Handle lot_size field - provide default value if missing or null
  if (payload.lot_size === null || payload.lot_size === undefined) {
    payload.lot_size = 0; // Default lot size
  }

  console.log("Inserting property with payload:", payload);
  console.log(
    "Basement type value:",
    payload.basement_type,
    "Type:",
    typeof payload.basement_type
  );

  const { data, error } = await supabase
    .from("Property")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Insert error details:", error);
  }

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

// DELETE: remove by id (also removes related bookmarks and viewing requests)
export async function deleteProperty(id) {
  console.log(
    "Starting delete process for property ID:",
    id,
    "Type:",
    typeof id
  );

  try {
    // First attempt: Try using the database function for cascade delete
    console.log("Attempting cascade delete using database function...");
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "delete_property_cascade",
      {
        property_id_param: id,
      }
    );

    if (!rpcError && rpcResult && rpcResult.success) {
      console.log(
        "Property deleted successfully via database function:",
        rpcResult
      );
      return rpcResult.deleted_property;
    }

    console.log(
      "Database function not available or failed, falling back to manual deletion..."
    );
    console.log("RPC Error:", rpcError);

    // Fallback: Manual deletion with even more robust approach
    // Step 1: Check if the property exists
    console.log("Step 0: Verifying property exists...");
    const { data: existingProperty, error: checkError } = await supabase
      .from("Property")
      .select("property_id")
      .eq("property_id", id);

    console.log("Property query result:", {
      data: existingProperty,
      error: checkError,
    });

    if (checkError) {
      console.error("Database error while checking property:", checkError);
      throw new Error(`Database error: ${checkError.message}`);
    }

    if (!existingProperty || existingProperty.length === 0) {
      console.error("Property not found in database");
      throw new Error("Property not found");
    }

    const property = existingProperty[0];
    console.log(`Found property with ID: ${property.property_id}`);

    // Step 2: Force delete all bookmarks using individual IDs
    console.log("Step 1: Force deleting bookmarks individually...");
    const { data: allBookmarks, error: bookmarkSelectError } = await supabase
      .from("Bookmarks")
      .select("bookmark_id")
      .eq("property_id", id);

    if (bookmarkSelectError) {
      console.error("Error selecting bookmarks:", bookmarkSelectError);
    } else if (allBookmarks && allBookmarks.length > 0) {
      console.log(
        `Found ${allBookmarks.length} bookmarks to delete individually...`
      );

      // Delete each bookmark individually
      for (const bookmark of allBookmarks) {
        const { error: individualDeleteError } = await supabase
          .from("Bookmarks")
          .delete()
          .eq("bookmark_id", bookmark.bookmark_id);

        if (individualDeleteError) {
          console.error(
            `Error deleting bookmark ${bookmark.bookmark_id}:`,
            individualDeleteError
          );
        } else {
          console.log(`Deleted bookmark ${bookmark.bookmark_id}`);
        }
        // Small delay between individual deletions
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } else {
      console.log("No bookmarks to delete");
    }

    // Step 3: Delete viewing requests
    console.log("Step 2: Deleting viewing requests...");
    const { data: viewingRequests, error: viewingSelectError } = await supabase
      .from("ViewingRequests")
      .select("request_id")
      .eq("property_id", id);

    if (viewingSelectError) {
      console.error("Error selecting viewing requests:", viewingSelectError);
    } else if (viewingRequests && viewingRequests.length > 0) {
      console.log(`Deleting ${viewingRequests.length} viewing requests...`);
      const { error: viewingDeleteError } = await supabase
        .from("ViewingRequests")
        .delete()
        .eq("property_id", id);

      if (viewingDeleteError) {
        console.error("Error deleting viewing requests:", viewingDeleteError);
      } else {
        console.log("Viewing requests deleted successfully");
      }
    } else {
      console.log("No viewing requests to delete");
    }

    // Step 4: Wait and verify cleanup
    console.log("Step 3: Waiting for database consistency...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify no bookmarks remain
    const { data: remainingBookmarks } = await supabase
      .from("Bookmarks")
      .select("bookmark_id")
      .eq("property_id", id);

    if (remainingBookmarks && remainingBookmarks.length > 0) {
      console.error(
        `ERROR: ${remainingBookmarks.length} bookmarks still exist!`
      );
      throw new Error(
        `Cannot delete property - ${remainingBookmarks.length} bookmarks still exist despite deletion attempts`
      );
    }

    console.log("Verified: All related records cleaned up");

    // Step 5: Delete the property
    console.log("Step 4: Deleting the property...");
    const { data: deletedProperty, error: propertyError } = await supabase
      .from("Property")
      .delete()
      .eq("property_id", id)
      .select("*")
      .single();

    if (propertyError) {
      console.error("Error deleting property:", propertyError);
      throw new Error(`Failed to delete property: ${propertyError.message}`);
    }

    console.log("Property deleted successfully:", deletedProperty.property_id);
    return deletedProperty;
  } catch (error) {
    console.error("Delete operation failed:", error);
    throw error;
  }
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
