// Bookmark utility functions for managing saved properties

import { supabase } from "../database/supabase";

/**
 * Add a property to user's bookmarks
 */
export async function addBookmark(userId, propertyId) {
  try {
    const { data, error } = await supabase
      .from("Bookmarks")
      .insert({
        buyer_id: userId,
        property_id: propertyId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding bookmark:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error adding bookmark:", error);
    return { success: false, error };
  }
}

/**
 * Remove a property from user's bookmarks
 */
export async function removeBookmark(userId, propertyId) {
  try {
    const { error } = await supabase
      .from("Bookmarks")
      .delete()
      .eq("buyer_id", userId)
      .eq("property_id", propertyId);

    if (error) {
      console.error("Error removing bookmark:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing bookmark:", error);
    return { success: false, error };
  }
}

/**
 * Check if a property is bookmarked by user
 */
export async function isBookmarked(userId, propertyId) {
  try {
    const { data, error } = await supabase
      .from("Bookmarks")
      .select("bookmark_id")
      .eq("buyer_id", userId)
      .eq("property_id", propertyId)
      .maybeSingle();

    if (error) {
      console.error("Error checking bookmark:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking bookmark:", error);
    return false;
  }
}

/**
 * Get all bookmarked properties for a user
 */
export async function getUserBookmarks(userId) {
  try {
    console.log("📚 Getting bookmarks for user:", userId);

    // First get all bookmarks for the user
    const { data: bookmarks, error: bookmarkError } = await supabase
      .from("Bookmarks")
      .select("*")
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false });

    console.log("📚 Bookmarks query result:", { bookmarks, bookmarkError });

    if (bookmarkError) {
      console.error("Error fetching bookmarks:", bookmarkError);
      return { success: false, error: bookmarkError, bookmarks: [] };
    }

    if (!bookmarks || bookmarks.length === 0) {
      console.log("📚 No bookmarks found for user");
      return { success: true, bookmarks: [] };
    }

    console.log(
      "📚 Found",
      bookmarks.length,
      "bookmarks, fetching properties..."
    );

    // Then get property details for each bookmark
    const bookmarksWithProperties = [];
    for (const bookmark of bookmarks) {
      try {
        console.log("📚 Fetching property:", bookmark.property_id);
        const { data: property, error: propertyError } = await supabase
          .from("Property")
          .select("*")
          .eq("property_id", bookmark.property_id)
          .single();

        console.log("📚 Property result:", { property, propertyError });

        if (!propertyError && property) {
          bookmarksWithProperties.push({
            ...bookmark,
            Property: property,
          });
        }
      } catch (err) {
        console.error(`Error fetching property ${bookmark.property_id}:`, err);
        // Continue with other bookmarks even if one fails
      }
    }

    console.log(
      "📚 Final bookmarks with properties:",
      bookmarksWithProperties.length
    );
    return { success: true, bookmarks: bookmarksWithProperties };
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return { success: false, error, bookmarks: [] };
  }
}

/**
 * Toggle bookmark status for a property
 */
export async function toggleBookmark(userId, propertyId) {
  try {
    const isCurrentlyBookmarked = await isBookmarked(userId, propertyId);

    if (isCurrentlyBookmarked) {
      return await removeBookmark(userId, propertyId);
    } else {
      return await addBookmark(userId, propertyId);
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return { success: false, error };
  }
}
